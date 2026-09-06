/* Tracks which of the 6 course modules the visitor has completed, in localStorage. */

const STORAGE_KEY = "techease-course-progress";
export const TOTAL_LESSONS = 6;

function safeGet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeSet(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private browsing, quota) — progress just won't persist */
  }
}

export function getCompleted() {
  return safeGet();
}

export function isComplete(lessonId) {
  return safeGet().includes(lessonId);
}

export function markComplete(lessonId) {
  const list = safeGet();
  if (!list.includes(lessonId)) {
    list.push(lessonId);
    safeSet(list);
  }
  return list;
}

export function unmarkComplete(lessonId) {
  const list = safeGet().filter((id) => id !== lessonId);
  safeSet(list);
  return list;
}

export function completedCount() {
  return safeGet().length;
}
