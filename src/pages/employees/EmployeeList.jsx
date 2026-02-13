// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { MoreVertical, Eye, Power, PowerOff, Search } from "lucide-react";
// import "./EmployeeList1.css";

// const BASE_URL = "https://jiojibackendv1-production.up.railway.app";
// const getToken = () => localStorage.getItem("token");

// const EmployeeList = () => {
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [open, setOpen] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({});

//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [roleFilter, setRoleFilter] = useState("ALL");

//   const menuRef = useRef(null);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const isMobile = windowWidth <= 768;
//   const isSmallMobile = windowWidth <= 480;

//   /* ================= FETCH EMPLOYEES - UPDATED ENDPOINT ================= */
//   const fetchEmployees = async () => {
//     setLoading(true);
//     setError("");
    
//     try {
//       const token = getToken();
//       if (!token) {
//         navigate("/AuthLogin");
//         return;
//       }

//       // Build URL with role filter if selected (don't add role param if ALL is selected)
//       let url = `${BASE_URL}/api/v1/employees/getUsers`;
//       if (roleFilter && roleFilter !== "ALL") {
//         url += `?role=${roleFilter}`;
//       }

//       const res = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.status === 401) {
//         localStorage.removeItem("token");
//         navigate("/AuthLogin");
//         return;
//       }

//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Failed to load employees");

//       if (json.data?.content) {
//         // Map API response to component structure
//         const mappedEmployees = json.data.content.map(emp => ({
//           userId: emp.userId,
//           employeeCode: emp.employeeCode,
//           fullName: emp.name,
//           userEmail: emp.email,
//           userMobile: emp.mobile,
//           status: emp.accountLocked ? "BLOCKED" : "ACTIVE",
//           accountLocked: emp.accountLocked
//         }));
//         setEmployees(mappedEmployees);
//         setTotalPages(json.data.totalPages || 1);
//       } else if (Array.isArray(json.data)) {
//         setEmployees(json.data);
//       } else {
//         setEmployees(Array.isArray(json) ? json : []);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, [page, roleFilter]);

//   useEffect(() => {
//     const closeMenu = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setOpen(null);
//       }
//     };
//     document.addEventListener("mousedown", closeMenu);
//     return () => document.removeEventListener("mousedown", closeMenu);
//   }, []);

//   /* ================= DEACTIVATE EMPLOYEE - UPDATED ================= */
//   const handleDeactivate = async (employee) => {
//     // Decide lock/unlock based on accountLocked field
//     const accountLocked = employee.accountLocked || employee.status === "BLOCKED" || employee.status === "INACTIVE";
   
//     const actionText = accountLocked ? "unlock" : "lock";
   
//     if (!window.confirm(`Are you sure you want to ${actionText} this employee?`))
//       return;
   
//     try {
//       const token = getToken();
   
//       const res = await fetch(
//         `${BASE_URL}/api/v1/employees/user/${employee.userId}/account-lock?accountLocked=${!accountLocked}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
   
//       const json = await res.json();
   
//       if (res.ok) {
//         alert(json.message || `Employee ${actionText}ed successfully`);
//         fetchEmployees();
//         setOpen(null);
//       } else {
//         throw new Error(json.message || `Failed to ${actionText} employee`);
//       }
//     } catch (error) {
//       alert("Error: " + error.message);
//     }
//   };

//   /* ================= FETCH DETAILS BY ID ================= */
//   const handleView = async (employee) => {
//     setShowModal(true);
//     setLoadingDetails(true);
//     setOpen(null);
//     setIsEditing(false);

//     try {
//       const token = getToken();
//       const res = await fetch(`${BASE_URL}/api/v1/employees/user/${employee.userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Failed to fetch details");

//       const employeeData = json.data || json;
//       setSelectedEmployee(employeeData);
      
