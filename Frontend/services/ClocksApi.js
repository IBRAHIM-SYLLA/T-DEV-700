import { apiFetch } from "./ApiClient";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toIsoDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
    return null;
  }
  // Local date key to avoid timezone shifting
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toIsoTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    if (typeof value === "string") {
      const match = value.match(/(\d{2}:\d{2})(?::\d{2})?/);
      return match ? `${match[1]}:00` : null;
    }
    return null;
  }
  // Local time for UI display
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function timeToMinutes(timeString) {
  if (!timeString) return null;
  const parts = String(timeString).split(":").map((v) => Number(v));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  const [hours = 0, minutes = 0] = parts;
  return hours * 60 + minutes;
}

function isLate({ expectedArrivalTime = "09:00:00", actualArrivalTime, toleranceMinutes = 5 }) {
  const expectedMinutes = timeToMinutes(expectedArrivalTime);
  const actualMinutes = timeToMinutes(actualArrivalTime);
  if (expectedMinutes == null || actualMinutes == null) return { late: false, lateMinutes: 0 };
  const diff = actualMinutes - expectedMinutes;
  if (diff > toleranceMinutes) return { late: true, lateMinutes: diff };
  return { late: false, lateMinutes: Math.max(0, diff) };
}

function getTodayKey() {
  return toIsoDateKey(new Date());
}

function getTodayClock(clocks) {
  const today = getTodayKey();
  return (clocks || []).find((clock) => toIsoDateKey(clock.arrival_time) === today) || null;
}

function getTodayStatusFromClocks(clocks) {
  const todayClock = getTodayClock(clocks);
  if (!todayClock) return { status: "Absent", clock: null, lateMinutes: 0 };

  const arrivalTime = toIsoTime(todayClock.arrival_time);
  const { late, lateMinutes } = isLate({ actualArrivalTime: arrivalTime });

  return {
    status: late ? "En retard" : "Présent",
    clock: todayClock,
    lateMinutes: lateMinutes || 0
  };
}

const ClocksApi = {
  async toggle(userId, { token } = {}) {
    return apiFetch("/api/clocks", {
      method: "POST",
      token,
      body: { id: userId }
    });
  },

  async listForUser(userId, { token } = {}) {
    return apiFetch(`/api/users/${userId}/clocks`, { token });
  },

  toIsoDateKey,
  toIsoTime,
  getTodayClock,
  getTodayStatusFromClocks
};

export default ClocksApi;
