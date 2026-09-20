/**
 * src/utils/streakUtils.js
 * Comprehensive utility for tracking daily learner attendance,
 * calculating consecutive day streaks, and generating calendar views.
 */

export const DAY_NAMES = {
  english: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  bengali: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'],
  hindi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
};

export const FULL_DAY_NAMES = {
  english: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bengali: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  hindi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
};

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates relative attendance history for demo profiles
 */
export function getRelativeDemoAttendance(numDays = 4) {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(formatDateKey(d));
  }
  return dates.reverse();
}

/**
 * Generates the past N days for calendar view (default 7 days)
 */
export function getRecentCalendarDays(numDays = 7, languageId = 'english') {
  const days = [];
  const now = new Date();
  const todayKey = formatDateKey(now);
  const dayLabels = DAY_NAMES[languageId] || DAY_NAMES.english;

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateKey = formatDateKey(d);
    const dayOfWeekIndex = d.getDay();

    days.push({
      dateKey,
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      dayLabel: dayLabels[dayOfWeekIndex],
      isToday: dateKey === todayKey,
      isFuture: d > now
    });
  }
  return days;
}

/**
 * Generates a full 30-day or current-month attendance grid
 */
export function getMonthAttendanceGrid(attendanceHistory = [], languageId = 'english') {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const todayKey = formatDateKey(now);

  const attendedSet = new Set(attendanceHistory || []);
  const grid = [];

  // Blank slots for start day alignment
  const startDayOfWeek = firstDayOfMonth.getDay();
  for (let b = 0; b < startDayOfWeek; b++) {
    grid.push({ isBlank: true, id: `blank_${b}` });
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const key = formatDateKey(d);
    grid.push({
      isBlank: false,
      day,
      dateKey: key,
      isToday: key === todayKey,
      isPast: d < now && key !== todayKey,
      isFuture: d > now,
      attended: attendedSet.has(key)
    });
  }

  return {
    monthName: now.toLocaleString(languageId === 'bengali' ? 'bn-IN' : (languageId === 'hindi' ? 'hi-IN' : 'en-US'), { month: 'long', year: 'numeric' }),
    days: grid
  };
}

/**
 * Calculates current streak, best streak, and attendance status
 */
export function calculateStreakStats(attendanceHistory = []) {
  if (!attendanceHistory || !attendanceHistory.length) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      attendedToday: false,
      totalDaysAttended: 0
    };
  }

  const todayKey = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const uniqueSorted = Array.from(new Set(attendanceHistory)).sort().reverse();
  const attendedToday = uniqueSorted.includes(todayKey);
  const attendedYesterday = uniqueSorted.includes(yesterdayKey);

  let currentStreak = 0;
  if (attendedToday || attendedYesterday) {
    let checkDate = attendedToday ? new Date() : yesterday;
    while (true) {
      const key = formatDateKey(checkDate);
      if (uniqueSorted.includes(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Best (longest) streak across entire history
  const ascending = Array.from(new Set(attendanceHistory)).sort();
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of ascending) {
    const curDate = new Date(dStr + 'T00:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
    prevDate = curDate;
  }

  return {
    currentStreak: Math.max(currentStreak, 1),
    bestStreak: Math.max(maxStreak, currentStreak, 1),
    attendedToday,
    totalDaysAttended: uniqueSorted.length
  };
}