//       // Initialize edit form - keeping the same field names as API expects
//       setEditForm({
//         userEmail: employeeData.userEmail || "",
//         userMobile: employeeData.userMobile || "",
//         companyName: employeeData.companyName || "",
//         address: employeeData.address || "",
//         permanentAddress: employeeData.permanentAddress || "",
//         city: employeeData.city || "",
//         district: employeeData.district || "",
//         state: employeeData.state || "",
//         accountNumber: employeeData.accountNumber || "",
//         ifscCode: employeeData.ifscCode || "",
//         pfNumber: employeeData.pfNumber || "",
//         insuranceNumber: employeeData.insuranceNumber || "",
//         panNumber: employeeData.panNumber || "",
//         vehicleNumber: employeeData.vehicleNumber || "",
//         description: employeeData.description || "",
//       });
//     } catch (err) {
//       console.error("View Error:", err);
//       setSelectedEmployee(employee);
//       setEditForm({
//         userEmail: employee.userEmail || "",
//         userMobile: employee.userMobile || "",
//         companyName: employee.companyName || "",
//         address: employee.address || "",
//         permanentAddress: employee.permanentAddress || "",
//         city: employee.city || "",
//         district: employee.district || "",
//         state: employee.state || "",
//         accountNumber: employee.accountNumber || "",
//         ifscCode: employee.ifscCode || "",
//         pfNumber: employee.pfNumber || "",
//         insuranceNumber: employee.insuranceNumber || "",
//         panNumber: employee.panNumber || "",
//         vehicleNumber: employee.vehicleNumber || "",
//         description: employee.description || "",
//       });
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   const handleEditChange = (key, value) => {
//     setEditForm((prev) => ({ ...prev, [key]: value }));
//   };

//   /* ================= SAVE EMPLOYEE (UPDATE) - UPDATED ENDPOINT ================= */
//   const handleSaveEmployee = async () => {
//     try {
//       const token = getToken();
//       if (!token) return;

//       // Prepare payload with exact field names from API
//       const payload = {
//         userEmail: editForm.userEmail,
//         userMobile: editForm.userMobile,
//         companyName: editForm.companyName,
//         address: editForm.address,
//         permanentAddress: editForm.permanentAddress,
//         city: editForm.city,
//         district: editForm.district,
//         state: editForm.state,
//         accountNumber: editForm.accountNumber,
//         ifscCode: editForm.ifscCode,
//         pfNumber: editForm.pfNumber,
//         insuranceNumber: editForm.insuranceNumber,
//         panNumber: editForm.panNumber,
//         vehicleNumber: editForm.vehicleNumber,
//         description: editForm.description,
//       };

//       // Using updated endpoint
//       const res = await fetch(`${BASE_URL}/api/v1/employees/user/${selectedEmployee.userId}`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json();

//       if (!res.ok) throw new Error(json.message || "Failed to update");
      
//       alert(json.message || "Employee updated successfully ✅");
//       fetchEmployees();
//       setShowModal(false);
//       setIsEditing(false);
//     } catch (error) {
//       alert("Error: " + error.message);
//     }
//   };

//   const handleBlock = async (employee) => {
//     const action = employee.status === "BLOCKED" ? "unblock" : "block";
//     if (!window.confirm(`Are you sure you want to ${action} this employee?`)) return;
//     try {
//       const token = getToken();
//       const newStatus = employee.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
//       await fetch(`${BASE_URL}/api/v1/admin/employees/${employee.userId}`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });
//       fetchEmployees();
//       setShowModal(false);
//     } catch (error) {
//       alert("Error: " + error.message);
//     }
//   };

//   if (loading) return <div className="loading"><div className="spinner"></div></div>;

//   return (
//     <div className="page" style={{ padding: isMobile ? "10px" : "20px" }}>
//       <div className="top" style={{ flexDirection: isMobile ? "column" : "row", gap: "15px" }}>
//         <h3>Employee management</h3>
//         <div className="top-actions" style={{ width: isMobile ? "100%" : "auto", justifyContent: "space-between" }}>
//           <button className="secondary-btn" onClick={() => navigate("/admin/attendance")}>View Attendance</button>
//           <Link to="/admin/employees/add" className="add-btn">+ Add Employee</Link>
//         </div>
//       </div>

//       <div className="filters">
//         <div className="search">
//           <input placeholder="User Search" />
//           <Search size={16} />
//         </div>
//         <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
//           <option value="ALL">All Roles</option>
//           <option value="SURVEYOR">SURVEYOR</option>
//           <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
//         </select>
//         <button className="clear" onClick={() => setRoleFilter("ALL")}>Clear</button>
//       </div>

//       <div className="table-box" style={{ width: "100%", overflowX: "auto" }}>
//         <table style={{ minWidth: isMobile ? "850px" : "100%", width: "100%" }}>
//           <thead>
//             <tr>
//               <th><input type="checkbox" /></th>
//               <th>Emp ID</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Mobile</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {employees.length ? (
//               employees.map((e, i) => (
//                 <tr key={e.userId}>
//                   <td><input type="checkbox" /></td>
//                   <td>{e.employeeCode || `U-${e.userId}`}</td>
//                   <td>{e.fullName || e.name || e.userEmail?.split('@')[0] || "N/A"}</td>
//                   <td>{e.userEmail || e.email || "N/A"}</td>
//                   <td>{e.userMobile || e.mobile || "N/A"}</td>
//                   <td><span className={e.accountLocked || e.status === "BLOCKED" || e.status === "INACTIVE" ? "out" : "active"}>
//                     {e.accountLocked ? "BLOCKED" : (e.status || "ACTIVE")}
//                   </span></td>
//                   <td className="action">
//                     <div ref={open === i ? menuRef : null}>
//                       <MoreVertical size={16} onClick={() => setOpen(open === i ? null : i)} style={{ cursor: "pointer" }} />
//                       {open === i && (
//                         <div className="menu" style={{ right: 0 }}>
//                           <span onClick={() => handleView(e)}><Eye size={14} /> View</span>
//                           {(e.accountLocked || e.status === "BLOCKED" || e.status === "INACTIVE") ? (
//                             <span onClick={() => handleDeactivate(e)} style={{ color: "#28a745" }}>
//                               <Power size={14} /> Activate
//                             </span>
//                           ) : (
//                             <span className="del" onClick={() => handleDeactivate(e)}>
//                               <PowerOff size={14} /> Deactivate
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan="7" className="empty">No employees found</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="pagination">
//         <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Pre</button>
//         <button className="active">{page + 1}</button>
//         <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>Next</button>
//       </div>

//       {showModal && selectedEmployee && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ padding: "10px" }}>
//           <div className="modal-details" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", width: "100%", maxHeight: "95vh", overflowY: "auto" }}>
            
//             <div className="modal-header" style={{ borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
//               <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>USER DETAILS</h4>
//               <span className="close-icon" onClick={() => setShowModal(false)} style={{ cursor: "pointer", fontSize: "24px" }}>×</span>
//             </div>

//             <div className="modal-body" style={{ padding: isMobile ? "15px" : "30px" }}>
//               {loadingDetails ? (
//                 <div style={{ textAlign: 'center', padding: '20px' }}>Loading Details...</div>
//               ) : (
//                 <>
//                   <div className="profile-section" style={{ flexDirection: isMobile ? "column" : "row", marginBottom: "30px" }}>
//                     <div className="profile-image">
//                       <div style={{ width: "100px", height: "100px", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", fontSize: "24px" }}>
//                         {selectedEmployee.userEmail?.charAt(0).toUpperCase()}
//                       </div>
//                     </div>
//                     <div className="profile-info" style={{ gap: "10px" }}>
//                       <p className="emp-id" style={{ fontSize: "18px", color: "#666" }}>Emp ID: {selectedEmployee.employeeCode}</p>
//                       <div className="action-buttons">
//                         {!isEditing ? (
//                           <>
//                             <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
//                             <button className="btn-block" onClick={() => handleBlock(selectedEmployee)}>
//                               {selectedEmployee.status === "BLOCKED" ? "Unblock" : "Block"}
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button className="btn-edit" onClick={handleSaveEmployee}>Save</button>
//                             <button className="btn-block" onClick={() => setIsEditing(false)} style={{ background: "#6c757d" }}>Cancel</button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="details-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "20px 15px" }}>
//                     {[
//                       { label: "Full Name", key: "fullName", readOnly: true },
//                       { label: "Email ID", key: "userEmail" },
//                       { label: "Phone Number", key: "userMobile" },
//                       { label: "User Type", key: "role", readOnly: true },
//                       { label: "Company Name", key: "companyName" },
//                       { label: "Address", key: "address" },
//                       { label: "City", key: "city" },
//                       { label: "Permanent Address", key: "permanentAddress" },
//                       { label: "District", key: "district" },
//                       { label: "State", key: "state" },
//                       { label: "PF Number", key: "pfNumber" },
//                       { label: "Insurance Number", key: "insuranceNumber" },
//                       { label: "Account Number", key: "accountNumber" },
//                       { label: "IFSC Code", key: "ifscCode" },
//                       { label: "PAN Number", key: "panNumber" },
//                       { label: "Vehicle Number", key: "vehicleNumber" },
//                     ].map((field) => (
//                       <div className="detail-item" key={field.key}>
//                         <label>{field.label}</label>
//                         {isEditing && !field.readOnly ? (
//                           <input 
//                             value={editForm[field.key] || ""} 
//                             onChange={(e) => handleEditChange(field.key, e.target.value)} 
//                           />
//                         ) : (
//                           <p>{selectedEmployee[field.key] || "N/A"}</p>
//                         )}
//                       </div>
//                     ))}
//                     <div className="detail-item" style={{ gridColumn: isSmallMobile ? "auto" : "span 2" }}>
//                       <label>Description</label>
//                       {isEditing ? (
//                         <input value={editForm.description || ""} onChange={(e) => handleEditChange("description", e.target.value)} />
//                       ) : (
//                         <p>{selectedEmployee.description || "----------"}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="view-buttons" style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px", display: "flex", gap: "10px" }}>
//                     <button className="view-btn">View PAN</button>
//                     <button className="view-btn">View Aadhaar</button>
//                     <button className="view-btn">View Passbook</button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;


import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Power, PowerOff, Search, MapPin } from "lucide-react";
import "./EmployeeList1.css";

