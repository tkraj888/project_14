export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://jiojibackendv1-production.up.railway.app";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
