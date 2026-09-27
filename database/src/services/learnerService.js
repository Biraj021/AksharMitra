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

export const STORAGE_GLOBAL_LEARNERS = 'aksharmitra_global_learners_v1';
export const STORAGE_TEACHER_LINKS_PREFIX = 'aksharmitra_teacher_links_';

export function generateKidCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AM-${num}`;
}

/**
 * Transforms a Supabase PostgreSQL row to a frontend learner object
 */
export function mapRowToLearner(row) {
  if (!row) return null;
  return {
    id: row.id,
    kidCode: row.kid_code || row.kidCode || (row.id ? `AM-${row.id.toString().slice(-4).toUpperCase()}` : generateKidCode()),
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
  const kidCode = learner.kidCode || generateKidCode();
  return {
    ...(learner.id && !learner.id.startsWith('student_') ? { id: learner.id } : {}),
    kid_code: kidCode,
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
    if (updates.learningPathway !== undefined) rowUpdates.learning_pathway = updates.learningPathway;
    if (updates.language !== undefined) {
      rowUpdates.preferred_language = updates.language === 'bengali' ? 'bn' : (updates.language === 'hindi' ? 'hi' : 'en');
    }
    rowUpdates.updated_at = new Date().toISOString();

    const isUuid = typeof learnerId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(learnerId);
    let data = null;
    let error = null;

    if (isUuid) {
      const res = await supabase
        .from('learners')
        .update(rowUpdates)
        .eq('id', learnerId)
        .select()
        .maybeSingle();
      data = res.data;
      error = res.error;
    } else if (updates.kidCode) {
      const res = await supabase
        .from('learners')
        .update(rowUpdates)
        .eq('kid_code', updates.kidCode.toUpperCase())
        .select()
        .maybeSingle();
      data = res.data;
      error = res.error;
    } else {
      const local = cachedList.find((l) => l.id === learnerId);
      if (local?.kidCode) {
        const res = await supabase
          .from('learners')
          .update(rowUpdates)
          .eq('kid_code', local.kidCode.toUpperCase())
          .select()
          .maybeSingle();
        data = res.data;
        error = res.error;
      }
    }

    if (error) {
      console.warn('[LearnerService] Update error, queuing offline:', error.message);
      enqueueOfflineMutation('UPDATE_LEARNER', { learnerId, updates });
    }

    if (data) {
      const mapped = mapRowToLearner(data);
      saveGlobalLearner(mapped);
      return mapped;
    }
    return updates;
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

/**
 * Global Learner Cache for Kid ID lookups across tabs/devices
 */
export function getStoredGlobalLearners() {
  try {
    const raw = localStorage.getItem(STORAGE_GLOBAL_LEARNERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGlobalLearner(learner) {
  if (!learner || (!learner.id && !learner.kidCode)) return;
  try {
    const list = getStoredGlobalLearners();
    const idx = list.findIndex(
      (l) =>
        (learner.id && l.id === learner.id) ||
        (learner.kidCode && l.kidCode && l.kidCode.toUpperCase() === learner.kidCode.toUpperCase())
    );
    if (idx >= 0) {
      const isComp = Boolean(list[idx].screeningCompleted || learner.screeningCompleted);
      list[idx] = {
        ...list[idx],
        ...learner,
        screeningCompleted: isComp,
        screeningMetrics: learner.screeningMetrics || list[idx].screeningMetrics || null,
        riskLevel: (isComp && learner.riskLevel && learner.riskLevel !== 'typical')
          ? learner.riskLevel
          : (list[idx].riskLevel && list[idx].riskLevel !== 'typical' ? list[idx].riskLevel : (learner.riskLevel || list[idx].riskLevel || 'typical')),
        learningPathway: learner.learningPathway || list[idx].learningPathway || null
      };
    } else {
      list.push(learner);
    }
    localStorage.setItem(STORAGE_GLOBAL_LEARNERS, JSON.stringify(list));
  } catch (e) {
    console.warn('[LearnerService] Error saving global learner:', e);
  }
}

/**
 * Looks up a learner by their Kid ID (e.g. 'AM-1001' or 'AM-4821')
 */
export async function getLearnerByKidCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  // 1. Check built-in demo profiles
  if (cleanCode === 'AM-1001' || cleanCode === 'AARAV' || cleanCode === 'DEMO_AARAV') {
    return {
      id: 'demo_aarav',
      kidCode: 'AM-1001',
      name: 'Aarav',
      avatar: 'sheru',
      avatarEmoji: '🦁',
      grade: 'grade2',
      gradeLabel: 'Grade 2',
      language: 'english',
      stars: 85,
      streak: 2,
      screeningCompleted: true,
      riskLevel: 'elevated',
      riskScore: 78
    };
  }

  if (cleanCode === 'AM-1002' || cleanCode === 'PRIYA' || cleanCode === 'DEMO_PRIYA') {
    return {
      id: 'demo_priya',
      kidCode: 'AM-1002',
      name: 'Priya',
      avatar: 'mayur',
      avatarEmoji: '🦚',
      grade: 'grade3',
      gradeLabel: 'Grade 3',
      language: 'english',
      stars: 160,
      streak: 12,
      screeningCompleted: true,
      riskLevel: 'typical',
      riskScore: 22
    };
  }

  // 2. Check local learners cache
  const globalList = getStoredGlobalLearners();
  const localMatch = globalList.find(
    (l) =>
      (l.kidCode && l.kidCode.toUpperCase() === cleanCode) ||
      (l.id && l.id.toString().toUpperCase() === cleanCode)
  );
  if (localMatch) return localMatch;

  // Also check active learner list cache
  const cachedList = getLocalCache('learners_list') || [];
  const listMatch = cachedList.find(
    (l) =>
      (l.kidCode && l.kidCode.toUpperCase() === cleanCode) ||
      (l.id && l.id.toString().toUpperCase() === cleanCode)
  );
  if (listMatch) {
    saveGlobalLearner(listMatch);
    return listMatch;
  }

  // 3. Query Supabase if connected
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('learners')
        .select('*')
        .or(`kid_code.eq.${cleanCode},id.eq.${cleanCode}`)
        .maybeSingle();

      if (data && !error) {
        const mapped = mapRowToLearner(data);
        saveGlobalLearner(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[LearnerService] Supabase lookup by kidCode warning:', e);
    }
  }

  return null;
}

/**
 * Links a student to a teacher using their Kid ID
 */
export async function linkStudentToTeacher(teacherId, kidCodeOrId) {
  if (!teacherId || !kidCodeOrId) throw new Error('Missing teacher ID or Kid ID');
  const learner = await getLearnerByKidCode(kidCodeOrId);
  if (!learner) {
    throw new Error(`Student with Kid ID "${kidCodeOrId}" not found. Please verify the code.`);
  }

  const linkedRecord = {
    ...learner,
    isLinked: true,
    linkedAt: new Date().toISOString()
  };

  const storageKey = `${STORAGE_TEACHER_LINKS_PREFIX}${teacherId}`;
  let linked = [];
  try {
    const raw = localStorage.getItem(storageKey);
    linked = raw ? JSON.parse(raw) : [];
  } catch {}

  const existsIdx = linked.findIndex(
    (l) =>
      (l.id && l.id === linkedRecord.id) ||
      (l.kidCode && linkedRecord.kidCode && l.kidCode.toUpperCase() === linkedRecord.kidCode.toUpperCase())
  );

  if (existsIdx >= 0) {
    linked[existsIdx] = {
      ...linked[existsIdx],
      ...linkedRecord,
      screeningCompleted: Boolean(linked[existsIdx].screeningCompleted || linkedRecord.screeningCompleted),
      screeningMetrics: linkedRecord.screeningMetrics || linked[existsIdx].screeningMetrics || null
    };
  } else {
    linked.push(linkedRecord);
  }
  localStorage.setItem(storageKey, JSON.stringify(linked));

  // Also sync to Supabase if connected
  const isUuid = typeof learner.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(learner.id);
  if (isSupabaseConfigured() && supabase && isUuid && !learner.id.startsWith('demo_')) {
    try {
      await supabase.from('teacher_student_links').upsert([
        { teacher_id: teacherId, learner_id: learner.id }
      ]);
    } catch (e) {
      console.warn('[LearnerService] Supabase link sync notice:', e.message);
    }
  }

  return linkedRecord;
}

/**
 * Retrieves all students linked to a specific teacher
 */
export function getTeacherLinkedStudents(teacherId) {
  if (!teacherId) return [];
  const storageKey = `${STORAGE_TEACHER_LINKS_PREFIX}${teacherId}`;
  try {
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];

    // Always rehydrate linked students with freshest screening and metrics from global store
    const globalList = getStoredGlobalLearners();
    return list.map((st) => {
      const match = globalList.find(
        (g) =>
          (g.id && g.id === st.id) ||
          (g.kidCode && st.kidCode && g.kidCode.toUpperCase() === st.kidCode.toUpperCase())
      );
      if (match) {
        const isComp = Boolean(st.screeningCompleted || match.screeningCompleted);
        return {
          ...st,
          ...match,
          isLinked: true,
          screeningCompleted: isComp,
          screeningMetrics: match.screeningMetrics || st.screeningMetrics || null,
          riskLevel: (isComp && match.riskLevel && match.riskLevel !== 'typical') ? match.riskLevel : (st.riskLevel || match.riskLevel || 'typical'),
          learningPathway: match.learningPathway || st.learningPathway || null
        };
      }
      return { ...st, isLinked: true };
    });
  } catch {
    return [];
  }
}

/**
 * Remotely fetches all students linked to a teacher from Supabase
 */
export async function getTeacherLinkedStudentsRemote(teacherId) {
  if (!teacherId) return [];
  const local = getTeacherLinkedStudents(teacherId);

  if (!isSupabaseConfigured() || !supabase) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('teacher_student_links')
      .select('learner_id, learners(*)')
      .eq('teacher_id', teacherId);

    if (error || !data) {
      return local;
    }

    const remoteStudents = data
      .map((item) => (item.learners ? mapRowToLearner(item.learners) : null))
      .filter(Boolean);

    const merged = [...local];
    for (const rem of remoteStudents) {
      saveGlobalLearner(rem);
      const idx = merged.findIndex(
        (l) => l.id === rem.id || (l.kidCode && rem.kidCode && l.kidCode.toUpperCase() === rem.kidCode.toUpperCase())
      );
      if (idx >= 0) {
        const isComp = Boolean(merged[idx].screeningCompleted || rem.screeningCompleted);
        merged[idx] = {
          ...merged[idx],
          ...rem,
          isLinked: true,
          screeningCompleted: isComp,
          screeningMetrics: rem.screeningMetrics || merged[idx].screeningMetrics || null
        };
      } else {
        merged.push({ ...rem, isLinked: true });
      }
    }

    const storageKey = `${STORAGE_TEACHER_LINKS_PREFIX}${teacherId}`;
    localStorage.setItem(storageKey, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('[LearnerService] Remote linked students fetch warning:', err);
    return local;
  }
}

