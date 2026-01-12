import { apiFetch } from "./ApiClient";
import { toUiUser } from "./mappers";

const AuthApi = {
  async login({ email, password }) {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });

    return {
      user: toUiUser(result.user)
    };
  },

  async logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
  }
};

export default AuthApi;

