import { apiFetch } from "./ApiClient";
import { toUiUser } from "./mappers";

const AuthApi = {
  async login({ email, password }) {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });

    return {
      token: result?.token || null,
      user: toUiUser(result?.user)
    };
  }
};

export default AuthApi;
