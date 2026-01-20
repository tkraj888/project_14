import { BASE_URL, getAuthHeaders } from "./apiConfig";

export const adminApi = {

  /* ================= DASHBOARD ================= */
  getDashboardStats: async () => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/dashboard/stats`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return (await res.json()).data;
  },

  /* ================= EMPLOYEES ================= */
  getAllEmployees: async (page = 0, size = 10) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
  },

  getEmployeeById: async (id) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees/${id}`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch employee");
    return res.json();
  },

  createEmployee: async (data) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/create-employee`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!res.ok) throw new Error("Failed to create employee");
    return res.json();
  },

  updateEmployee: async (id, data) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!res.ok) throw new Error("Failed to update employee");
    return res.json();
  },

  deleteEmployee: async (id) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders()
      }
    );

    if (!res.ok) throw new Error("Failed to delete employee");
    return true;
  },

  /* ================= PRODUCTS ================= */
  addProduct: async (data) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/products/add`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!res.ok) throw new Error("Failed to add product");
    return res.json();
  },

  updateProduct: async (id, data) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/products/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/products/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders()
      }
    );

    if (!res.ok) throw new Error("Failed to delete product");
    return true;
  },

  /* ================= FARMERS ================= */
  getAllFarmers: async (page = 0, size = 10) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/farmer-form?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch farmers");
    return res.json();
  }
};
