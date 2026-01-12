import { apiFetch } from "./ApiClient";
import { cacheTeams } from "./teamCache";

const TeamsApi = {
  async list({ token } = {}) {
    const teams = await apiFetch("/api/teams", { token });
    const list = Array.isArray(teams) ? teams : [];
    cacheTeams(list);
    return list;
  },

  async create({ name, managerId }, { token } = {}) {
    if (!name || !String(name).trim()) {
      throw new Error("name is required");
    }
    if (managerId === null || managerId === undefined || managerId === "") {
      throw new Error("managerId is required");
    }

    const manager_id = Number(managerId);
    if (!Number.isFinite(manager_id)) {
      throw new Error("managerId must be a number");
    }

    return apiFetch("/api/teams", {
      method: "POST",
      token,
      body: {
        name: String(name).trim(),
        manager_id
      }
    });
  },

  async update(teamId, { name, description, managerId }, { token } = {}) {
    if (teamId === null || teamId === undefined || teamId === "") {
      throw new Error("teamId is required");
    }

    const body = {};

    if (name !== undefined) {
      if (!String(name).trim()) throw new Error("name is required");
      body.name = String(name).trim();
    }

    if (description !== undefined) {
      body.description = description === null ? null : String(description);
    }

    if (managerId !== undefined) {
      if (managerId === null || managerId === "") throw new Error("managerId is required");
      const manager_id = Number(managerId);
      if (!Number.isFinite(manager_id)) throw new Error("managerId must be a number");
      body.manager_id = manager_id;
    }

    const updated = await apiFetch(`/api/teams/${teamId}`, {
      method: "PUT",
      token,
      body
    });
    cacheTeams([updated]);
    return updated;
  },

  async remove(teamId, { token } = {}) {
    if (teamId === null || teamId === undefined || teamId === "") {
      throw new Error("teamId is required");
    }
    return apiFetch(`/api/teams/${teamId}`, { method: "DELETE", token });
  },

  async getById(teamId, { token } = {}) {
    if (teamId === null || teamId === undefined || teamId === "") {
      throw new Error("teamId is required");
    }
    const team = await apiFetch(`/api/teams/${teamId}`, { token });
    cacheTeams([team]);
    return team;
  },

  async getByIdSilent(teamId, { token } = {}) {
    if (teamId === null || teamId === undefined || teamId === "") {
      return null;
    }
    try {
      const team = await apiFetch(`/api/teams/${teamId}`, { token, silent: true });
      cacheTeams([team]);
      return team;
    } catch {
      return null;
    }
  }
};

export default TeamsApi;
