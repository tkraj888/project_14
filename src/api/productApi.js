import { BASE_URL, getAuthHeaders } from "../config/api";

export const productApi = {

  /* -------- Public / User: List Products -------- */
  getAllProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(
      `${BASE_URL}/products/list?${query}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch products");
    }

    const result = await response.json();
    return result.data; // PageResponseDto
  },

  /* -------- Product by ID -------- */
  getProductById: async (id) => {
    const response = await fetch(
      `${BASE_URL}/products/${id}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch product");
    }

    const result = await response.json();
    return result.data; // ProductDto
  },

  /* -------- Admin: Create Product -------- */
  createProduct: async (formData) => {
      const response = await fetch(`${BASE_URL}/products/add`, {
        method: "POST",
        headers: getAuthHeaders(true), // true = FormData upload
        body: formData // FormData object, not JSON
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create product");
      }

      return await response.json();
    },

  /* -------- Admin: Update Product -------- */
  updateProduct: async (id, productData) => {
    const response = await fetch(
      `${BASE_URL}/products/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update product");
    }

    const result = await response.json();
    return result.data;
  },

  /* -------- Admin: Delete Product -------- */
  deleteProduct: async (id) => {
    const response = await fetch(
      `${BASE_URL}/products/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete product");
    }

    const result = await response.json();
    return result.data;
  }
};
