
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { adminApi } from '../../api/adminApi';
import './styles/AdminDashboards.css';

const Dashboard = () => {
  // --- Keeping original API integration ---
  const { data: stats, loading: statsLoading } = useFetch(() => adminApi.getDashboardStats());
  const { data: farmersData, loading: farmersLoading } = useFetch(() => adminApi.getAllFarmers(0, 5));

  // --- Responsive State Logic ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  if (statsLoading || farmersLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const dashboardStats = stats || {
    farmers: "0",
    employees: "128",
    products: "847",
    orders: "1,294"
  };

  const graphData = [
    { label: 'Sale1', actual: 60, plan: 90 },
    { label: 'Sale2', actual: 80, plan: 85 },
    { label: 'Sale3', actual: 40, plan: 95 },
    { label: 'Sale4', actual: 70, plan: 88 },
    { label: 'Sale5', actual: 75, plan: 92 },
    { label: 'Sale6', actual: 65, plan: 80 },
    { label: 'Sale7', actual: 30, plan: 85 },
    { label: 'Sale8', actual: 85, plan: 95 },
  ];

  return (
    <div className="dashboard-wrapper" style={{ padding: isMobile ? '10px' : '20px' }}>
      
      {/* 1. GREEN STAT CARDS - Now Responsive */}
      <div 
        className="stats-grid" 
        style={{ 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '15px' : '20px' 
        }}
      >
        <div className="stat-card-green">
          <div className="stat-main">
            <p>Total Users</p>
            <h3>{dashboardStats.farmers}</h3>
            <span className="stat-change">+12% from last month</span>
          </div>
          <div className="stat-icon-bg">👤</div>
        </div>
        <div className="stat-card-green">
          <div className="stat-main">
            <p>Employees</p>
            <h3>{dashboardStats.employees}</h3>
            <span className="stat-change">+5% from last month</span>
          </div>
          <div className="stat-icon-bg">👩‍💻</div>
        </div>
        <div className="stat-card-green">
          <div className="stat-main">
            <p>Products</p>
            <h3>{dashboardStats.products}</h3>
            <span className="stat-change">+23% from last month</span>
          </div>
          <div className="stat-icon-bg">📦</div>
        </div>
        <div className="stat-card-green">
          <div className="stat-main">
            <p>Total Orders</p>
            <h3>{dashboardStats.orders}</h3>
            <span className="stat-change">+8% from last month</span>
          </div>
          <div className="stat-icon-bg">🛍️</div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="content-box" style={{ marginTop: '20px' }}>
        <div className="box-header">
          <h2>Quick Actions</h2>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          padding: '20px'
        }}>
          <Link to="/admin/employees/add" className="quick-action-card">
            <span className="action-icon">➕</span>
            <span className="action-text">Add Employee</span>
          </Link>
          <Link to="/admin/attendance" className="quick-action-card">
            <span className="action-icon">📋</span>
            <span className="action-text">View Attendance</span>
          </Link>
          <Link to="/admin/leave-management" className="quick-action-card">
            <span className="action-icon">🏖️</span>
            <span className="action-text">Leave Requests</span>
          </Link>
          <Link to="/admin/employees" className="quick-action-card">
            <span className="action-icon">👥</span>
            <span className="action-text">Manage Employees</span>
          </Link>
        </div>
      </div>

      {/* 2. ORDERS OVERVIEW - Scrollable Table */}
      <div className="content-box">
        <div className="box-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px' }}>
          <h2>Orders Overview</h2>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="dashboard-table" style={{ minWidth: isMobile ? '650px' : '100%' }}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>STATUS</th>
                <th>ASSIGNED EMPLOYEE</th>
                <th>LAST UPDATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>UIOO281</td>
                <td>RAMESH PATIL</td>
                <td className="status-active">ACTIVE</td>
                <td>ADITYA PUROHIT</td>
                <td>DONE</td>
              </tr>
              <tr>
                <td>UIOO282</td>
                <td>POOJA SHARMA</td>
                <td className="status-pending">PENDING</td>
                <td>VIRAJ GUPTA</td>
                <td>PENDING</td>
              </tr>
              <tr>
                <td>UIOO283</td>
                <td>SUSHNAT MODI</td>
                <td className="status-done">DONE</td>
                <td>AMIT KAMBLE</td>
                <td>DONE</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="see-more-link">
          <Link to="/admin/orders">See More&gt;&gt;</Link>
        </div>
      </div>

      {/* 3. GRAPH AND WORK STATS SECTION - Now Stacks */}
      <div 
        className="middle-grid" 
        style={{ gridTemplateColumns: isTablet ? '1fr' : '1.5fr 1fr' }}
      >
        <div className="content-box">
          <div className="box-header" style={{ flexDirection: isMobile ? 'column' : 'row', gap: '10px' }}>
            <h2>Order Track</h2>
            <div className="chart-legend" style={{ flexWrap: 'wrap' }}>
              <span className="legend-item"><i className="legend-dot plan"></i> 60% Actual</span>
              <span className="legend-item"><i className="legend-dot actual"></i> 40% Plan</span>
            </div>
          </div>
          
          <div className="graph-container" style={{ overflowX: isMobile ? 'auto' : 'visible' }}>
            <div className="y-axis">
              <span>80k</span><span>6k</span><span>2k</span><span>0</span>
            </div>
            <div className="bars-wrapper" style={{ minWidth: isMobile ? '450px' : 'auto' }}>
              {graphData.map((data, index) => (
                <div key={index} className="bar-group">
                  <div className="bar-stacked">
                    <div className="bar-plan" style={{ height: `${data.plan}%` }}></div>
                    <div className="bar-actual" style={{ height: `${data.actual}%` }}></div>
                  </div>
                  <span className="bar-label">{data.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-footer-months" style={{ fontSize: isMobile ? '10px' : '12px' }}>
            <span>April</span>
            <span>Previous Month</span>
            <span>Current Month</span>
          </div>
        </div>

        <div className="content-box">
          <div className="box-header">
            <h2>Employee Work (day)</h2>
          </div>
          <div className="work-stats-panel">
            <div className="work-row" style={{ flexDirection: isMobile ? 'row' : 'row' }}>
              <div className="work-cell">Users: <span className="val">0</span></div>
              <div className="work-cell">TodayWork : <span className="val">35</span></div>
            </div>
            <div className="work-row">
              <div className="work-cell">Performance : <span className="val-green">89%</span></div>
              <div className="work-cell">Overall : <span className="val-green">72%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM EMPLOYEE TABLE - Scrollable */}
      <div className="content-box">
        <div className="box-header">
          <h2>Visit Employee & Work Orders</h2>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="dashboard-table" style={{ minWidth: isMobile ? '700px' : '100%' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Visit</th>
                <th>Tests</th>
                <th>WorkStatus</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>VARUN RAUT</td>
                <td>UIOO281</td>
                <td className="status-done-txt">Done</td>
                <td className="status-done-txt">Done</td>
                <td>Done</td>
                <td>In Progress</td>
              </tr>
              <tr>
                <td>SHITAL DESAI</td>
                <td>UIOO282</td>
                <td className="status-pending-txt">Pending</td>
                <td className="status-pending-txt">Pending</td>
                <td>Pending</td>
                <td>------</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;