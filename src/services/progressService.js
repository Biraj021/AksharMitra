/**
 * src/services/progressService.js
 * Data-access service for Learner Progress & Activity Stars.
 * Tracks per-activity best scores, completion milestones, and cumulative stars.
 */

import { supabase, isSupabaseConfigured, ensureAuthSession } from '../lib/supabaseClient.js';
import { enqueueOfflineMutation, setLocalCache, getLocalCache } from './offlineSyncService.js';
import { isDemoProfile } from './learnerService.js';

export async function saveLearnerProgress({
  learnerId,
  activityId,
  completed = true,
  score = 0,
  stars = 5
}) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return { success: true };
  }

  const cacheKey = `progress_${learnerId}`;
  const cached = getLocalCache(cacheKey) || {};
  const current = cached[activityId] || { bestScore: 0, stars: 0, completed: false };

  cached[activityId] = {
    completed: completed || current.completed,
    bestScore: Math.max(current.bestScore || 0, score || 0),
    stars: (current.stars || 0) + (stars || 0),
    lastPlayedAt: new Date().toISOString()
  };
  setLocalCache(cacheKey, cached);

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, offline: true };
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('SAVE_PROGRESS', { learnerId, activityId, completed, score, stars });
      return { success: true, offline: true };
    }

    const payload = {
      learner_id: learnerId,
      user_id: user.id,
      activity_id: activityId,
      completed: cached[activityId].completed,
      best_score: cached[activityId].bestScore,
      stars: cached[activityId].stars,
      last_played_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('learner_progress')
      .upsert(payload, { onConflict: 'learner_id,activity_id' });

    if (error) {
      console.warn('[ProgressService] Error upserting progress:', error.message);
      enqueueOfflineMutation('SAVE_PROGRESS', { learnerId, activityId, completed, score, stars });
    }

    return { success: true };
  } catch (err) {
    console.warn('[ProgressService] Exception saving progress:', err);
    enqueueOfflineMutation('SAVE_PROGRESS', { learnerId, activityId, completed, score, stars });
    return { success: true, offline: true };
  }
}

export async function getLearnerProgress(learnerId) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return {};
  }

  const cached = getLocalCache(`progress_${learnerId}`) || {};

  if (!isSupabaseConfigured() || !supabase) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('learner_progress')
      .select('*')
      .eq('learner_id', learnerId);

    if (error || !data) {
      return cached;
    }

    const mapped = {};
    for (const row of data) {
      mapped[row.activity_id] = {
        completed: row.completed,
        bestScore: row.best_score,
        stars: row.stars,
        lastPlayedAt: row.last_played_at
      };
    }

    setLocalCache(`progress_${learnerId}`, mapped);
    return mapped;
  } catch (err) {
    console.warn('[ProgressService] Error fetching progress:', err);
    return cached;
  }
}
