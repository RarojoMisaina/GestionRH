package com.hrleave.repository;

import com.hrleave.entity.LeaveRequest;
import com.hrleave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUserId(Long userId);
    
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);
    
    List<LeaveRequest> findByUserIdAndStatus(Long userId, LeaveRequest.Status status);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.manager.id = :managerId")
    List<LeaveRequest> findByManagerId(@Param("managerId") Long managerId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.manager.id = :managerId AND lr.status = :status")
    List<LeaveRequest> findByManagerIdAndStatus(@Param("managerId") Long managerId, @Param("status") LeaveRequest.Status status);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.startDate >= :startDate AND lr.endDate <= :endDate")
    List<LeaveRequest> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.id = :userId AND lr.startDate >= :startDate AND lr.endDate <= :endDate")
    List<LeaveRequest> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = :status")
    Long countByStatus(@Param("status") LeaveRequest.Status status);
}