package com.hrleave.repository;

import com.hrleave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByUserId(Long userId);
    
    Optional<LeaveBalance> findByUserIdAndYear(Long userId, Integer year);
    
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.user.id = :userId AND lb.year = :year")
    Optional<LeaveBalance> findCurrentYearBalance(@Param("userId") Long userId, @Param("year") Integer year);
}