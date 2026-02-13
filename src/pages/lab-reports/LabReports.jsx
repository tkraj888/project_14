// export default LabReports;
import React, { useEffect, useRef, useState } from "react";
import { Search, MoreVertical, Eye, Download, Upload } from "lucide-react";
import "./Lab.css";
import { useToast } from "../../hooks/useToast";

// const BASE_URL = "https://jiojibackendv1-production.up.railway.app";
const BASE_URL = "http://localhost:8080";
const getToken = () => localStorage.getItem("token");

const LabReports = () => {
  const { showToast, ToastComponent } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const menuRef = useRef(null);

  /* ================= RESPONSIVE LOGIC ================= */
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  /* ================= FETCH LIST ================= */
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/employeeFarmerSurveys?page=${page}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to load reports");
      }

      setReports(json.data?.content || []);
      setTotalPages(json.data?.totalPages || 1);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  /* ================= CLOSE ACTION MENU ================= */
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  /* ================= CHECK IF REPORT EXISTS ================= */
  const hasReport = (report) => {
    return !!(
      report.reportId ||
      report.labReportId ||
      report.report_id ||
      report.lab_report_id
    );
  };

  /* ================= ACTION HANDLERS ================= */
  const handleView = async (surveyId) => {
    setOpenMenuId(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/lab_report/download/${surveyId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        showToast("Report not available or access denied", "error");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      showToast("Unable to view report", "error");
    }
  };

  const handleDownload = async (surveyId) => {
    setOpenMenuId(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/lab_report/download/${surveyId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (!res.ok) {
        showToast("Report not available", "error");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lab_Report_${surveyId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Unable to download report", "error");
    }
  };

  const handleUpload = async (surveyId) => {
    setOpenMenuId(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/lab_report/upload/${surveyId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
          }
        );

        const json = await res.json();

        if (!res.ok) {
          if (json.message?.includes("already uploaded")) {
            showToast("Report already uploaded. You can view or download it.", "info");
            return;
          }
          throw new Error(json.message || "Upload failed");
        }

        showToast("Report uploaded successfully!", "success");
        fetchReports(); // Refresh the list
      } catch (err) {
        showToast(err.message, "error");
      }
    };

    input.click();
  };

  /* ================= SEARCH FILTER ================= */
  const filteredReports = reports.filter((item) =>
    `${item.farmerName || ""} ${item.formNumber || ""} ${
      item.farmerMobile || ""
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="labreports-loading">
        <div className="labreports-spinner"></div>
      </div>
    );
  }

  return (
    <div className="labreports-container">
      {/* HEADER */}
      <div className="labreports-header">
        <h2 className="labreports-title">Soil Test Reports</h2>
        <p className="labreports-subtitle">Admins can view and manage lab reports.</p>
      </div>

      {/* FILTER BAR */}
      <div className="labreports-filters">
        <div className="labreports-search-wrapper">
          <input
            type="text"
            className="labreports-search-input"
            placeholder="Search by name, form number or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={isMobile ? 16 : 18} className="labreports-search-icon" />
        </div>
        {searchTerm && (
          <button className="labreports-clear-btn" onClick={handleClearSearch}>
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="labreports-table-container">
        <table className="labreports-table">
          <thead className="labreports-table-head">
            <tr>
              <th>Form Number</th>
              <th>Farmer Name</th>
              <th>Mobile</th>
              <th>Land Area</th>
              <th>Address</th>
              <th>Form Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="labreports-table-body">
            {filteredReports.length > 0 ? (
              filteredReports.map((r) => (
                <tr key={r.surveyId}>
                  <td>{r.formNumber || `FORM-${r.surveyId}`}</td>
                  <td>{r.farmerName || "N/A"}</td>
                  <td>{r.farmerMobile || "N/A"}</td>
                  <td>{r.landArea ?? "N/A"}</td>
                  <td>{r.address || r.village || "N/A"}</td>
                  <td>
                    <span className={`labreports-status ${r.status?.toLowerCase() || 'complete'}`}>
                      {r.status || "Complete"}
                    </span>
                  </td>
                  <td className="labreports-action-cell">
                    <div
                      className="labreports-dots-trigger"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === r.surveyId ? null : r.surveyId
                        )
                      }
                    >
                      <MoreVertical size={isMobile ? 18 : 20} />
                    </div>

                    {openMenuId === r.surveyId && (
                      <div className="labreports-action-menu" ref={menuRef}>
                        <div
                          className="labreports-menu-item"
                          onClick={() => handleUpload(r.surveyId)}
                        >
                          <Upload size={16} className="labreports-menu-icon" /> Upload
                        </div>

                        <div
                          className="labreports-menu-item"
                          onClick={() => handleView(r.surveyId)}
                        >
                          <Eye size={16} className="labreports-menu-icon" /> View
                        </div>

                        <div
                          className="labreports-menu-item"
                          onClick={() => handleDownload(r.surveyId)}
                        >
                          <Download size={16} className="labreports-menu-icon" /> Download
                        </div>

                        {!hasReport(r) && (
                          <div className="labreports-menu-divider">
                            Report not uploaded yet
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                    whiteSpace: "normal",
                  }}
                >
                  {searchTerm
                    ? "No reports found matching your search"
                    : "No reports available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="labreports-pagination-footer">
        <div className="labreports-pagination">
          <button
            className="labreports-page-btn"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {isMobile ? "‹" : "Prev"}
          </button>
          <button className="labreports-page-btn active">
            Page {page + 1} of {totalPages}
          </button>
          <button
            className="labreports-page-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {isMobile ? "›" : "Next"}
          </button>
        </div>
      </div>

      {/* INFO FOOTER */}
      <div className="labreports-info-footer">
        Showing {filteredReports.length} of {reports.length} reports
        {(isMobile || isTablet) && " • Scroll horizontally to view all columns"}
      </div>
      
      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
};

export default LabReports;