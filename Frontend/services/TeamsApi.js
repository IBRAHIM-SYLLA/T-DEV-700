import { apiFetch } from "./ApiClient";

const TeamsApi = {
  async list({ token } = {}) {
    const teams = await apiFetch("/api/teams", { token });
    return Array.isArray(teams) ? teams : [];
  }
};

export default TeamsApi;
