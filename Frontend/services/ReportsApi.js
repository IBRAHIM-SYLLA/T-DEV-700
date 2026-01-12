import { apiFetch } from "./ApiClient";

function toQueryString(params) {
  const entries = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!entries.length) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of entries) {
    qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

const ReportsApi = {
  /**
   * Global report (aggregated KPIs).
   *
   * @param {Object} options
   * @param {string[]} options.kpis - Report KPI keys (e.g. "late_rate").
   * @param {string|Date} [options.from]
   * @param {string|Date} [options.to]
   */
  async getGlobalReport({ kpis, from, to } = {}, { token } = {}) {
    if (!Array.isArray(kpis) || !kpis.length) {
      throw new Error("kpis is required");
    }

    const fromValue = from instanceof Date ? from.toISOString() : from;
    const toValue = to instanceof Date ? to.toISOString() : to;

    const qs = toQueryString({
      kpis: kpis.join(","),
      from: fromValue,
      to: toValue
    });

    return apiFetch(`/api/reports${qs}`, { token });
  }
};

export default ReportsApi;
