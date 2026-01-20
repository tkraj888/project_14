import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsStopwatch } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { RiAccountBoxFill } from "react-icons/ri";
import { VscFileSubmodule } from "react-icons/vsc";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

import "./styles/EmployeeDashboard.css";
import { useEffect } from "react";

const API_BASE_URL = "https://jiojibackendv1-production.up.railway.app";

const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    alert("Your session has expired. Please login again.");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
    throw new Error("Session expired");
  }

  return response;
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [chartData, setChartData] = useState([]);
  const [recentFarmers, setRecentFarmers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [surveyStatusCount, setSurveyStatusCount] = useState(null);

  const total = chartData?.reduce((sum, item) => sum + item.value, 0) || 0;

  const userEmail = localStorage.getItem("userEmail");

  const userName = userEmail
    ? userEmail.split("@")[0].replace(".", " ").toUpperCase()
    : "EMPLOYEE";

  const handleFillSurvey = () => navigate("/employee/fill-farmer-survey");
  const handleUpdateData = () => navigate("/employee/update-farmer");
  const handleViewHistory = () => navigate("/employee/farmer-history");

  const renderLabel = ({ value }) => {
    const percent = ((value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchRecentFarmers();
    fetchPieChartData();
    fetchSurveyStatusCount();
    fetchTodayAttendance();
  }, [navigate]);

  const fetchTodayAttendance = async () => {
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/attendance/me`,
        { method: "GET" }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data?.attendanceStatus) {
        setAttendanceStatus(data.attendanceStatus); // 👈 KEY LINE
      }
    } catch (err) {
      console.error("Attendance fetch failed", err);
    }
  };

  const markAttendance = async (status) => {
    try {
      const userId = Number(localStorage.getItem("userId"));
      if (!userId) return;

      const payload = {
        userId,
        date: new Date().toISOString().split("T")[0],
        attendanceStatus: status,
      };

      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/attendance/mark`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Attendance API failed");

      // console.log("✅ Attendance marked");
    } catch (err) {
      console.error("❌ Attendance error:", err);
    }
  };

  const fetchSurveyStatusCount = async () => {
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/employeeFarmerSurveys/status-count/me`,
        { method: "GET" }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch survey status count");
      }

      const data = await res.json();

      // ✅ CONSOLE OUTPUT YOU WANT
      // console.log("📊 Survey Status Count API Response:", data);

      setSurveyStatusCount(data);
    } catch (error) {
      console.error("❌ Survey status count error:", error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const activeRes = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/employeeFarmerSurveys/me/status/ACTIVE`
      );
      const activeJson = await activeRes.json();

      const inactiveRes = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/employeeFarmerSurveys/me/status/INACTIVE`
      );
      const inactiveJson = await inactiveRes.json();

      // console.log("ACTIVE response:", activeJson);
      // console.log("ACTIVE total:", activeJson?.totalElements);

      // console.log("INACTIVE response:", inactiveJson);
      // console.log("INACTIVE total:", inactiveJson?.totalElements);
      // ✅ CORRECT
      const activeCount = activeJson?.totalElements || 0;
      const inactiveCount = inactiveJson?.totalElements || 0;

      setChartData([
        { name: "Active", value: activeCount, color: "#6a5acd" },
        { name: "Inactive", value: inactiveCount, color: "#ff9800" },
      ]);
    } catch (err) {
      console.error("Pie chart fetch failed", err);
      setChartData([]);
    }
  };

  const fetchRecentFarmers = async () => {
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/employeeFarmerSurveys/my`,
        { method: "GET" }
      );

      // 👇 HANDLE 401 SAFELY IN DASHBOARD
      if (res.status === 401) {
        console.warn("Unauthorized on dashboard – showing empty data");
        setRecentFarmers([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`API failed with status ${res.status}`);
      }

      const json = await res.json();
      const data = json?.data?.content ?? [];

      const latestThree = [...data]
        .sort((a, b) => b.surveyId - a.surveyId)
        .slice(0, 3);

      setRecentFarmers(latestThree);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setRecentFarmers([]);
    }
  };

  return (
    <div className="employee-dashboard-content">
      {/* <div className="top-bar"> */}
      <div className="top-bar dashboard-top-bar">
        <div className="date-box">
          <select
            className="status-dropdown"
            value={attendanceStatus}
            onChange={(e) => {
              const value = e.target.value;
              setAttendanceStatus(value);
              markAttendance(value);
            }}
          >
            <option value="PRESENT">Present</option>
            <option value="LEAVE">Leave</option>
            <option value="ABSENT">Absent</option>
          </select>

          <span className="dot"></span>

          <span className="time-pill">
            <BsStopwatch />
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <div
            className="date-pill"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <SlCalender />
            {selectedDate.toLocaleDateString()}
          </div>

          {isCalendarOpen && (
            <div className="datepicker-wrapper">
              <DatePicker
                inline
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="profile">
          <RiAccountBoxFill size={50} />
          <div>
            <strong>{userName}</strong>
            <br />
            <small>ID: {localStorage.getItem("userId")}</small>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card total_data">
          <div className="card-left">
            <p>Total Data</p>
            <VscFileSubmodule size={40} />
          </div>
          <h1>{total}</h1>
        </div>

        <div
          className="stat-card surveys clickable"
          onClick={handleViewHistory}
        >
          <div className="card-left">
            <p>Surveys Completed</p>
            <span style={{ fontSize: "38px" }}>📋</span>
          </div>
          <h1>{surveyStatusCount?.completedCount ?? 0}</h1>
        </div>

        <div className="stat-card pending clickable" onClick={handleUpdateData}>
          <div className="card-left">
            <p>Pending Sync</p>
            <span style={{ fontSize: "38px" }}>🔄</span>
          </div>
          <h1>{surveyStatusCount?.pendingCount ?? 0}</h1>
        </div>

        <div className="quick-box">
          <h4>Quick Actions</h4>
          <button onClick={handleFillSurvey}>➕ Fill Farmer Survey</button>
          <button onClick={handleUpdateData}>✏️ Update Farmer Data</button>
          <button onClick={handleViewHistory}>📜 Farmer History</button>
        </div>
      </div>

      <div className="table-box">
        <h3>Recent Farmers</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>FARMER</th>
                <th>VILLAGE</th>
                <th>ACTION</th>
                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              {recentFarmers.map((item, index) => (
                <tr key={item.surveyId || index}>
                  <td data-label="Farmer">{item.farmerName || "N/A"}</td>
                  {/* <td data-label="Village">{item.village || "N/A"}</td> */}
                  <td data-label="Village">
                    <span className="village-text">{item.village || "N/A"}</span>
                  </td>

                  <td data-label="Action">
                    {item.formStatus === "ACTIVE"
                      ? "SURVEY FILLED"
                      : "PENDING DATA"}
                  </td>
                  <td data-label="Date">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {/* 👇 ADD THIS BELOW map */}
              {recentFarmers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", color: "#888" }}
                  >
                    No recent farmers available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="45%"       // 🔥 IMPORTANT (moves pie up)
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              label={renderLabel}
              labelLine={true}
            >
              {chartData.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
