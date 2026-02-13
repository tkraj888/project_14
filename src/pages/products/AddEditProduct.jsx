import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../config/api";
import { useToast } from "../../hooks/useToast";
import "./product.css";

const DESCRIPTION_TYPES = [
  { value: "VARIETY_OVERVIEW", label: "Variety Overview" },
  { value: "TRAITS_CHARACTERISTICS", label: "Traits & Characteristics" },
  { value: "CHARACTERISTICS", label: "Characteristics" },
  { value: "AGRONOMY", label: "Agronomy" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "DOWNLOAD", label: "Download" },
];

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    productType: "SEED",
    category: "RABI",
    price: "",
    //offers: "",
    active: true,
    breed: "",
    discount: "",
    productCategoryType: "SEEDS",

    // NEW: multiple sections
    sections: [
      {
        sectionType: "VARIETY_OVERVIEW",
        content: [""], // backend expects array
      },
    ],

    photoDTO: {
      imageUrl: "",
      uploadedAt: new Date().toISOString(),
      message: "",
    },
  });

  // API Configuration - Use environment variable and get token from localStorage
  const API_BASE_URL = `${BASE_URL}/api/v1/products`;
  
  // Helper function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Authentication required. Please login again.", "error");
      navigate("/admin-login");
      return null;
    }
    return token;
  };

  useEffect(() => {
    if (id) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(false);
      showToast("Edit mode disabled until GET endpoint provided", "info");
    } catch (error) {
      showToast("Failed to load product", "error");
    }
  };

  // Convenience: for preview, show first section content as "Description"
  const previewDescription = useMemo(() => {
    const first = formData.sections?.[0]?.content?.[0] ?? "";
    return first;
  }, [formData.sections]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "discount") {
      let numericValue = Number(value);

      // Prevent invalid values
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 100) numericValue = 100;

      setFormData((prev) => ({
        ...prev,
        discount: numericValue,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // NEW: section handlers
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { sectionType: "VARIETY_OVERVIEW", content: [""] },
      ],
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => {
      const next = [...(prev.sections || [])];
      next.splice(index, 1);
      return {
        ...prev,
        sections: next.length ? next : [{ sectionType: "VARIETY_OVERVIEW", content: [""] }],
      };
    });
  };

  const updateSectionType = (index, sectionType) => {
    setFormData((prev) => {
      const next = [...(prev.sections || [])];
      next[index] = { ...next[index], sectionType };
      return { ...prev, sections: next };
    });
  };

  const updateSectionContent = (index, text) => {
    setFormData((prev) => {
      const next = [...(prev.sections || [])];
      next[index] = { ...next[index], content: [text] };
      return { ...prev, sections: next };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setImagePreview(result);

      // For now store as base64/dataURL
      setFormData((prev) => ({
        ...prev,
        photoDTO: {
          ...prev.photoDTO,
          imageUrl: result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      photoDTO: {
        ...prev.photoDTO,
        imageUrl: "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get authentication token
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const cleanedSections = (formData.sections || [])
      .map((s) => ({
        sectionType: s.sectionType || "VARIETY_OVERVIEW",
        content: [String(s?.content?.[0] ?? "")],
      }))
      // optional: remove fully empty sections
      .filter((s) => (s.content?.[0] || "").trim().length > 0);

    const payload = {
      productId: Number(formData.productId),
      productName: formData.productName || "",
      productType: formData.productType || "SEED",
      category: formData.category || "RABI",
      price: parseFloat(formData.price) || 0,
      offers: formData.discount || 0,
      active: true,
      sections: cleanedSections.length
        ? cleanedSections
        : [{ sectionType: "VARIETY_OVERVIEW", content: [""] }],
      photoDTO: {
        imageUrl: formData.photoDTO?.imageUrl || "",
        uploadedAt: new Date().toISOString(),
        message: "Image uploaded successfully",
      },
    };

    if (import.meta.env.DEV) {
      console.log("🚀 Sending payload:", JSON.stringify(payload, null, 2));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      
      if (import.meta.env.DEV) {
        console.log("📡 Response status:", response.status);
        console.log("📡 Response body:", responseText);
      }

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      showToast("Product created successfully!", "success");
      navigate("/admin/products");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Full error:", error);
      }
      showToast(`Failed to save: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="product-page">
        <h1 className="page-title">Product & category management</h1>
        <h2 className="page-subtitle">{id ? "Edit Product" : "Add New Product"}</h2>
        <p className="page-desc">Basic Information</p>

        <div className="product-card">
          <form onSubmit={handleSubmit}>
            {/* Grid Row 1 */}
            <div className="grid-2">
              <div className="field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Ex: Product Name"
                  required
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="RABI">Rabi</option>
                  <option value="KHARIP">Kharip</option>
                  <option value="SUMMER">Summer</option>
                </select>
              </div>
            </div>

            {/* Grid Row 2 */}
            <div className="grid-2">
              <div className="field">
                <label>SKU / Product Code</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed || ""}
                  onChange={handleChange}
                  placeholder="TS-001"
                />
              </div>

              <div className="field">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="XXXX Rs"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Grid Row 3 */}
            <div className="grid-2">
              <div className="field">
                <label>Discount (optional)</label>
                <input
                  type="number"
                  name="discount"
                  placeholder="Enter discount %"
                  value={formData.discount ?? ""}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />

              </div>

              <div className="field">
                <label>Status</label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                >
                  <option value="SEED">Active</option>
                  <option value="FERTILIZER">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Product Category Type</label>
                <select
                  name="productCategoryType"
                  value={formData.productCategoryType || "SEEDS"}
                  onChange={handleChange}
                  required
                >
                  <option value="SEEDS">Seeds</option>
                  <option value="FERTILIZERS">Fertilizers</option>
                </select>
              </div>
            </div>

            {/* ================= MULTIPLE PRODUCT CONTENT SECTIONS ================= */}
            <div className="field full">
              <label>Product Content (Multiple)</label>

              {(formData.sections || []).map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <div className="grid-2">
                    <div className="field">
                      <label>Product Description Type</label>
                      <select
                        value={sec.sectionType || "VARIETY_OVERVIEW"}
                        onChange={(e) => updateSectionType(idx, e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        {DESCRIPTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field" style={{ display: "flex", gap: 8, alignItems: "end" }}>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeSection(idx)}
                        disabled={(formData.sections || []).length === 1}
                        style={{ height: 40 }}
                      >
                        Remove
                      </button>

                      <button
                        type="button"
                        className="preview-btn"
                        onClick={addSection}
                        style={{ height: 40 }}
                      >
                        + Add More
                      </button>
                    </div>
                  </div>

                  <div className="field full">
                    <label>Content</label>
                    <textarea
                      value={sec?.content?.[0] ?? ""}
                      onChange={(e) => updateSectionContent(idx, e.target.value)}
                      placeholder="Write section content..."
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="action-row left-align">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : id ? "Update Product" : "Save Product"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </button>
            </div>

            {/* Upload Image Section */}
            <div className="upload-section">
              <label>Upload Image</label>
              <div className="upload-row">
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  📤 Upload
                </label>
                <button
                  type="button"
                  className="preview-btn"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={handleRemoveImage}
                  disabled={!imagePreview}
                >
                  Remove
                </button>
              </div>
              <p className="upload-hint">(You can drop and upload image)</p>

              <div className="action-row left-align">
                <button type="submit" className="save-btn" disabled={loading}>
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>PRODUCT DETAILS</h3>
              <span className="close" onClick={() => setShowPreview(false)}>
                ×
              </span>
            </div>

            <div className="preview-header">
              <div className="preview-image">
                {imagePreview ? (
                  <img src={imagePreview} alt="product" />
                ) : (
                  <span className="preview-image-placeholder">No Image</span>
                )}
              </div>

              <div className="preview-info">
                {formData.breed && <p className="preview-sku">SKU: {formData.breed}</p>}
                <div className="preview-actions">
                  <button className="edit-btn" onClick={() => setShowPreview(false)}>
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-body">
              <div className="preview-grid">
                {formData.productName && (
                  <div className="preview-item">
                    <span className="preview-label">Product Name:</span>
                    <span className="preview-value">{formData.productName}</span>
                  </div>
                )}

                {formData.price && (
                  <div className="preview-item">
                    <span className="preview-label">Price</span>
                    <span className="preview-value">₹{formData.price}</span>
                  </div>
                )}

                {formData.category && (
                  <div className="preview-item">
                    <span className="preview-label">Category:</span>
                    <span className="preview-value">{formData.category}</span>
                  </div>
                )}

                {formData.productType && (
                  <div className="preview-item">
                    <span className="preview-label">Status</span>
                    <span className="preview-value">
                      {formData.productType === "SEED" ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}

                {formData.breed && (
                  <div className="preview-item">
                    <span className="preview-label">SKU/Code</span>
                    <span className="preview-value">{formData.breed}</span>
                  </div>
                )}

                {/* Preview: show ALL sections */}
                {(formData.sections || []).length > 0 && (
                  <div className="preview-item full">
                    <span className="preview-label">Description</span>

                    {(formData.sections || []).map((sec, idx) => (
                      <div key={idx} style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {sec.sectionType || "VARIETY_OVERVIEW"}
                        </div>
                        <p className="preview-description" style={{ margin: 0 }}>
                          {(sec?.content?.[0] ?? "").trim() ? sec.content[0] : "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* fallback */}
                {!formData.sections?.length && previewDescription && (
                  <div className="preview-item full">
                    <span className="preview-label">Description</span>
                    <p className="preview-description">{previewDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastComponent />
    </>
  );
};

export default AddEditProduct;
