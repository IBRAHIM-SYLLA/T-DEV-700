const USER_TEAM_CACHE_KEY = "tm_user_team_cache";
const TEAM_CACHE_KEY = "tm_teams_cache";

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota / private mode
  }
}

export function cacheUserTeams(users) {
  const list = Array.isArray(users) ? users : [];
  if (!list.length) return;

  const existing = readJson(USER_TEAM_CACHE_KEY) || {};
  let changed = false;

  for (const u of list) {
    const userId = u?.userId ?? u?.user_id;
    if (!userId) continue;

    const teamName = u?._raw?.team?.name || u?.team?.name || u?.teamName || "";
    const teamId =
      u?.teamId ??
      u?.team_id ??
      u?._raw?.team?.team_id ??
      u?._raw?.team?.teamId ??
      u?._raw?.team?.id ??
      null;

    if (!teamName && (teamId === null || teamId === undefined)) continue;

    const prev = existing[userId] || {};
    const next = {
      ...prev,
      ...(teamId !== null && teamId !== undefined ? { teamId } : {}),
      ...(teamName ? { teamName } : {}),
      updatedAt: Date.now()
    };

    const prevStr = JSON.stringify(prev);
    const nextStr = JSON.stringify(next);
    if (prevStr !== nextStr) {
      existing[userId] = next;
      changed = true;
    }
  }

  if (changed) writeJson(USER_TEAM_CACHE_KEY, existing);
}

export function getCachedTeamNameForUser(userId) {
  if (!userId) return "";
  const cache = readJson(USER_TEAM_CACHE_KEY);
  return cache?.[userId]?.teamName || "";
}

export function cacheTeams(teams) {
  const list = Array.isArray(teams) ? teams : [];
  if (!list.length) return;

  const existing = readJson(TEAM_CACHE_KEY) || {};
  let changed = false;

  for (const t of list) {
    const teamId = t?.team_id ?? t?.teamId ?? t?.id;
    if (!teamId) continue;
    const name = t?.name || "";
    if (!name) continue;

    const prev = existing[teamId] || {};
    const next = { ...prev, name, updatedAt: Date.now() };

    const prevStr = JSON.stringify(prev);
    const nextStr = JSON.stringify(next);
    if (prevStr !== nextStr) {
      existing[teamId] = next;
      changed = true;
    }
  }

  if (changed) writeJson(TEAM_CACHE_KEY, existing);
}

export function getCachedTeamNameForTeam(teamId) {
  if (!teamId) return "";
  const cache = readJson(TEAM_CACHE_KEY);
  return cache?.[teamId]?.name || "";
}
