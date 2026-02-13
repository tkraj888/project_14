package com.company.admin.controller;

import com.company.admin.service.AdminAttendanceService;
import com.company.attendance.dto.response.AttendanceResponse;
import com.company.attendance.dto.response.MonthlyAttendanceResponse;
import com.company.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Admin Attendance Controller
 * REST API endpoints for admin to manage and view employee attendance
 */
@RestController
@RequestMapping("/api/v1/admin/attendance")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Attendance", description = "Admin APIs for attendance management")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAttendanceController {

    private final AdminAttendanceService adminAttendanceService;

    /**
     * Get employee location history
     * GET /api/v1/admin/attendance/employee/{employeeId}?month=2&year=2026
     */
    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get employee attendance history", 
               description = "Get attendance records with location for a specific employee")
    public ResponseEntity<ApiResponse<MonthlyAttendanceResponse>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        
        log.info("Admin fetching attendance for employee: {} - {}/{}", employeeId, year, month);
        
        MonthlyAttendanceResponse response = adminAttendanceService.getEmployeeMonthlyAttendance(
            employeeId, year, month
        );
        
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("No attendance records found for the specified employee and month"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Employee attendance retrieved successfully", response));
    }

    /**
     * Get employee attendance for date range
     * GET /api/v1/admin/attendance/employee/{employeeId}/range?startDate=2026-02-01&endDate=2026-02-28
     */
    @GetMapping("/employee/{employeeId}/range")
    @Operation(summary = "Get employee attendance by date range", 
               description = "Get attendance records for an employee within a date range")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getEmployeeAttendanceByRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Admin fetching attendance for employee: {} from {} to {}", employeeId, startDate, endDate);
        
        List<AttendanceResponse> response = adminAttendanceService.getEmployeeAttendanceByDateRange(
            employeeId, startDate, endDate
        );
        
        return ResponseEntity.ok(ApiResponse.success("Employee attendance retrieved successfully", response));
    }

    /**
     * Get attendance for specific employee on specific date
     * GET /api/v1/admin/attendance/employee/{employeeId}/date/{date}
     */
    @GetMapping("/employee/{employeeId}/date/{date}")
    @Operation(summary = "Get employee attendance by date", 
               description = "Get attendance record for an employee on a specific date")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getEmployeeAttendanceByDate(
            @PathVariable Long employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Admin fetching attendance for employee: {} on date: {}", employeeId, date);
        
        AttendanceResponse response = adminAttendanceService.getEmployeeAttendanceByDate(employeeId, date);
        
        if (response == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("No attendance record found for the specified date"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Employee attendance retrieved successfully", response));
    }

    /**
     * Get all employees attendance for a specific date
     * GET /api/v1/admin/attendance/date/{date}
     */
    @GetMapping("/date/{date}")
    @Operation(summary = "Get all attendance by date", 
               description = "Get attendance records for all employees on a specific date")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAllAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Admin fetching all attendance for date: {}", date);
        
        List<AttendanceResponse> response = adminAttendanceService.getAllAttendanceByDate(date);
        
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", response));
    }

    /**
     * Get attendance summary for all employees
     * GET /api/v1/admin/attendance/summary?month=2&year=2026
     */
    @GetMapping("/summary")
    @Operation(summary = "Get attendance summary", 
               description = "Get attendance summary for all employees for a specific month")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceSummary(
            @RequestParam int month,
            @RequestParam int year) {
        
        log.info("Admin fetching attendance summary for {}/{}", year, month);
        
        Map<String, Object> summary = adminAttendanceService.getAttendanceSummary(year, month);
        
        return ResponseEntity.ok(ApiResponse.success("Attendance summary retrieved successfully", summary));
    }

    /**
     * Get employees who haven't checked in today
     * GET /api/v1/admin/attendance/absent-today
     */
    @GetMapping("/absent-today")
    @Operation(summary = "Get absent employees", 
               description = "Get list of employees who haven't checked in today")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAbsentEmployeesToday() {
        
        log.info("Admin fetching absent employees for today");
        
        List<Map<String, Object>> absentees = adminAttendanceService.getAbsentEmployeesToday();
        
        return ResponseEntity.ok(ApiResponse.success("Absent employees retrieved successfully", absentees));
    }

    /**
     * Get employees currently checked in (not checked out)
     * GET /api/v1/admin/attendance/checked-in-now
     */
    @GetMapping("/checked-in-now")
    @Operation(summary = "Get currently checked-in employees", 
               description = "Get list of employees who are currently checked in but not checked out")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getCurrentlyCheckedInEmployees() {
        
        log.info("Admin fetching currently checked-in employees");
        
        List<AttendanceResponse> checkedIn = adminAttendanceService.getCurrentlyCheckedInEmployees();
        
        return ResponseEntity.ok(ApiResponse.success("Currently checked-in employees retrieved successfully", checkedIn));
    }

    /**
     * Get location analytics for an employee
     * GET /api/v1/admin/attendance/employee/{employeeId}/location-analytics?month=2&year=2026
     */
    @GetMapping("/employee/{employeeId}/location-analytics")
    @Operation(summary = "Get employee location analytics", 
               description = "Get location-based analytics for an employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeLocationAnalytics(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        
        log.info("Admin fetching location analytics for employee: {} - {}/{}", employeeId, year, month);
        
        Map<String, Object> analytics = adminAttendanceService.getEmployeeLocationAnalytics(
            employeeId, year, month
        );
        
        return ResponseEntity.ok(ApiResponse.success("Location analytics retrieved successfully", analytics));
    }

    /**
     * Manually mark attendance for an employee (admin override)
     * POST /api/v1/admin/attendance/manual-mark
     */
    @PostMapping("/manual-mark")
    @Operation(summary = "Manual attendance marking", 
               description = "Admin can manually mark attendance for an employee")
    public ResponseEntity<ApiResponse<AttendanceResponse>> manualMarkAttendance(
            @RequestBody Map<String, Object> request) {
        
        log.info("Admin manually marking attendance");
        
        AttendanceResponse response = adminAttendanceService.manualMarkAttendance(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Attendance marked successfully", response));
    }

    /**
     * Run auto check-out for all employees
     * POST /api/v1/admin/attendance/auto-checkout
     */
    @PostMapping("/auto-checkout")
    @Operation(summary = "Auto check-out", 
               description = "Automatically check out employees who forgot to check out")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> runAutoCheckout(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now().minusDays(1);
        log.info("Admin running auto check-out for date: {}", targetDate);
        
        int count = adminAttendanceService.runAutoCheckout(targetDate);
        
        Map<String, Integer> result = Map.of(
            "recordsUpdated", count,
            "date", targetDate.getDayOfMonth()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Auto check-out completed", result));
    }

    /**
     * Export attendance report
     * GET /api/v1/admin/attendance/export?month=2&year=2026&format=csv
     */
    @GetMapping("/export")
    @Operation(summary = "Export attendance report", 
               description = "Export attendance report in CSV or Excel format")
    public ResponseEntity<byte[]> exportAttendanceReport(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(defaultValue = "csv") String format) {
        
        log.info("Admin exporting attendance report for {}/{} in {} format", year, month, format);
        
        byte[] report = adminAttendanceService.exportAttendanceReport(year, month, format);
        
        String filename = String.format("attendance_%d_%02d.%s", year, month, format);
        
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=" + filename)
            .header("Content-Type", format.equals("csv") ? "text/csv" : "application/vnd.ms-excel")
            .body(report);
    }
}
