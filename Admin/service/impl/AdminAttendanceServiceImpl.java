package com.company.admin.service.impl;

import com.company.admin.service.AdminAttendanceService;
import com.company.attendance.dto.response.AttendanceResponse;
import com.company.attendance.dto.response.MonthlyAttendanceResponse;
import com.company.attendance.mapper.AttendanceMapper;
import com.company.attendance.model.Attendance;
import com.company.attendance.model.AttendanceStatus;
import com.company.attendance.model.embedded.Location;
import com.company.attendance.repository.AttendanceRepository;
import com.company.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin Attendance Service Implementation
 * Implements admin-specific attendance operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminAttendanceServiceImpl implements AdminAttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceMapper attendanceMapper;
    private final AttendanceService attendanceService;

    @Override
    @Transactional(readOnly = true)
    public MonthlyAttendanceResponse getEmployeeMonthlyAttendance(Long employeeId, int year, int month) {
        log.info("Admin fetching monthly attendance for employee: {} - {}/{}", employeeId, year, month);
        
        // Reuse the existing service method
        MonthlyAttendanceResponse response = attendanceService.getMonthlyAttendance(employeeId, year, month);
        
        // TODO: Add employee info from User service
        // For now, return the response as is
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        log.info("Admin fetching attendance for employee: {} from {} to {}", employeeId, startDate, endDate);
        
        return attendanceService.getAttendanceByDateRange(employeeId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getEmployeeAttendanceByDate(Long employeeId, LocalDate date) {
        log.info("Admin fetching attendance for employee: {} on date: {}", employeeId, date);
        
        return attendanceService.getAttendanceByDate(employeeId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendanceByDate(LocalDate date) {
        log.info("Admin fetching all attendance for date: {}", date);
        
        List<Attendance> attendances = attendanceRepository.findAll().stream()
            .filter(a -> a.getDate().equals(date))
            .collect(Collectors.toList());
        
        return attendances.stream()
            .map(attendanceMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSummary(int year, int month) {
        log.info("Admin fetching attendance summary for {}/{}", year, month);
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Attendance> allAttendances = attendanceRepository.findAll().stream()
            .filter(a -> !a.getDate().isBefore(startDate) && !a.getDate().isAfter(endDate))
            .collect(Collectors.toList());
        
        // Calculate statistics
        long totalRecords = allAttendances.size();
        long presentCount = allAttendances.stream()
            .filter(a -> a.getAttendanceStatus() == AttendanceStatus.PRESENT)
            .count();
        long absentCount = allAttendances.stream()
            .filter(a -> a.getAttendanceStatus() == AttendanceStatus.ABSENT)
            .count();
        long leaveCount = allAttendances.stream()
            .filter(a -> a.getAttendanceStatus() == AttendanceStatus.LEAVE)
            .count();
        
        double totalHours = allAttendances.stream()
            .filter(a -> a.getTotalHours() != null)
            .mapToDouble(Attendance::getTotalHours)
            .sum();
        
        double avgHours = totalRecords > 0 ? totalHours / totalRecords : 0;
        
        // Get unique employees
        Set<Long> uniqueEmployees = allAttendances.stream()
            .map(Attendance::getUserId)
            .collect(Collectors.toSet());
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRecords", totalRecords);
        summary.put("totalEmployees", uniqueEmployees.size());
        summary.put("presentCount", presentCount);
        summary.put("absentCount", absentCount);
        summary.put("leaveCount", leaveCount);
        summary.put("totalWorkingHours", totalHours);
        summary.put("averageWorkingHours", avgHours);
        summary.put("month", month);
        summary.put("year", year);
        
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAbsentEmployeesToday() {
        log.info("Admin fetching absent employees for today");
        
        LocalDate today = LocalDate.now();
        
        // TODO: Get all active employees from User service
        // For now, return empty list
        // This would require integration with User/Employee service
        
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getCurrentlyCheckedInEmployees() {
        log.info("Admin fetching currently checked-in employees");
        
        List<Attendance> checkedIn = attendanceRepository.findPendingCheckouts(LocalDate.now());
        
        return checkedIn.stream()
            .map(attendanceMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getEmployeeLocationAnalytics(Long employeeId, int year, int month) {
        log.info("Admin fetching location analytics for employee: {} - {}/{}", employeeId, year, month);
        
        List<Attendance> attendances = attendanceRepository.findByUserIdAndYearAndMonth(employeeId, year, month);
        
        // Calculate location-based analytics
        List<Location> checkInLocations = attendances.stream()
            .map(Attendance::getCheckInLocation)
            .filter(Objects::nonNull)
            .filter(Location::isValid)
            .collect(Collectors.toList());
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRecords", attendances.size());
        analytics.put("recordsWithLocation", checkInLocations.size());
        
        if (!checkInLocations.isEmpty()) {
            // Calculate average location
            double avgLat = checkInLocations.stream()
                .mapToDouble(l -> l.getLatitude().doubleValue())
                .average()
                .orElse(0.0);
            
            double avgLon = checkInLocations.stream()
                .mapToDouble(l -> l.getLongitude().doubleValue())
                .average()
                .orElse(0.0);
            
            analytics.put("averageLocation", Map.of(
                "latitude", avgLat,
                "longitude", avgLon
            ));
            
            // Calculate location variance (how much employee moves)
            if (checkInLocations.size() > 1) {
                Location avgLocation = Location.builder()
                    .latitude(BigDecimal.valueOf(avgLat))
                    .longitude(BigDecimal.valueOf(avgLon))
                    .build();
                
                double maxDistance = checkInLocations.stream()
                    .mapToDouble(l -> l.distanceFrom(avgLocation))
                    .max()
                    .orElse(0.0);
                
                analytics.put("maxDistanceFromAverage", maxDistance);
            }
        }
        
        return analytics;
    }

    @Override
    public AttendanceResponse manualMarkAttendance(Map<String, Object> request) {
        log.info("Admin manually marking attendance");
        
        // Extract data from request
        Long userId = Long.valueOf(request.get("userId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        AttendanceStatus status = AttendanceStatus.valueOf(request.get("status").toString());
        String remarks = request.getOrDefault("remarks", "Manually marked by admin").toString();
        
        // Create or update attendance
        Attendance attendance = attendanceRepository.findByUserIdAndDate(userId, date)
            .orElse(Attendance.builder()
                .userId(userId)
                .date(date)
                .build());
        
        attendance.setAttendanceStatus(status);
        attendance.setRemarks(remarks);
        
        // Set times if provided
        if (request.containsKey("checkInTime")) {
            attendance.setCheckInTime(LocalTime.parse(request.get("checkInTime").toString()));
        }
        if (request.containsKey("checkOutTime")) {
            attendance.setCheckOutTime(LocalTime.parse(request.get("checkOutTime").toString()));
        }
        
        attendance.calculateTotalHours();
        
        Attendance saved = attendanceRepository.save(attendance);
        
        return attendanceMapper.toResponse(saved);
    }

    @Override
    public int runAutoCheckout(LocalDate date) {
        log.info("Admin running auto check-out for date: {}", date);
        
        return attendanceService.autoCheckOut(date);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAttendanceReport(int year, int month, String format) {
        log.info("Admin exporting attendance report for {}/{} in {} format", year, month, format);
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Attendance> attendances = attendanceRepository.findAll().stream()
            .filter(a -> !a.getDate().isBefore(startDate) && !a.getDate().isAfter(endDate))
            .sorted(Comparator.comparing(Attendance::getDate).reversed())
            .collect(Collectors.toList());
        
        // Generate CSV
        if ("csv".equalsIgnoreCase(format)) {
            return generateCSV(attendances);
        }
        
        // TODO: Implement Excel export
        return generateCSV(attendances);
    }

    private byte[] generateCSV(List<Attendance> attendances) {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Date,Employee ID,Status,Check In,Check Out,Total Hours,Check In Location,Check Out Location\n");
        
        // Data rows
        for (Attendance a : attendances) {
            csv.append(a.getDate()).append(",");
            csv.append(a.getUserId()).append(",");
            csv.append(a.getAttendanceStatus()).append(",");
            csv.append(a.getCheckInTime() != null ? a.getCheckInTime() : "").append(",");
            csv.append(a.getCheckOutTime() != null ? a.getCheckOutTime() : "").append(",");
            csv.append(a.getTotalHours() != null ? a.getTotalHours() : "").append(",");
            csv.append(a.getCheckInLocation() != null ? a.getCheckInLocation().getCoordinates() : "").append(",");
            csv.append(a.getCheckOutLocation() != null ? a.getCheckOutLocation().getCoordinates() : "");
            csv.append("\n");
        }
        
        return csv.toString().getBytes();
    }
}
