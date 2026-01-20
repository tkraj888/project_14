import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AttendanceManagement.css";
 
const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("All Status");
  const [attendanceList, setAttendanceList] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
 
  // 🔴 MOCK DATA (REMOVE when API comes)
  useEffect(() => {
    setAttendanceList([
      {
        empId: "EMP001",
        employeeName: "John Smith",
        date: "Dec 29, 2025",
        status: "Present",
        remarks: null,
      },
      {
        empId: "EMP002",
        employeeName: "Sarah Johnson",
        date: "Dec 29, 2025",
        status: "Present",
        remarks: null,
      },
    ]);
  }, []);
 
  /*
  // 🟢 FUTURE API (just uncomment)
  useEffect(() => {
    fetch("/api/attendance")
      .then(res => res.json())
      .then(data => setAttendanceList(data));
  }, []);
  */
 
  const getStatusClass = (status) => {
    if (status === "Present") return "attendance-mgmt-status present";
    if (status === "Absent") return "attendance-mgmt-status absent";
    return "attendance-mgmt-status leave";
  };
 
  const handleView = (empId) => {
    navigate(`/attendance/view/${empId}`);
  };
 
  return (
    <div className="attendance-mgmt-container">
     
      {/* HEADER */}
      <div className="attendance-mgmt-header">
        <div className="attendance-mgmt-title">
          <h2>Attendance Management</h2>
          <p>View and manage employee attendance records</p>
        </div>
 
        <button className="attendance-mgmt-add-btn">
          <span className="attendance-mgmt-add-icon">+</span>
          Add Employee
        </button>
      </div>
 
      {/* FILTERS */}
      <div className="attendance-mgmt-filters">
        <input className="attendance-mgmt-input" placeholder="Search by name or ID..." />
        <select className="attendance-mgmt-select">
          <option>User Type</option>
          <option>Admin</option>
          <option>Employee</option>
        </select>
        <select
          className="attendance-mgmt-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Status</option>
          <option>Present</option>
          <option>Absent</option>
          <option>Leave</option>
        </select>
        <input className="attendance-mgmt-input" type="date" />
        <button className="attendance-mgmt-clear-btn">Clear</button>
      </div>
 
      {/* TABLE */}
      <div className="attendance-mgmt-table-wrapper">
        <table className="attendance-mgmt-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
 
          <tbody>
            {attendanceList.map((item, index) => (
              <tr key={item.empId}>
                <td>{item.empId}</td>
                <td>{item.employeeName}</td>
                <td>{item.date}</td>
                <td>
                  <span className={getStatusClass(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td>{item.remarks || "-"}</td>
 
                {/* ACTIONS */}
                <td className="attendance-mgmt-actions">
                  <button
                    className="attendance-mgmt-dots"
                    onClick={() =>
                      setOpenMenuIndex(openMenuIndex === index ? null : index)
                    }
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
 
                  {openMenuIndex === index && (
                    <div className="attendance-mgmt-action-menu">
                      <button  onClick={() => navigate("/admin/attendance")}>
                        View
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* PAGINATION */}
      <div className="attendance-mgmt-pagination">
        <button>Prev</button>
        <button className="active">1</button>
        <button>2</button>
        <button>3</button>
        <button>Next</button>
      </div>
    </div>
  );
};
 
export default AttendanceManagement;
 
 
 
 
 
 
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./AttendanceManagement.css";
 
// const BASE_URL = "https://jiojibackendv1-production.up.railway.app";
 
// const AttendanceManagement = () => {
//   const navigate = useNavigate();
 
//   const [status, setStatus] = useState("All Status");
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [openMenuIndex, setOpenMenuIndex] = useState(null);
 
//   // pagination state (API-driven)
//   const [page, setPage] = useState(0);
//   const [size] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
 
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
 
//   /* ================= FETCH ATTENDANCE ================= */
//   useEffect(() => {
//     const fetchAttendance = async () => {
//       setLoading(true);
//       setError(null);
 
//       try {
//         const token = localStorage.getItem("token");
 
//         const pageable = {
//           page,
//           size,
//           sort: ["date,desc"],
//         };
 
//         const response = await fetch(
//           `${BASE_URL}/api/v1/attendance?pageable=${encodeURIComponent(
//             JSON.stringify(pageable)
//           )}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
 
//         if (!response.ok) {
//           throw new Error("Failed to fetch attendance data");
//         }
 
//         const result = await response.json();
 
//         // ⬇️ ADJUST HERE if backend keys differ
//         setAttendanceList(result.content || []);
//         setTotalPages(result.totalPages || 1);
 
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
 
//     fetchAttendance();
//   }, [page, size]);
 
//   /* ================= HELPERS ================= */
//   const getStatusClass = (status) => {
//     if (status === "Present") return "attendance-mgmt-status present";
//     if (status === "Absent") return "attendance-mgmt-status absent";
//     return "attendance-mgmt-status leave";
//   };
 
//   const handleView = (empId) => {
//     setOpenMenuIndex(null);
//     navigate(`/attendance/view/${empId}`);
//   };
 
//   /* ================= UI ================= */
//   return (
//     <div className="attendance-mgmt-container">
 
//       {/* HEADER */}
//       <div className="attendance-mgmt-header">
//         <div className="attendance-mgmt-title">
//           <h2>Attendance Management</h2>
//           <p>View and manage employee attendance records</p>
//         </div>
 
//         <button className="attendance-mgmt-add-btn">
//           <span className="attendance-mgmt-add-icon">+</span>
//           Add Employee
//         </button>
//       </div>
 
//       {/* FILTERS (UI ONLY – hook later to API if needed) */}
//       <div className="attendance-mgmt-filters">
//         <input className="attendance-mgmt-input" placeholder="Search by name or ID..." />
 
//         <select className="attendance-mgmt-select">
//           <option>User Type</option>
//           <option>Admin</option>
//           <option>Employee</option>
//         </select>
 
//         <select
//           className="attendance-mgmt-select"
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//         >
//           <option>All Status</option>
//           <option>Present</option>
//           <option>Absent</option>
//           <option>Leave</option>
//         </select>
 
//         <input className="attendance-mgmt-input" type="date" />
//         <button className="attendance-mgmt-clear-btn">Clear</button>
//       </div>
 
//       {/* TABLE */}
//       <div className="attendance-mgmt-table-wrapper">
//         {loading ? (
//           <div style={{ padding: "20px", textAlign: "center" }}>
//             Loading attendance...
//           </div>
//         ) : error ? (
//           <div style={{ padding: "20px", color: "red" }}>
//             {error}
//           </div>
//         ) : (
//           <table className="attendance-mgmt-table">
//             <thead>
//               <tr>
//                 <th>Emp ID</th>
//                 <th>Employee Name</th>
//                 <th>Date</th>
//                 <th>Status</th>
//                 <th>Remarks</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
 
//             <tbody>
//               {attendanceList.length > 0 ? (
//                 attendanceList.map((item, index) => (
//                   <tr key={item.empId || index}>
//                     <td>{item.empId}</td>
//                     <td>{item.employeeName}</td>
//                     <td>{item.date}</td>
//                     <td>
//                       <span className={getStatusClass(item.status)}>
//                         {item.status}
//                       </span>
//                     </td>
//                     <td>{item.remarks || "-"}</td>
 
//                     <td className="attendance-mgmt-actions">
//                       <button
//                         className="attendance-mgmt-dots"
//                         onClick={() =>
//                           setOpenMenuIndex(openMenuIndex === index ? null : index)
//                         }
//                       >
//                         <span></span>
//                         <span></span>
//                         <span></span>
//                       </button>
 
//                       {openMenuIndex === index && (
//                         <div className="attendance-mgmt-action-menu">
//                            <button  onClick={() => navigate("/admin/attendance")}>
                     
//                             View
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
//                     No attendance records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
 
//       {/* PAGINATION */}
//       <div className="attendance-mgmt-pagination">
//         <button disabled={page === 0} onClick={() => setPage(page - 1)}>
//           Prev
//         </button>
 
//         {[...Array(totalPages)].map((_, i) => (
//           <button
//             key={i}
//             className={page === i ? "active" : ""}
//             onClick={() => setPage(i)}
//           >
//             {i + 1}
//           </button>
//         ))}
 
//         <button
//           disabled={page + 1 >= totalPages}
//           onClick={() => setPage(page + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };
// export default AttendanceManagement;
 