// const BASE_URL = "https://jiojibackendv1-production.up.railway.app";
const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  /* ================= FETCH EMPLOYEES - UPDATED ENDPOINT ================= */
  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = getToken();
      if (!token) {
        navigate("/AuthLogin");
        return;
      }

      // Build URL with role filter if selected (don't add role param if ALL is selected)
      let url = `${BASE_URL}/api/v1/employees/getUsers`;
      if (roleFilter && roleFilter !== "ALL") {
        url += `?role=${roleFilter}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/AuthLogin");
        return;
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load employees");

      if (json.data?.content) {
        // Map API response to component structure
        const mappedEmployees = json.data.content.map(emp => ({
          userId: emp.userId,
          employeeCode: emp.employeeCode,
          fullName: emp.name,
          userEmail: emp.email,
          userMobile: emp.mobile,
          status: emp.accountLocked ? "BLOCKED" : "ACTIVE",
          accountLocked: emp.accountLocked
        }));
        setEmployees(mappedEmployees);
        setTotalPages(json.data.totalPages || 1);
      } else if (Array.isArray(json.data)) {
        setEmployees(json.data);
      } else {
        setEmployees(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, roleFilter]);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const searchableFields = [
      emp.employeeCode,
      emp.fullName,
      emp.name,
      emp.userEmail,
      emp.email,
      emp.userMobile,
      emp.mobile,
    ];
    
    return searchableFields.some(field => 
      field?.toString().toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  /* ================= DEACTIVATE EMPLOYEE - UPDATED ================= */
  const handleDeactivate = async (employee) => {
    // Decide lock/unlock based on accountLocked field
    const accountLocked = employee.accountLocked || employee.status === "BLOCKED" || employee.status === "INACTIVE";
   
    const actionText = accountLocked ? "unlock" : "lock";
   
    if (!window.confirm(`Are you sure you want to ${actionText} this employee?`))
      return;
   
    try {
      const token = getToken();
   
      const res = await fetch(
        `${BASE_URL}/api/v1/employees/user/${employee.userId}/account-lock?accountLocked=${!accountLocked}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
   
      const json = await res.json();
   
      if (res.ok) {
        alert(json.message || `Employee ${actionText}ed successfully`);
        fetchEmployees();
        setOpen(null);
      } else {
        throw new Error(json.message || `Failed to ${actionText} employee`);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  /* ================= FETCH DETAILS BY ID ================= */
  const handleView = async (employee) => {
    setShowModal(true);
    setLoadingDetails(true);
    setOpen(null);
    setIsEditing(false);

    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/v1/employees/user/${employee.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch details");

      const employeeData = json.data || json;
      setSelectedEmployee(employeeData);
      
      // Initialize edit form - keeping the same field names as API expects
      setEditForm({
        userEmail: employeeData.userEmail || "",
        userMobile: employeeData.userMobile || "",
        companyName: employeeData.companyName || "",
        address: employeeData.address || "",
        permanentAddress: employeeData.permanentAddress || "",
        city: employeeData.city || "",
        district: employeeData.district || "",
        state: employeeData.state || "",
        accountNumber: employeeData.accountNumber || "",
        ifscCode: employeeData.ifscCode || "",
        pfNumber: employeeData.pfNumber || "",
        insuranceNumber: employeeData.insuranceNumber || "",
        panNumber: employeeData.panNumber || "",
        vehicleNumber: employeeData.vehicleNumber || "",
        description: employeeData.description || "",
      });
    } catch (err) {
      console.error("View Error:", err);
      setSelectedEmployee(employee);
      setEditForm({
        userEmail: employee.userEmail || "",
        userMobile: employee.userMobile || "",
        companyName: employee.companyName || "",
        address: employee.address || "",
        permanentAddress: employee.permanentAddress || "",
        city: employee.city || "",
        district: employee.district || "",
        state: employee.state || "",
        accountNumber: employee.accountNumber || "",
        ifscCode: employee.ifscCode || "",
        pfNumber: employee.pfNumber || "",
        insuranceNumber: employee.insuranceNumber || "",
        panNumber: employee.panNumber || "",
        vehicleNumber: employee.vehicleNumber || "",
        description: employee.description || "",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE EMPLOYEE (UPDATE) - UPDATED ENDPOINT ================= */
  const handleSaveEmployee = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // Prepare payload with exact field names from API
      const payload = {
        userEmail: editForm.userEmail,
        userMobile: editForm.userMobile,
        companyName: editForm.companyName,
        address: editForm.address,
        permanentAddress: editForm.permanentAddress,
        city: editForm.city,
        district: editForm.district,
        state: editForm.state,
        accountNumber: editForm.accountNumber,
        ifscCode: editForm.ifscCode,
        pfNumber: editForm.pfNumber,
        insuranceNumber: editForm.insuranceNumber,
        panNumber: editForm.panNumber,
        vehicleNumber: editForm.vehicleNumber,
        description: editForm.description,
      };

      // Using updated endpoint
      const res = await fetch(`${BASE_URL}/api/v1/employees/user/${selectedEmployee.userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to update");
      
      alert(json.message || "Employee updated successfully ✅");
      fetchEmployees();
      setShowModal(false);
      setIsEditing(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleBlock = async (employee) => {
    const action = employee.status === "BLOCKED" ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this employee?`)) return;
    try {
      const token = getToken();
      const newStatus = employee.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
      await fetch(`${BASE_URL}/api/v1/admin/employees/${employee.userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchEmployees();
      setShowModal(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page" style={{ padding: isMobile ? "10px" : "20px" }}>
      <div className="top" style={{ flexDirection: isMobile ? "column" : "row", gap: "15px" }}>
        <h3>Employee management</h3>
        <div className="top-actions" style={{ width: isMobile ? "100%" : "auto", justifyContent: "space-between" }}>
          {/* <button className="secondary-btn" onClick={() => navigate("/admin/attendance")}>View Attendance</button> */}
            <button className="secondary-btn" onClick={() => navigate("/admin/attendancemanagement")}>Attendance Management</button>
          <Link to="/admin/employees/add" className="add-btn">+ Add Employee</Link>
        </div>
      </div>

      <div className="filters">
        <div className="search">
          <input 
            placeholder="User Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="SURVEYOR">SURVEYOR</option>
          <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
        </select>
        <button className="clear" onClick={() => {
          setRoleFilter("ALL");
          setSearchQuery("");
        }}>Clear</button>
      </div>

      <div className="table-box" style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ minWidth: isMobile ? "850px" : "100%", width: "100%" }}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length ? (
              filteredEmployees.map((e, i) => (
                <tr key={e.userId}>
                  <td><input type="checkbox" /></td>
                  <td>{e.employeeCode || `U-${e.userId}`}</td>
                  <td>{e.fullName || e.name || e.userEmail?.split('@')[0] || "N/A"}</td>
                  <td>{e.userEmail || e.email || "N/A"}</td>
                  <td>{e.userMobile || e.mobile || "N/A"}</td>
                  <td><span className={e.accountLocked || e.status === "BLOCKED" || e.status === "INACTIVE" ? "out" : "active"}>
                    {e.accountLocked ? "BLOCKED" : (e.status || "ACTIVE")}
                  </span></td>
                  <td className="action">
                    <div ref={open === i ? menuRef : null}>
                      <MoreVertical size={16} onClick={() => setOpen(open === i ? null : i)} style={{ cursor: "pointer" }} />
                      {open === i && (
                        <div className="menu" style={{ right: 0 }}>
                          <span onClick={() => handleView(e)}><Eye size={14} /> View</span>
                          <span onClick={() => navigate(`/admin/employee-location/${e.userId}`)} style={{ color: "#007bff" }}>
                            <MapPin size={14} /> Location History
                          </span>
                          {(e.accountLocked || e.status === "BLOCKED" || e.status === "INACTIVE") ? (
                            <span onClick={() => handleDeactivate(e)} style={{ color: "#28a745" }}>
                              <Power size={14} /> Activate
                            </span>
                          ) : (
                            <span className="del" onClick={() => handleDeactivate(e)}>
                              <PowerOff size={14} /> Deactivate
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="empty">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Pre</button>
        <button className="active">{page + 1}</button>
        <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>Next</button>
      </div>

      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ padding: "10px" }}>
          <div className="modal-details" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", width: "100%", maxHeight: "95vh", overflowY: "auto" }}>
            
            <div className="modal-header" style={{ borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
              <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#333" }}>USER DETAILS</h4>
              <span className="close-icon" onClick={() => setShowModal(false)} style={{ cursor: "pointer", fontSize: "24px" }}>×</span>
            </div>

            <div className="modal-body" style={{ padding: isMobile ? "15px" : "30px" }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading Details...</div>
              ) : (
                <>
                  <div className="profile-section" style={{ flexDirection: isMobile ? "column" : "row", marginBottom: "30px" }}>
                    <div className="profile-image">
                      <div style={{ width: "100px", height: "100px", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", fontSize: "24px" }}>
                        {selectedEmployee.userEmail?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="profile-info" style={{ gap: "10px" }}>
                      <p className="emp-id" style={{ fontSize: "18px", color: "#666" }}>Emp ID: {selectedEmployee.employeeCode}</p>
                      <div className="action-buttons">
                        {!isEditing ? (
                          <>
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
                            <button className="btn-block" onClick={() => handleBlock(selectedEmployee)}>
                              {selectedEmployee.status === "BLOCKED" ? "Unblock" : "Block"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-edit" onClick={handleSaveEmployee}>Save</button>
                            <button className="btn-block" onClick={() => setIsEditing(false)} style={{ background: "#6c757d" }}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="details-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "20px 15px" }}>
                    {[
                      { label: "Full Name", key: "fullName", readOnly: true },
                      { label: "Email ID", key: "userEmail" },
                      { label: "Phone Number", key: "userMobile" },
                      { label: "User Type", key: "role", readOnly: true },
                      { label: "Company Name", key: "companyName" },
                      { label: "Address", key: "address" },
                      { label: "City", key: "city" },
                      { label: "Permanent Address", key: "permanentAddress" },
                      { label: "District", key: "district" },
                      { label: "State", key: "state" },
                      { label: "PF Number", key: "pfNumber" },
                      { label: "Insurance Number", key: "insuranceNumber" },
                      { label: "Account Number", key: "accountNumber" },
                      { label: "IFSC Code", key: "ifscCode" },
                      { label: "PAN Number", key: "panNumber" },
                      { label: "Vehicle Number", key: "vehicleNumber" },
                    ].map((field) => (
                      <div className="detail-item" key={field.key}>
                        <label>{field.label}</label>
                        {isEditing && !field.readOnly ? (
                          <input 
                            value={editForm[field.key] || ""} 
                            onChange={(e) => handleEditChange(field.key, e.target.value)} 
                          />
                        ) : (
                          <p>{selectedEmployee[field.key] || "N/A"}</p>
                        )}
                      </div>
                    ))}
                    <div className="detail-item" style={{ gridColumn: isSmallMobile ? "auto" : "span 2" }}>
                      <label>Description</label>
                      {isEditing ? (
                        <input value={editForm.description || ""} onChange={(e) => handleEditChange("description", e.target.value)} />
                      ) : (
                        <p>{selectedEmployee.description || "----------"}</p>
                      )}
                    </div>
                  </div>

                  <div className="view-buttons" style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px", display: "flex", gap: "10px" }}>
                    <button className="view-btn">View PAN</button>
                    <button className="view-btn">View Aadhaar</button>
                    <button className="view-btn">View Passbook</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;