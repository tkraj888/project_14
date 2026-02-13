import { BASE_URL } from "../config/api";

export const authApi = {

  /* ===================== LOGIN ===================== */
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/jwt/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: credentials.email,   // ✅ backend expects "username"
        password: credentials.password
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    /*
      Expected response:
      {
        accessToken: "JWT",
        roles: ["EMPLOYEE"],
        userId: 12
      }
    */

    // ✅ STORE AUTH DATA (SINGLE SOURCE OF TRUTH - use 'token' consistently)
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    }

    if (data.roles?.length) {
      localStorage.setItem("role", data.roles[0]);
    }

    if (data.userId) {
      localStorage.setItem("userId", data.userId);
    }

    return data;
  },

  /* ===================== REGISTER ===================== */
  register: async (registerData) => {
    const payload = {
      firstName: registerData.name?.split(" ")[0] || "",
      lastName: registerData.name?.split(" ").slice(1).join(" ") || "",
      email: registerData.email,
      password: registerData.password,
      mobileNumber: Number(registerData.phone),
      role: "USER"
    };

    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  /* ===================== LOGOUT ===================== */
  logout: async () => {
    const token = localStorage.getItem("token");

    // Call backend logout (optional but clean)
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    }).catch(() => {});

    // ✅ CLEAR ALL AUTH STATE
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("loginLocation");
  }
};
