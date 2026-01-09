import { apiFetch } from "./ApiClient";

const TeamsApi = {
  async list({ token } = {}) {
    const teams = await apiFetch("/api/teams", { token });
    return Array.isArray(teams) ? teams : [];
  },

  async create(payload, { token } = {}) {
    return apiFetch("/api/teams", {
      method: "POST",
      token,
      body: payload
    });
  }
};

export default TeamsApi;
