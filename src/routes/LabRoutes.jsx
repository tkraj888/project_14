import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LabLayout from "../layouts/LabLayout";
import LabDashboard from "../pages/dashboard/LabDashboard";
import LabReports from "../pages/lab-reports/LabReports";



const LabRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    //console.log("LabRoutes loaded");
    //console.log("Current path:", location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route element={<LabLayout />}>
        {/* Lab Dashboard */}
        <Route
          path="dashboard"
          element={
            <>
              {console.log("Rendering LabDashboard")}
              <LabDashboard />
            </>
          }
        />

        {/* Lab Report */}
        <Route path="report" element={<LabReports />} />

        {/* Default Route - Redirect to Dashboard */}
        <Route
          path="*"
          element={
            <>
              {console.log(
                "Redirecting to /lab/dashboard from:",
                location.pathname
              )}
              <Navigate to="/lab/dashboard" replace />
            </>
          }
        />
      </Route>
    </Routes>
  );
};

export default LabRoutes;