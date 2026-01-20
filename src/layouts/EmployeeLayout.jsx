
// import React, { useState } from "react";
// import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
// import {
//   LayoutDashboard,
//   UserPlus,
//   History,
//   FileEdit,
//   Clock,
//   Settings,
//   User,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";
// import { FaWpforms, FaSyncAlt } from "react-icons/fa";
// import logo from "../assets/Jioji_logo.png";
// import "../styles/EmployeeLayout.css";

// const EmployeeLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

  

//   // Get user email from localStorage (stored during login)
//   const userEmail = localStorage.getItem("userEmail") || "Employee";
//   const userName = userEmail.split("@")[0];

//   const handleLogout = () => {
//     // Clear session data
//     localStorage.removeItem("token");
//     localStorage.removeItem("role"); // correct key
//     localStorage.removeItem("userId"); // important
//     localStorage.removeItem("userEmail");

//     // Navigate to login
//     navigate("/");
//   };

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

//   const menuItems = [
//     { path: "/employee/dashboard", icon: LayoutDashboard, label: "Dashboard" },
//     {
//       path: "/employee/farmer-registration",
//       icon: FaWpforms,
//       label: "Fill Farmer Survey Forms",
//     },
//     {
//       path: "/employee/previous-history",
//       icon: History,
//       label: "History of MyFarmers",
//     },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <div className="emp-layout-wrapper">
//       {/* Sidebar */}
//       <aside
//         className={`emp-sidebar ${
//           sidebarOpen ? "emp-sidebar-open" : "emp-sidebar-closed"
//         }`}
//       >
//         <div className="emp-sidebar-header">
//           <div className="emp-logo-container">
//             <img src={logo} alt="Logo" className="emp-logo" />
//             {sidebarOpen && (
//               <span className="emp-logo-text">Employee Panel</span>
//             )}
//           </div>
//           <button className="emp-toggle-btn" onClick={toggleSidebar}>
//             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         <nav className="emp-sidebar-nav">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`emp-nav-item ${
//                   isActive(item.path) ? "emp-nav-active" : ""
//                 }`}
//               >
//                 <Icon size={20} />
//                 {sidebarOpen && <span>{item.label}</span>}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="emp-sidebar-footer">
//           <button className="emp-logout-btn" onClick={handleLogout}>
//             <LogOut size={20} />
//             {sidebarOpen && <span>Logout</span>}
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div
//         className={`emp-main-content ${
//           sidebarOpen ? "emp-content-open" : "emp-content-closed"
//         }`}
//       >
//         <header className="emp-top-header">
//           <div className="emp-header-left">
//             <button className="emp-mobile-menu-btn" onClick={toggleSidebar}>
//               <Menu size={24} />
//             </button>
//             <h1>Employee Portal</h1>
//           </div>

//           <div className="emp-header-right">
//             <div className="emp-user-menu">
//               <button className="emp-user-btn" onClick={toggleDropdown}>
//                 <User size={20} />
//                 <span>{userName}</span>
//               </button>

//               {dropdownOpen && (
//                 <div className="emp-dropdown-menu">
//                   <div
//                     className="emp-dropdown-item"
//                     style={{
//                       padding: "0.75rem 1rem",
//                       borderBottom: "1px solid #e2e8f0",
//                       color: "#718096",
//                       fontSize: "0.875rem",
//                     }}
//                   >
//                     {userEmail}
//                   </div>
//                   <button
//                     className="emp-dropdown-item emp-dropdown-logout"
//                     onClick={handleLogout}
//                   >
//                     <LogOut size={16} />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </header>

//         <main className="emp-page-content">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default EmployeeLayout;

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { FaWpforms } from "react-icons/fa";
import logo from "../assets/Jioji_logo.png";
import "../styles/EmployeeLayout.css";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const userBtnRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Get user email from localStorage
  const userEmail = localStorage.getItem("userEmail") || "Employee";
  const userName = userEmail.split("@")[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // ✅ CLICK OUTSIDE & ESC KEY CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const menuItems = [
    { path: "/employee/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    {
      path: "/employee/farmer-registration",
      icon: FaWpforms,
      label: "Fill Farmer Survey Forms",
    },
    {
      path: "/employee/previous-history",
      icon: History,
      label: "History of MyFarmers",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="emp-layout-wrapper">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`emp-sidebar ${
          sidebarOpen ? "emp-sidebar-open" : "emp-sidebar-closed"
        }`}
      >
        <div className="emp-sidebar-header">
          <div className="emp-logo-container">
            <img src={logo} alt="Logo" className="emp-logo" />
            {sidebarOpen && <span className="emp-logo-text">Employee Panel</span>}
          </div>
          <button className="emp-toggle-btn" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="emp-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`emp-nav-item ${
                  isActive(item.path) ? "emp-nav-active" : ""
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="emp-sidebar-footer">
          <button className="emp-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`emp-main-content ${
          sidebarOpen ? "emp-content-open" : "emp-content-closed"
        }`}
      >
        <header className="emp-top-header">
          <div className="emp-header-left">
            <button className="emp-mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1>Employee Portal</h1>
          </div>

          <div className="emp-header-right">
            <div className="emp-user-menu">
              <button
                ref={userBtnRef}
                className="emp-user-btn"
                onClick={toggleDropdown}
              >
                <User size={20} />
                <span>{userName}</span>
              </button>

              {dropdownOpen && (
                <div ref={dropdownRef} className="emp-dropdown-menu">
                  <div
                    className="emp-dropdown-item"
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #e2e8f0",
                      color: "#718096",
                      fontSize: "0.875rem",
                    }}
                  >
                    {userEmail}
                  </div>

                  <button
                    className="emp-dropdown-item emp-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="emp-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
