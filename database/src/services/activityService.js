/**
 * src/services/activityService.js
 * Data-access service for Activity Attempts and granular metric results.
 * Records:
 * - activity_attempts
 * - reading_results
 * - speech_results (Strict null if microphone unavailable; never fake 0)
 * - tracing_results
 * - game_results
 */

import { supabase, isSupabaseConfigured, ensureAuthSession } from '../lib/supabaseClient.js';
import { enqueueOfflineMutation, setLocalCache, getLocalCache } from './offlineSyncService.js';
import { isDemoProfile } from './learnerService.js';

export async function saveActivityAttempt({
  learnerId,
  activityId,
  activityType = 'game',
  language = 'en',
  score = 0,
  starsEarned = 5,
  durationSeconds = 0,
  metricUpdates = {}
}) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return { success: true, offline: true };
  }

  // Update local cached activity log
  const cacheKey = `activities_${learnerId}`;
  const cachedAttempts = getLocalCache(cacheKey) || [];
  const attemptPayload = {
    id: `att_${Date.now()}`,
    learnerId,
    activityId,
    activityType,
    language,
    score,
    starsEarned,
    durationSeconds,
    metricUpdates,
    createdAt: new Date().toISOString()
  };

  setLocalCache(cacheKey, [attemptPayload, ...cachedAttempts]);

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, attempt: attemptPayload, offline: true };
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('SAVE_ACTIVITY_ATTEMPT', attemptPayload);
      return { success: true, attempt: attemptPayload, offline: true };
    }

    // 1. Insert primary activity attempt
    const { data: attemptRow, error: attemptError } = await supabase
      .from('activity_attempts')
      .insert([{
        learner_id: learnerId,
        user_id: user.id,
        activity_id: activityId,
        activity_type: activityType,
        language: language === 'bengali' ? 'bn' : (language === 'hindi' ? 'hi' : (language || 'en')),
        score: score || 0,
        stars_earned: starsEarned || 0,
        duration_seconds: durationSeconds || 0,
        completed: true
      }])
      .select()
      .single();

    if (attemptError || !attemptRow) {
      console.warn('[ActivityService] Error saving attempt, queuing offline:', attemptError?.message);
      enqueueOfflineMutation('SAVE_ACTIVITY_ATTEMPT', attemptPayload);
      return { success: true, attempt: attemptPayload, offline: true };
    }

    const attemptId = attemptRow.id;

    // 2. Insert specialized metric details based on activity type & metric updates
    // A) Reading Results
    if (metricUpdates.wpm !== undefined || activityType === 'reading') {
      await supabase.from('reading_results').insert([{
        activity_attempt_id: attemptId,
        learner_id: learnerId,
        wpm: metricUpdates.wpm !== undefined ? metricUpdates.wpm : null,
        accuracy: metricUpdates.accuracy !== undefined ? metricUpdates.accuracy : null,
        words_completed: metricUpdates.wordsCompleted || 0,
        fluency_hesitation: metricUpdates.fluencyHesitation !== undefined ? metricUpdates.fluencyHesitation : null
      }]);
    }

    // B) Speech / Phonological Results
    // Strict rule: If speech was unavailable or null, phonological_score is null (never fake 0)
    if (metricUpdates.phonologicalScore !== undefined || activityType === 'phonics') {
      await supabase.from('speech_results').insert([{
        activity_attempt_id: attemptId,
        learner_id: learnerId,
        phonological_score: metricUpdates.phonologicalScore !== undefined ? metricUpdates.phonologicalScore : null,
        accuracy: metricUpdates.speechAccuracy !== undefined ? metricUpdates.speechAccuracy : null,
        availability: metricUpdates.speechAvailable !== false
      }]);
    }

    // C) Tracing Results
    if (metricUpdates.tracingAccuracy !== undefined || metricUpdates.reversalIndex !== undefined || activityType === 'tracing') {
      await supabase.from('tracing_results').insert([{
        activity_attempt_id: attemptId,
        learner_id: learnerId,
        letter: metricUpdates.letter || null,
        accuracy: metricUpdates.tracingAccuracy !== undefined ? metricUpdates.tracingAccuracy : null,
        reversal_index: metricUpdates.reversalIndex !== undefined ? metricUpdates.reversalIndex : null,
        adherence: metricUpdates.adherence !== undefined ? metricUpdates.adherence : null
      }]);
    }

    // D) Game Results
    if (activityType === 'game' || metricUpdates.mistakes !== undefined || metricUpdates.lastLetterHunterAccuracy !== undefined) {
      await supabase.from('game_results').insert([{
        activity_attempt_id: attemptId,
        learner_id: learnerId,
        game_id: activityId,
        score: score || 0,
        mistakes: metricUpdates.mistakes || 0,
        hints_used: metricUpdates.hintsUsed || 0
      }]);
    }

    return { success: true, attempt: attemptRow };
  } catch (err) {
    console.warn('[ActivityService] Exception saving activity attempt:', err);
    enqueueOfflineMutation('SAVE_ACTIVITY_ATTEMPT', attemptPayload);
    return { success: true, attempt: attemptPayload, offline: true };
  }
}

/**
 * Fetches recent activity history for a learner.
 */
export async function getLearnerActivities(learnerId, limit = 20) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return [];
  }

  const cached = getLocalCache(`activities_${learnerId}`) || [];

  if (!isSupabaseConfigured() || !supabase) {
    return cached.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('activity_attempts')
      .select('*')
      .eq('learner_id', learnerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return cached.slice(0, limit);
    }

    return data;
  } catch (err) {
    console.warn('[ActivityService] Error fetching activities:', err);
    return cached.slice(0, limit);
  }
}
