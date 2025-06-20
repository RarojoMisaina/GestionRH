package com.hrleave.controller;

import com.hrleave.dto.LeaveBalanceDto;
import com.hrleave.entity.User;
import com.hrleave.service.LeaveBalanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/leave-balance")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Leave Balance", description = "Leave balance management APIs")
public class LeaveBalanceController {

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @GetMapping("/my")
    @Operation(summary = "Get my leave balance", description = "Get current user's leave balance")
    public ResponseEntity<LeaveBalanceDto> getMyLeaveBalance(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LeaveBalanceDto balance = leaveBalanceService.getLeaveBalance(user.getId());
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('HR') or hasRole('MANAGER')")
    @Operation(summary = "Get user leave balance", description = "Get leave balance for specific user")
    public ResponseEntity<LeaveBalanceDto> getUserLeaveBalance(@PathVariable Long userId) {
        LeaveBalanceDto balance = leaveBalanceService.getLeaveBalance(userId);
        return ResponseEntity.ok(balance);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Update leave balance", description = "Update leave balance for user (HR only)")
    public ResponseEntity<LeaveBalanceDto> updateLeaveBalance(@PathVariable Long userId, 
                                                             @RequestBody LeaveBalanceDto balanceDto) {
        LeaveBalanceDto updatedBalance = leaveBalanceService.updateLeaveBalance(userId, balanceDto);
        return ResponseEntity.ok(updatedBalance);
    }
}