import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Employee.css';
import { BASE_URL } from "/src/config/api.js";

// const BASE_URL = "https://jiojibackendv1-production.up.railway.app";

const getToken = () => {
  const token = localStorage.getItem("token");
  return token;
};

// Helper function to verify token before upload
const verifyTokenBeforeUpload = async (token) => {
  try {
    // Test token with a simple API call
    const res = await fetch(`${BASE_URL}/api/v1/admin/employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

const AddEditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ===== STATES ===== */
  const [showPreview, setShowPreview] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // Captured from registration

  const [files, setFiles] = useState({
    image: null,
    pan: null,
    aadhaar: null,
    passbook: null,
  });

  const [formData, setFormData] = useState({
    email: '',
    mobileNumber: '',
    role: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    city: '',
    permanentAddress: '',
    altMobileNumber: '',
    district: '',
    state: '',
    pfNumber: '',
    insuranceNumber: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    vehicleNumber: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* ===== LOAD EMPLOYEE ===== */
  useEffect(() => {
    if (!id) return;

    const loadEmployee = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/api/v1/admin/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth-login'); 
          return;
        }

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to load employee');

        setFormData({
          ...json.data,
          password: '', 
          confirmPassword: ''
        });
        setCurrentUserId(json.data?.userId || json.data?.userID || json.data?.id);
        setIsRegistered(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  /* ===== REGISTER USER (Phase 1) ===== */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Client-side validation with specific messages
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'email', label: 'Email ID' },
      { field: 'mobileNumber', label: 'Phone Number' },
      { field: 'role', label: 'User Type' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
      { field: 'permanentAddress', label: 'Permanent Address' },
      { field: 'district', label: 'District' },
      { field: 'state', label: 'State' },
      { field: 'accountNumber', label: 'Bank Account Number' },
      { field: 'ifscCode', label: 'IFSC Code' },
      { field: 'password', label: 'Password' },
      { field: 'confirmPassword', label: 'Confirm Password' }
    ];

    // Check for empty required fields
    const emptyFields = requiredFields.filter(({ field }) => !formData[field] || formData[field].toString().trim() === '');
    
    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(({ label }) => label).join(', ');
      setError(`❌ Please fill in the following required fields: ${fieldNames}`);
      setLoading(false);
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('❌ Password and Confirm Password do not match. Please check and try again.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('❌ Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('❌ Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Phone validation
    if (formData.mobileNumber.length < 10) {
      setError('❌ Phone number must be at least 10 digits.');
      setLoading(false);
      return;
    }

    try {
      setSuccessMessage('⏳ Registering employee... Please wait.');

      const payload = {
        email: formData.email,
        mobileNumber: parseInt(formData.mobileNumber),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        companyName: formData.companyName || '',
        address: formData.address,
        permanentAddress: formData.permanentAddress,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        panNumber: formData.panNumber || '',
        vehicleNumber: formData.vehicleNumber || '',
        description: formData.description || '',
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };

      const res = await fetch(`${BASE_URL}/api/auth/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      
      if (!res.ok) {
        // Parse backend error message for better clarity
        let errorMessage = json.message || 'Failed to register employee';
        
        // Check for specific error patterns
        if (errorMessage.toLowerCase().includes('email')) {
          errorMessage = `❌ Email Error: ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes('mobile') || errorMessage.toLowerCase().includes('phone')) {
          errorMessage = `❌ Phone Number Error: ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes('password')) {
          errorMessage = `❌ Password Error: ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes('validation')) {
          errorMessage = `❌ Validation Error: ${errorMessage}. Please check all required fields.`;
        } else {
          errorMessage = `❌ ${errorMessage}`;
        }
        
        throw new Error(errorMessage);
      }

      // CAPTURING USER ID FROM RESPONSE
      const userId = json.userID || json.data?.userID || json.data?.userId || json.data?.id || json.userId || json.id;
      
      if (!userId) {
        throw new Error('✅ Employee registered successfully, but User ID was not returned. Please refresh the page and try uploading documents.');
      }
      
      setCurrentUserId(userId);
      setIsRegistered(true);
      setSuccessMessage(`✅ Employee registered successfully! User ID: ${userId}. You can now upload documents below.`);
      setError('');
      
    } catch (err) {
      setError(err.message || '❌ Failed to register employee. Please try again.');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  /* ===== FILE UPLOAD (Enhanced with binary data conversion) ===== */
  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Map frontend type to backend enum names
    const documentTypeMap = {
      image: 'PROFILE_PHOTO',
      pan: 'PAN_CARD',
      aadhaar: 'AADHAAR_CARD',
      passbook: 'BANK_PASSBOOK'
    };

    const documentType = documentTypeMap[type];
    const documentLabel = {
      image: 'Profile Photo',
      pan: 'PAN Card',
      aadhaar: 'Aadhaar Card',
      passbook: 'Bank Passbook'
    }[type];

    // Determine which user ID to use
    const targetUserId = id || currentUserId;

    if (!targetUserId) {
      setError('❌ User ID not available. Please register the employee first before uploading documents.');
      return;
    }

    // Get admin token
    const token = getToken();
    if (!token) {
      setError('❌ Authentication token not found. Please login again.');
      navigate('/auth-login');
      return;
    }

    // Verify token is valid before attempting upload
    const isTokenValid = await verifyTokenBeforeUpload(token);
    if (!isTokenValid) {
      setError('❌ Your session has expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/auth-login');
      return;
    }

    // Create preview immediately for better UX
    setFiles((prev) => ({
      ...prev,
      [type]: { file, preview: URL.createObjectURL(file) },
    }));

    setSuccessMessage(`⏳ Uploading ${documentLabel}... Please wait.`);
    setError('');

    try {
      // Create FormData and append the actual file object directly
      const uploadFormData = new FormData();
      
      uploadFormData.append('file', file);
      uploadFormData.append('userId', targetUserId);
      uploadFormData.append('documentType', documentType);

      const res = await fetch(`${BASE_URL}/api/v1/documents/uploadByUser`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      // Handle 401 - Unauthorized (token expired/invalid)
      if (res.status === 401) {
        const errorJson = await res.json().catch(() => ({}));
        setError(`❌ Upload Failed: ${errorJson.message || "Invalid or expired token"}. Please login again.`);
        localStorage.removeItem("token");
        navigate("/auth-login");
        removeFile(type);
        return;
      }

      // Handle 403 - Forbidden (insufficient permissions)
      if (res.status === 403) {
        const errorJson = await res.json().catch(() => ({}));
        setError(`❌ Access denied: ${errorJson.message || "You don't have permission to upload documents"}`);
        removeFile(type);
        return;
      }

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || `Failed to upload ${documentLabel}`);
      }

      setSuccessMessage(`✅ ${documentLabel} uploaded successfully!`);
      setError('');
      
    } catch (err) {
      setError(`❌ Failed to upload ${documentLabel}: ${err.message}`);
      setSuccessMessage('');
      removeFile(type);
    }
  };

  const removeFile = (type) => {
    setFiles((prev) => {
      const current = prev[type];
      if (current?.preview) {
        URL.revokeObjectURL(current.preview);
      }
      return { ...prev, [type]: null };
    });
  };

  /* ===== FINAL SAVE ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id && !isRegistered) {
      setError("❌ Please register the employee first before saving.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const token = getToken();
      if (!token) {
        setError('❌ Authentication token not found. Please login again.');
        navigate('/auth-login');
        return;
      }

      setSuccessMessage('⏳ Saving employee details... Please wait.');

      const payload = {
        ...formData,
        mobileNumber: parseInt(formData.mobileNumber) || formData.mobileNumber
      };

      const url = id 
        ? `${BASE_URL}/api/v1/admin/employees/${id}` 
        : `${BASE_URL}/api/v1/admin/employees`; 

      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setError('❌ Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/auth-login');
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save employee details');

      setSuccessMessage(id ? '✅ Employee updated successfully! Redirecting...' : '✅ Employee registration complete! Redirecting...');
      
      setTimeout(() => {
        navigate('/admin/employees');
      }, 1500);
      
    } catch (err) {
      setError(`❌ ${err.message}`);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels = {
    firstName: 'First Name', lastName: 'Last Name', email: 'Email ID',
    mobileNumber: 'Phone Number', role: 'User Type', companyName: 'Company Name',
    address: 'Address', city: 'City', permanentAddress: 'Permanent Address',
    altMobileNumber: 'Alt Mobile Number', district: 'District', state: 'State',
    pfNumber: 'PF Number', insuranceNumber: 'Insurance Number', accountNumber: 'Account Number',
    ifscCode: 'IFSC Code', panNumber: 'PAN Number', vehicleNumber: 'Vehicle Number',
    description: 'Description'
  };

  return (
    <>
      <div className="employee-wrapper">
        <div className="employee-card">
          <div className="employee-header">
            <h2>{id ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p>{id ? 'Update employee information and documents' : 'Register a new employee in the system'}</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="success-message" style={{ 
              color: '#2e7d32', 
              padding: '12px 16px', 
              marginBottom: '16px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '6px',
              border: '1px solid #4caf50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>ℹ️</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ 
              color: '#c62828', 
              padding: '12px 16px', 
              marginBottom: '16px', 
              backgroundColor: '#ffebee', 
              borderRadius: '6px',
              border: '1px solid #ef5350',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* User ID Display */}
          {currentUserId && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '6px', 
              color: '#1565c0',
              border: '1px solid #2196f3',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <span><strong>User ID:</strong> {currentUserId} - Documents can now be uploaded below</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Form Fields Section */}
            <div className="grid-2">
              <div className="field">
                <label>First Name<span>*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter First Name" required />
              </div>
              <div className="field">
                <label>Last Name<span>*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter Last Name" required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Email ID<span>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
              </div>
              <div className="field">
                <label>Phone Number<span>*</span></label>
                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="XXXX XXXXX" required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>User Type<span>*</span></label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="">Select Role</option>
                  <option value="SURVEYOR">Supervisor(Employee)</option>
                  <option value="LAB_TECHNICIAN">Lab Technician</option>
                </select>
              </div>
              <div className="field">
                <label>Company Name</label>
                <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Address<span>*</span></label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
              </div>
              <div className="field">
                <label>City<span>*</span></label>
                <select name="city" value={formData.city} onChange={handleChange} required>
                  {/* <option value="">Select City</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option> */}
                   <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Nanded">Nanded</option>
                  <option value="Latur">Latur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Satara">Satara</option>
                  <option value="Ahmednagar">Ahmednagar</option>
                  <option value="Dhule">Dhule</option>
                  <option value="Beed">Beed</option>
                  <option value="Hingoli">Hingoli</option>
                  <option value="Buldhana">Buldhana</option>
                  <option value="Wardha">Wardha</option>
                  <option value="Chandrapur">Chandrapur</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Permanent Address<span>*</span></label>
                <input name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Permanent Address" required />
              </div>
              <div className="field">
                <label>Emergency Mobile Number</label>
                <input type="tel" name="altMobileNumber" value={formData.altMobileNumber} onChange={handleChange} placeholder="Emergency Mobile Number" />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>District<span>*</span></label>
                <input name="district" value={formData.district} onChange={handleChange} placeholder="District" required />
              </div>
              <div className="field">
                <label>State<span>*</span></label>
                <input name="state" value={formData.state} onChange={handleChange} placeholder="State (e.g., MH)" required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>PF Number</label>
                <input name="pfNumber" value={formData.pfNumber} onChange={handleChange} placeholder="PF Number" />
              </div>
              <div className="field">
                <label>Insurance Number</label>
                <input name="insuranceNumber" value={formData.insuranceNumber} onChange={handleChange} placeholder="Insurance Number" />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label> Bank Account Number<span>*</span></label>
                <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Bank Account Number" required />
              </div>
              <div className="field">
                <label>IFSC Code<span>*</span></label>
                <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="IFSC Code" required />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>PAN Number</label>
                <input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number" />
              </div>
              <div className="field">
                <label>Vehicle Number</label>
                <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle Number" />
              </div>
            </div>

            {!id && (
              <div className="grid-2">
                <div className="field">
                  <label>Password<span>*</span></label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Minimum 6 characters"
                    minLength="6"
                    required 
                  />
                </div>
                <div className="field">
                  <label>Confirm Password<span>*</span></label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Re-enter password"
                    minLength="6"
                    required 
                  />
                </div>
              </div>
            )}

            <div className="field full">
              <label>Description</label>
              <textarea rows="4" name="description" value={formData.description} onChange={handleChange} />
            </div>

            {/* ================= ACTIONS (Phase 1) ================= */}
            <div className="form-actions" style={{ marginBottom: '40px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
              {!id && (
                <button 
                  type="button" 
                  className="save-btn" 
                  onClick={handleRegister} 
                  disabled={loading || isRegistered}
                  style={{ 
                    opacity: (loading || isRegistered) ? 0.6 : 1,
                    cursor: (loading || isRegistered) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '⏳ Registering...' : isRegistered ? '✅ Registered' : '📝 Register Employee'}
                </button>
              )}
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/employees')}>
                ← Cancel
              </button>
            </div>

            {/* ================= UPLOAD SECTION (Phase 2) ================= */}
            {!id && !isRegistered && (
              <div style={{ 
                padding: '20px', 
                marginBottom: '20px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '6px',
                textAlign: 'center',
                color: '#666'
              }}>
                <p style={{ margin: 0 }}>📤 Document upload section will be enabled after employee registration</p>
              </div>
            )}

            <div 
              className="upload-grid" 
              style={{ 
                opacity: (isRegistered || id) ? 1 : 0.3, 
                pointerEvents: (isRegistered || id) ? 'auto' : 'none',
                transition: 'opacity 0.3s ease'
              }}
            >
              <div className="upload-box">
                <label>Upload Image</label>
                <div className="upload-row">
                  <label className="upload-btn">⬆ Upload<input type="file" hidden onChange={(e) => handleFileUpload('image', e)} /></label>
                  <button type="button" className="preview-btn" onClick={() => setShowPreview(true)}>Preview</button>
                  <button type="button" className="remove-btn" onClick={() => removeFile('image')} disabled={!files.image}>Remove</button>
                </div>
              </div>
              <div className="upload-box">
                <label>Upload PAN Card</label>
                <div className="upload-row">
                  <label className="upload-btn">⬆ Upload<input type="file" hidden onChange={(e) => handleFileUpload('pan', e)} /></label>
                  <button type="button" className="preview-btn" onClick={() => files.pan && window.open(files.pan.preview, '_blank')}>Preview</button>
                  <button type="button" className="remove-btn" onClick={() => removeFile('pan')} disabled={!files.pan}>Remove</button>
                </div>
              </div>
              <div className="upload-box">
                <label>Upload Aadhaar Card</label>
                <div className="upload-row">
                  <label className="upload-btn">⬆ Upload<input type="file" hidden onChange={(e) => handleFileUpload('aadhaar', e)} /></label>
                  <button type="button" className="preview-btn" onClick={() => files.aadhaar && window.open(files.aadhaar.preview, '_blank')}>Preview</button>
                  <button type="button" className="remove-btn" onClick={() => removeFile('aadhaar')} disabled={!files.aadhaar}>Remove</button>
                </div>
              </div>
              <div className="upload-box">
                <label>Upload Account Passbook</label>
                <div className="upload-row">
                  <label className="upload-btn">⬆ Upload<input type="file" hidden onChange={(e) => handleFileUpload('passbook', e)} /></label>
                  <button type="button" className="preview-btn" onClick={() => files.passbook && window.open(files.passbook.preview, '_blank')}>Preview</button>
                  <button type="button" className="remove-btn" onClick={() => removeFile('passbook')} disabled={!files.passbook}>Remove</button>
                </div>
              </div>
            </div>

            {/* ================= FINAL SAVE ================= */}
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading || (!isRegistered && !id)}
                style={{ 
                  opacity: (loading || (!isRegistered && !id)) ? 0.6 : 1,
                  cursor: (loading || (!isRegistered && !id)) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Saving...' : id ? '💾 Update Employee' : '💾 Save & Complete'}
              </button>
              {!id && !isRegistered && (
                <span style={{ marginLeft: '12px', color: '#666', fontSize: '14px' }}>
                  (Register employee first to enable save)
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>NEW USER DETAILS</h3>
              <span className="close" onClick={() => setShowPreview(false)}>×</span>
            </div>
            <div className="profile-row">
              {files.image ? <img src={files.image.preview} alt="profile" /> : <div className="profile-placeholder">No Image</div>}
              <div className="profile-info">
                <div className="profile-actions">
                  <button className="edit-btn" type="button" onClick={() => setShowPreview(false)}>Edit</button>
                  <button className="block-btn" type="button">Block</button>
                </div>
              </div>
            </div>
            <div className="details-section">
              <div className="details-grid">
                {Object.entries(formData).map(([key, value]) =>
                  value && !['password', 'confirmPassword'].includes(key) ? (
                    <div key={key} className={key === 'description' ? 'detail-item full' : 'detail-item'}>
                      <span className="detail-label">{fieldLabels[key] || key}</span>
                      <span className="detail-value">{String(value)}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEditEmployee;