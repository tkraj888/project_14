import { BASE_URL, getAuthHeaders } from "../config/api";
import { extractResponseData } from "../utils/apiResponseHandler";

export const adminApi = {

  /* ================= DASHBOARD ================= */
  getDashboardStats: async () => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/dashboard/stats`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    const data = await res.json();
    return extractResponseData(data);
  },

  /* ================= EMPLOYEES ================= */
  getAllEmployees: async (page = 0, size = 10) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees?page=${page}&size=${size}`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch employees");
    const data = await res.json();
    return extractResponseData(data);
  },

  getEmployeeById: async (id) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/users/employees/${id}`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch employee");
    const data = await res.json();
    return extractResponseData(data);
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
    const responseData = await res.json();
    return extractResponseData(responseData);
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
    const responseData = await res.json();
    return extractResponseData(responseData);
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
    const responseData = await res.json();
    return extractResponseData(responseData);
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
    const responseData = await res.json();
    return extractResponseData(responseData);
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
    const data = await res.json();
    return extractResponseData(data);
  },

  /* ================= ATTENDANCE ================= */
  
  // Get all employees' attendance for a specific month/year
  getAllEmployeesAttendance: async (month, year) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/attendance/admin/all-employees?month=${month}&year=${year}`,
      { headers: getAuthHeaders() }
    );

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) throw new Error("Failed to fetch all employees attendance");
    const response = await res.json();
    return extractResponseData(response);
  },

  // Get specific employee's attendance for a specific month/year
  getEmployeeAttendanceHistory: async (employeeId, month, year) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/admin/attendance/employee/${employeeId}?month=${month}&year=${year}`,
      { headers: getAuthHeaders() }
    );

    if (res.status === 404) {
      return { records: [] };
    }

    if (!res.ok) throw new Error("Failed to fetch attendance history");
    const response = await res.json();
    
    return extractResponseData(response);
  },

  // Get employee attendance by date range
  getEmployeeAttendanceByDateRange: async (employeeId, startDate, endDate) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/attendance/admin/attendance/employee/${employeeId}/range?startDate=${startDate}&endDate=${endDate}`,
      { headers: getAuthHeaders() }
    );

    if (res.status === 404) {
      return { records: [] };
    }

    if (!res.ok) throw new Error("Failed to fetch attendance by date range");
    const response = await res.json();
    return extractResponseData(response);
  },

  // Get employee attendance for specific date
  getEmployeeAttendanceByDate: async (employeeId, date) => {
    const res = await fetch(
      `${BASE_URL}/api/v1/attendance/admin/attendance/employee/${employeeId}/date/${date}`,
      { headers: getAuthHeaders() }
    );

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) throw new Error("Failed to fetch attendance for date");
    const response = await res.json();
    return extractResponseData(response);
  }
};
