import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Employee.css';

const BASE_URL = "https://jiojibackendv1-production.up.railway.app";
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
    description: '',
    acceptTerms: false,
    acceptPrivacyPolicy: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms || !formData.acceptPrivacyPolicy) {
      setError('Please accept Terms and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
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
        acceptTerms: formData.acceptTerms,
        acceptPrivacyPolicy: formData.acceptPrivacyPolicy
      };

      const res = await fetch(`${BASE_URL}/api/auth/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      
      if (!res.ok) throw new Error(json.message || 'Failed to register employee');

      // CAPTURING USER ID FROM RESPONSE - Check all possible field names including userID
      const userId = json.userID || json.data?.userID || json.data?.userId || json.data?.id || json.userId || json.id;
      
      if (!userId) {
        console.warn('User ID not found in response:', json);
        throw new Error('User registered but ID not returned. Please refresh and try uploading documents.');
      }

      // //console.log('Captured User ID:', userId); // Debug log
      
      setCurrentUserId(userId);
      setIsRegistered(true);
      
      alert(`Employee registered successfully! User ID: ${userId}\nYou can now upload documents.`);
      
    } catch (err) {
      setError(err.message || 'Failed to register employee');
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

    // Determine which user ID to use
    const targetUserId = id || currentUserId;

    if (!targetUserId) {
      alert('User ID not available. Please register the user first or ensure the employee is loaded.');
      return;
    }

    // Get admin token
    const token = getToken();
    if (!token) {
      alert('Authentication token not found. Please login again.');
      navigate('/auth-login');
      return;
    }

    // Verify token is valid before attempting upload
    const isTokenValid = await verifyTokenBeforeUpload(token);
    if (!isTokenValid) {
      alert('Your session has expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/auth-login');
      return;
    }

    //console.log('Token verified successfully');
    //console.log('Target User ID:', targetUserId);
    //console.log('Document Type:', documentType);

    // Create preview immediately for better UX
    setFiles((prev) => ({
      ...prev,
      [type]: { file, preview: URL.createObjectURL(file) },
    }));

    try {
      // Create FormData and append the actual file object directly
      const uploadFormData = new FormData();
      
      // Append the original file object (NOT converted to binary)
      uploadFormData.append('file', file);
      uploadFormData.append('userId', targetUserId);
      uploadFormData.append('documentType', documentType);

      //console.log('=== UPLOAD DEBUG INFO ===');
      //console.log(`File Name: ${file.name}`);
      //console.log(`File Size: ${file.size} bytes`);
      //console.log(`File Type: ${file.type}`);
      //console.log(`Document Type: ${documentType}`);
      //console.log(`User ID: ${targetUserId}`);
      //console.log('FormData contents:');
      for (let pair of uploadFormData.entries()) {
        //console.log(`  ${pair[0]}:`, pair[1]);
      }
      //console.log('========================');

      const res = await fetch(`${BASE_URL}/api/v1/documents/uploadByUser`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type when sending FormData - browser sets it with boundary
        },
        body: uploadFormData,
      });

      //console.log('Upload response status:', res.status);
      //console.log('Upload response headers:', Object.fromEntries(res.headers.entries()));

      // Handle 401 - Unauthorized (token expired/invalid)
      if (res.status === 401) {
        const errorJson = await res.json().catch(() => ({}));
        console.error('401 Error Response:', errorJson);
        alert(`Upload Failed: ${errorJson.message || "Invalid or expired token"}. Please login again.`);
        localStorage.removeItem("token");
        navigate("/auth-login");
        removeFile(type);
        return;
      }

      // Handle 403 - Forbidden (insufficient permissions)
      if (res.status === 403) {
        const errorJson = await res.json().catch(() => ({}));
        alert(`Access denied: ${errorJson.message || "You don't have permission to upload documents"}`);
        removeFile(type);
        return;
      }

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || `Failed to upload ${documentType}`);
      }

      alert(`${documentType} uploaded successfully!`);
      //console.log(`Upload response for ${documentType}:`, json);
      
    } catch (err) {
      console.error(`Upload error for ${type}:`, err);
      alert(`Failed to upload ${documentType || type}: ${err.message}`);
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
      alert("Please register the user first.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      if (!token) {
        alert('Authentication token not found. Please login again.');
        navigate('/auth-login');
        return;
      }

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
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/auth-login');
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save updates');

      alert(id ? 'Employee updated successfully!' : 'Registration process complete!');
      navigate('/admin/employees');
      
    } catch (err) {
      setError(err.message);
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
            <p>Define item attributes and specifications</p>
          </div>

          {error && <div className="error-message" style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>{error}</div>}

          {currentUserId && (
            <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32' }}>
              <strong>User ID:</strong> {currentUserId} (Use this for document uploads)
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
                <label>Alt Mobile Number</label>
                <input type="tel" name="altMobileNumber" value={formData.altMobileNumber} onChange={handleChange} placeholder="Alt Mobile Number" />
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
                <label>Account Number<span>*</span></label>
                <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" required />
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
              <>
                <div className="grid-2">
                  <div className="field">
                    <label>Password<span>*</span></label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Confirm Password<span>*</span></label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
                <div className="field full">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
                    <span>I accept the Terms and Conditions<span>*</span></span>
                  </label>
                </div>
                <div className="field full">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="acceptPrivacyPolicy" checked={formData.acceptPrivacyPolicy} onChange={handleChange} required />
                    <span>I accept the Privacy Policy<span>*</span></span>
                  </label>
                </div>
              </>
            )}

            <div className="field full">
              <label>Description</label>
              <textarea rows="4" name="description" value={formData.description} onChange={handleChange} />
            </div>

            {/* ================= ACTIONS (Phase 1) ================= */}
            <div className="form-actions" style={{ marginBottom: '40px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
              {!id && (
                <button type="button" className="save-btn" onClick={handleRegister} disabled={loading || isRegistered}>
                  {isRegistered ? 'Registered ✓' : 'Register User'}
                </button>
              )}
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/employees')}>Cancel</button>
            </div>

            {/* ================= UPLOAD SECTION (Phase 2) ================= */}
            <div className="upload-grid" style={{ opacity: (isRegistered || id) ? 1 : 0.5, pointerEvents: (isRegistered || id) ? 'auto' : 'none' }}>
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
              <button type="submit" className="save-btn" disabled={loading || (!isRegistered && !id)}>
                {loading ? 'Saving...' : id ? 'Update User' : 'Save'}
              </button>
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
                  value && !['password', 'confirmPassword', 'acceptTerms', 'acceptPrivacyPolicy'].includes(key) ? (
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