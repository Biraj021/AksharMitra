/**
 * src/services/learnerService.js
 * Data-access service for Learner profiles.
 * Isolates Supabase queries outside React components and provides
 * seamless offline fallback with local caching.
 */

import { supabase, isSupabaseConfigured, ensureAuthSession, getCurrentUserId } from '../lib/supabaseClient.js';
import { enqueueOfflineMutation, setLocalCache, getLocalCache } from './offlineSyncService.js';

export const isDemoProfile = (id) => {
  if (!id) return false;
  return id === 'demo_aarav' || id === 'demo_priya' || id === 'aarav_demo' || id === 'priya_demo' || id.startsWith('demo_');
};

/**
 * Transforms a Supabase PostgreSQL row to a frontend learner object
 */
export function mapRowToLearner(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatar: row.avatar || 'sheru',
    avatarEmoji: row.avatar_emoji || '🦁',
    grade: row.grade || 'grade2',
    gradeLabel: row.grade_label || 'Class 2',
    language: row.preferred_language === 'bn' ? 'bengali' : (row.preferred_language === 'hi' ? 'hindi' : (row.preferred_language || 'english')),
    preferred_language: row.preferred_language || 'en',
    stars: row.stars ?? 15,
    streak: row.streak ?? 1,
    screeningCompleted: Boolean(row.screening_completed),
    riskLevel: row.risk_level || 'typical',
    learningPathway: row.learning_pathway || 'accelerated_fluency',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

/**
 * Transforms a frontend learner object to a Supabase PostgreSQL row
 */
export function mapLearnerToRow(learner, userId) {
  const langKey = learner.language === 'bengali' ? 'bn' : (learner.language === 'hindi' ? 'hi' : (learner.preferred_language || 'en'));
  return {
    ...(learner.id && !learner.id.startsWith('student_') ? { id: learner.id } : {}),
    user_id: userId,
    name: learner.name || 'Explorer',
    avatar: learner.avatar || 'sheru',
    avatar_emoji: learner.avatarEmoji || '🦁',
    grade: learner.grade || 'grade2',
    grade_label: learner.gradeLabel || 'Class 2',
    preferred_language: langKey,
    stars: learner.stars ?? 15,
    streak: learner.streak ?? 1,
    screening_completed: Boolean(learner.screeningCompleted),
    risk_level: learner.riskLevel || 'typical',
    learning_pathway: learner.learningPathway || 'accelerated_fluency',
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetch all learners for the currently authenticated parent/educator
 */
export async function getLearners() {
  if (!isSupabaseConfigured() || !supabase) {
    return getLocalCache('learners_list') || [];
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      return getLocalCache('learners_list') || [];
    }

    const { data, error } = await supabase
      .from('learners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[LearnerService] Error fetching learners from DB:', error.message);
      return getLocalCache('learners_list') || [];
    }

    const mapped = (data || []).map(mapRowToLearner);
    setLocalCache('learners_list', mapped);
    return mapped;
  } catch (err) {
    console.warn('[LearnerService] Unexpected error getting learners:', err);
    return getLocalCache('learners_list') || [];
  }
}

/**
 * Fetch a single learner by ID
 */
export async function getLearner(learnerId) {
  if (!learnerId) return null;
  if (isDemoProfile(learnerId)) return null;

  if (!isSupabaseConfigured() || !supabase) {
    const cachedList = getLocalCache('learners_list') || [];
    return cachedList.find((l) => l.id === learnerId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('learners')
      .select('*')
      .eq('id', learnerId)
      .maybeSingle();

    if (error || !data) {
      const cachedList = getLocalCache('learners_list') || [];
      return cachedList.find((l) => l.id === learnerId) || null;
    }

    return mapRowToLearner(data);
  } catch (err) {
    console.warn('[LearnerService] Error fetching single learner:', err);
    return null;
  }
}

/**
 * Create a new learner record
 */
export async function createLearner(learnerData) {
  if (isDemoProfile(learnerData?.id)) {
    return learnerData;
  }

  // Update local cache optimistically
  const cachedList = getLocalCache('learners_list') || [];
  const optimisticLearner = {
    ...learnerData,
    id: learnerData.id || `student_${Date.now()}`
  };
  setLocalCache('learners_list', [optimisticLearner, ...cachedList]);

  if (!isSupabaseConfigured() || !supabase) {
    return optimisticLearner;
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('CREATE_LEARNER', optimisticLearner);
      return optimisticLearner;
    }

    const row = mapLearnerToRow(optimisticLearner, user.id);
    const { data, error } = await supabase
      .from('learners')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.warn('[LearnerService] Insert error, queuing offline:', error.message);
      enqueueOfflineMutation('CREATE_LEARNER', optimisticLearner);
      return optimisticLearner;
    }

    const saved = mapRowToLearner(data);
    // Replace optimistic with real DB record
    const updatedCache = cachedList.map((l) => (l.id === optimisticLearner.id ? saved : l));
    setLocalCache('learners_list', updatedCache);
    return saved;
  } catch (err) {
    console.warn('[LearnerService] Exception during learner creation:', err);
    enqueueOfflineMutation('CREATE_LEARNER', optimisticLearner);
    return optimisticLearner;
  }
}

/**
 * Update an existing learner record
 */
export async function updateLearner(learnerId, updates) {
  if (!learnerId || isDemoProfile(learnerId)) {
    return updates;
  }

  // Optimistic cache update
  const cachedList = getLocalCache('learners_list') || [];
  const updatedList = cachedList.map((l) => (l.id === learnerId ? { ...l, ...updates } : l));
  setLocalCache('learners_list', updatedList);

  if (!isSupabaseConfigured() || !supabase) {
    return updates;
  }

  try {
    const user = await ensureAuthSession();
    if (!user) {
      enqueueOfflineMutation('UPDATE_LEARNER', { learnerId, updates });
      return updates;
    }

    const rowUpdates = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.avatar !== undefined) rowUpdates.avatar = updates.avatar;
    if (updates.avatarEmoji !== undefined) rowUpdates.avatar_emoji = updates.avatarEmoji;
    if (updates.grade !== undefined) rowUpdates.grade = updates.grade;
    if (updates.gradeLabel !== undefined) rowUpdates.grade_label = updates.gradeLabel;
    if (updates.stars !== undefined) rowUpdates.stars = updates.stars;
    if (updates.streak !== undefined) rowUpdates.streak = updates.streak;
    if (updates.screeningCompleted !== undefined) rowUpdates.screening_completed = updates.screeningCompleted;
    if (updates.riskLevel !== undefined) rowUpdates.risk_level = updates.riskLevel;
    if (updates.language !== undefined) {
      rowUpdates.preferred_language = updates.language === 'bengali' ? 'bn' : (updates.language === 'hindi' ? 'hi' : 'en');
    }
    rowUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('learners')
      .update(rowUpdates)
      .eq('id', learnerId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[LearnerService] Update error, queuing offline:', error.message);
      enqueueOfflineMutation('UPDATE_LEARNER', { learnerId, updates });
    }

    return data ? mapRowToLearner(data) : updates;
  } catch (err) {
    console.warn('[LearnerService] Exception updating learner:', err);
    enqueueOfflineMutation('UPDATE_LEARNER', { learnerId, updates });
    return updates;
  }
}

/**
 * Delete a learner
 */
export async function deleteLearner(learnerId) {
  if (!learnerId || isDemoProfile(learnerId)) return true;

  const cachedList = getLocalCache('learners_list') || [];
  setLocalCache('learners_list', cachedList.filter((l) => l.id !== learnerId));

  if (!isSupabaseConfigured() || !supabase) return true;

  try {
    const { error } = await supabase
      .from('learners')
      .delete()
      .eq('id', learnerId);

    if (error) {
      console.warn('[LearnerService] Delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[LearnerService] Exception deleting learner:', err);
    return false;
  }
}
