/**
 * src/services/parentObservationService.js
 * Data-access service for Parent Observations.
 * Strictly preserves categorical responses and nulls (never treats null as zero).
 * Operates with Row Level Security and offline caching.
 */

import { supabase, isSupabaseConfigured, ensureAuthSession } from '../lib/supabaseClient.js';
import { enqueueOfflineMutation, setLocalCache, getLocalCache } from './offlineSyncService.js';
import { isDemoProfile } from './learnerService.js';
import { createEmptyParentFeedback } from '../utils/parentFeedbackModel.js';

/**
 * Saves or updates a parent observation record for a learner in Supabase.
 */
export async function saveParentObservation(learnerId, feedbackData) {
  if (!learnerId || !feedbackData || isDemoProfile(learnerId)) {
    return feedbackData;
  }

  // Update local cache optimistically
  setLocalCache(`parent_obs_${learnerId}`, feedbackData);

  if (!isSupabaseConfigured() || !supabase) {
    return feedbackData;
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('SAVE_PARENT_OBSERVATION', { learnerId, feedbackData });
      return feedbackData;
    }

    const payload = {
      learner_id: learnerId,
      user_id: user.id,
      reading: feedbackData.reading || {},
      sounds: feedbackData.sounds || {},
      writing: feedbackData.writing || {},
      understanding: feedbackData.understanding || {},
      optional_note: (feedbackData.parentObservation || '').trim(),
      updated_at: new Date().toISOString()
    };

    // Upsert into parent_observations table
    const { data, error } = await supabase
      .from('parent_observations')
      .upsert(payload, { onConflict: 'learner_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[ParentObservationService] Upsert error, queueing offline:', error.message);
      enqueueOfflineMutation('SAVE_PARENT_OBSERVATION', { learnerId, feedbackData });
      return feedbackData;
    }

    return feedbackData;
  } catch (err) {
    console.warn('[ParentObservationService] Exception saving observation:', err);
    enqueueOfflineMutation('SAVE_PARENT_OBSERVATION', { learnerId, feedbackData });
    return feedbackData;
  }
}

/**
 * Fetches the latest parent observation record for a learner.
 */
export async function getParentObservation(learnerId) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return null;
  }

  const cached = getLocalCache(`parent_obs_${learnerId}`);

  if (!isSupabaseConfigured() || !supabase) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('parent_observations')
      .select('*')
      .eq('learner_id', learnerId)
      .maybeSingle();

    if (error || !data) {
      return cached;
    }

    const feedback = {
      ...createEmptyParentFeedback(),
      reading: data.reading || {},
      sounds: data.sounds || {},
      writing: data.writing || {},
      understanding: data.understanding || {},
      parentObservation: data.optional_note || '',
      lastUpdatedAt: data.updated_at
    };

    setLocalCache(`parent_obs_${learnerId}`, feedback);
    return feedback;
  } catch (err) {
    console.warn('[ParentObservationService] Error fetching observation:', err);
    return cached;
  }
}
