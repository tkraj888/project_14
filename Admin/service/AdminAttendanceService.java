package com.company.admin.service;

import com.company.attendance.dto.response.AttendanceResponse;
import com.company.attendance.dto.response.MonthlyAttendanceResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Admin Attendance Service Interface
 * Business logic for admin attendance operations
 */
public interface AdminAttendanceService {

    /**
     * Get employee monthly attendance with location history
     */
    MonthlyAttendanceResponse getEmployeeMonthlyAttendance(Long employeeId, int year, int month);

    /**
     * Get employee attendance for date range
     */
    List<AttendanceResponse> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate);

    /**
     * Get employee attendance for specific date
     */
    AttendanceResponse getEmployeeAttendanceByDate(Long employeeId, LocalDate date);

    /**
     * Get all employees attendance for a specific date
     */
    List<AttendanceResponse> getAllAttendanceByDate(LocalDate date);

    /**
     * Get attendance summary for all employees
     */
    Map<String, Object> getAttendanceSummary(int year, int month);

    /**
     * Get employees who haven't checked in today
     */
    List<Map<String, Object>> getAbsentEmployeesToday();

    /**
     * Get employees currently checked in
     */
    List<AttendanceResponse> getCurrentlyCheckedInEmployees();

    /**
     * Get location analytics for an employee
     */
    Map<String, Object> getEmployeeLocationAnalytics(Long employeeId, int year, int month);

    /**
     * Manually mark attendance (admin override)
     */
    AttendanceResponse manualMarkAttendance(Map<String, Object> request);

    /**
     * Run auto check-out for employees
     */
    int runAutoCheckout(LocalDate date);

    /**
     * Export attendance report
     */
    byte[] exportAttendanceReport(int year, int month, String format);
}
