import { apiFetch } from "./ApiClient";
import { toApiUserPayload, toUiUser } from "./mappers";
import { cacheUserTeams } from "./teamCache";

const UsersApi = {
  async list({ token } = {}) {
    const users = await apiFetch("/api/users", { token });
    const list = Array.isArray(users) ? users.map(toUiUser) : [];
    cacheUserTeams(list);
    return list;
  },

  async getById(userId, { token } = {}) {
    const user = await apiFetch(`/api/users/${userId}`, { token });
    const ui = toUiUser(user);
    cacheUserTeams([ui]);
    return ui;
  },

  async create(payload, { token } = {}) {
    const created = await apiFetch("/api/users", {
      method: "POST",
      token,
      body: toApiUserPayload(payload)
    });
    const ui = toUiUser(created);
    cacheUserTeams([ui]);
    return ui;
  },

  async update(userId, payload, { token } = {}) {
    const updated = await apiFetch(`/api/users/${userId}`, {
      method: "PUT",
      token,
      body: toApiUserPayload(payload)
    });
    const ui = toUiUser(updated);
    cacheUserTeams([ui]);
    return ui;
  },

  async remove(userId, { token } = {}) {
    return apiFetch(`/api/users/${userId}`, { method: "DELETE", token });
  }
};

export default UsersApi;
