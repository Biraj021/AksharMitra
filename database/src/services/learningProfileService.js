/**
 * src/services/learningProfileService.js
 * Data-access service for Learning Profiles in Supabase.
 * Persists synthesized cross-signal recommendations and evidence.
 * Strict rule: Never diagnoses medical dyslexia; records developmental patterns.
 */

import { supabase, isSupabaseConfigured, ensureAuthSession } from '../lib/supabaseClient.js';
import { enqueueOfflineMutation, setLocalCache, getLocalCache } from './offlineSyncService.js';
import { isDemoProfile } from './learnerService.js';

export async function saveLearningProfile(learnerId, learningProfile) {
  if (!learnerId || !learningProfile || isDemoProfile(learnerId)) {
    return learningProfile;
  }

  // Update local cache
  setLocalCache(`learning_profile_${learnerId}`, learningProfile);

  if (!isSupabaseConfigured() || !supabase) {
    return learningProfile;
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('SAVE_LEARNING_PROFILE', { learnerId, learningProfile });
      return learningProfile;
    }

    const payload = {
      learner_id: learnerId,
      user_id: user.id,
      observed_pattern: learningProfile.observedPattern || '',
      recommended_practice: learningProfile.recommendedPractice || '',
      recommended_activity_id: learningProfile.recommendedActivityId || 'word-snapper',
      recommended_activity_title: learningProfile.recommendedActivityTitle || 'Word Snapper',
      confidence: learningProfile.confidence || 0,
      agreement_status: learningProfile.agreementStatus || 'insufficient_data',
      signal_scores: learningProfile.signalScores || {},
      parent_observation_signals: learningProfile.parentObservation || {},
      evidence: learningProfile.evidence || { appActivity: [], parentObservation: [] },
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('learning_profiles')
      .upsert(payload, { onConflict: 'learner_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[LearningProfileService] Error upserting learning profile:', error.message);
      enqueueOfflineMutation('SAVE_LEARNING_PROFILE', { learnerId, learningProfile });
    }

    return learningProfile;
  } catch (err) {
    console.warn('[LearningProfileService] Exception saving learning profile:', err);
    enqueueOfflineMutation('SAVE_LEARNING_PROFILE', { learnerId, learningProfile });
    return learningProfile;
  }
}

export async function getLearningProfile(learnerId) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return null;
  }

  const cached = getLocalCache(`learning_profile_${learnerId}`);

  if (!isSupabaseConfigured() || !supabase) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('learner_id', learnerId)
      .maybeSingle();

    if (error || !data) {
      return cached;
    }

    const profile = {
      observedPattern: data.observed_pattern,
      recommendedPractice: data.recommended_practice,
      recommendedActivityId: data.recommended_activity_id,
      recommendedActivityTitle: data.recommended_activity_title,
      confidence: data.confidence,
      agreementStatus: data.agreement_status,
      signalScores: data.signal_scores,
      parentObservation: data.parent_observation_signals,
      evidence: data.evidence,
      updatedAt: data.updated_at
    };

    setLocalCache(`learning_profile_${learnerId}`, profile);
    return profile;
  } catch (err) {
    console.warn('[LearningProfileService] Error fetching learning profile:', err);
    return cached;
  }
}
