import { authApi } from '../api/authApi';

export const authService = {
  login: async (credentials, type = 'user') => {
    try {
      const response = await authApi.login(credentials, type);
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);

        // Determine role from response or fallback to type
        // Normalize role: strip ROLE_ prefix and prioritize the intended login type
        const roles = response.roles || [];
        let role = type.toUpperCase();

        if (roles.length > 0) {
          // Look for a role that matches the intended type (e.g. ROLE_ADMIN for type 'admin')
          const matchedRole = roles.find(r => r === `ROLE_${type.toUpperCase()}` || r === type.toUpperCase());
          if (matchedRole) {
            role = matchedRole.replace('ROLE_', '');
          } else {
            // Fallback to first available role
            role = roles[0].replace('ROLE_', '');
          }
        }

        const userData = {
          userId: response.userId,
          email: credentials.email,
          role: role,
          ...response
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', role);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  adminLogin: async (credentials) => {
    return authService.login(credentials, 'admin');
  },

  employeeLogin: async (credentials) => {
    return authService.login(credentials, 'employee');
  },

  labLogin: async (credentials) => {
    return authService.login(credentials, 'lab');
  },

  forgotPassword: async (email) => {
    return authApi.forgotPassword(email);
  },

  resetPassword: async (resetData) => {
    return authApi.resetPassword(resetData);
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  },

  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('token')
};