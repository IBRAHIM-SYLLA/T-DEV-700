import { apiFetch } from "./ApiClient";
import { toApiUserPayload, toUiUser } from "./mappers";

const UsersApi = {
  async list({ token } = {}) {
    const users = await apiFetch("/api/users", { token });
    return Array.isArray(users) ? users.map(toUiUser) : [];
  },

  async getById(userId, { token } = {}) {
    const user = await apiFetch(`/api/users/${userId}`, { token });
    return toUiUser(user);
  },

  async create(payload, { token } = {}) {
    const created = await apiFestch("/api/users", {
      method: "POST",
      token,
      body: toApiUserPayload(payload)
    });
    return toUiUser(created);
  },

  async update(userId, payload, { token } = {}) {
    const updated = await apiFetch(`/api/users/${userId}`, {
      method: "PUT",
      token,
      body: toApiUserPayload(payload)
    });
    return toUiUser(updated);
  },

  async remove(userId, { token } = {}) {
    return apiFetch(`/api/users/${userId}`, { method: "DELETE", token });
  }
};

export default UsersApi;
