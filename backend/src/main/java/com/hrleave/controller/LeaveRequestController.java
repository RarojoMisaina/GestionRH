package com.hrleave.controller;

import com.hrleave.dto.LeaveRequestDto;
import com.hrleave.entity.User;
import com.hrleave.service.LeaveRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/leave-requests")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Leave Requests", description = "Leave request management APIs")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Get all leave requests", description = "Retrieve all leave requests (HR only)")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/my")
    @Operation(summary = "Get my leave requests", description = "Get current user's leave requests")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaveRequests(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByUserId(user.getId()));
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get team leave requests", description = "Get team leave requests for manager")
    public ResponseEntity<List<LeaveRequestDto>> getTeamLeaveRequests(Authentication authentication) {
        User manager = (User) authentication.getPrincipal();
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByManagerId(manager.getId()));
    }

    @GetMapping("/team/pending")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get pending team requests", description = "Get pending team leave requests for manager")
    public ResponseEntity<List<LeaveRequestDto>> getPendingTeamRequests(Authentication authentication) {
        User manager = (User) authentication.getPrincipal();
        return ResponseEntity.ok(leaveRequestService.getPendingRequestsByManagerId(manager.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get leave request by ID", description = "Retrieve leave request by ID")
    public ResponseEntity<LeaveRequestDto> getLeaveRequestById(@PathVariable Long id) {
        return leaveRequestService.getLeaveRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create leave request", description = "Create a new leave request")
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(@Valid @RequestBody LeaveRequestDto requestDto, 
                                                             Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            LeaveRequestDto createdRequest = leaveRequestService.createLeaveRequest(requestDto, user.getId());
            return ResponseEntity.ok(createdRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update leave request", description = "Update leave request (only pending requests)")
    public ResponseEntity<LeaveRequestDto> updateLeaveRequest(@PathVariable Long id, 
                                                             @Valid @RequestBody LeaveRequestDto requestDto,
                                                             Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            LeaveRequestDto updatedRequest = leaveRequestService.updateLeaveRequest(id, requestDto, user.getId());
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('HR')")
    @Operation(summary = "Approve leave request", description = "Approve a leave request")
    public ResponseEntity<LeaveRequestDto> approveLeaveRequest(@PathVariable Long id, 
                                                              @RequestBody Map<String, String> request,
                                                              Authentication authentication) {
        try {
            User reviewer = (User) authentication.getPrincipal();
            String comments = request.get("comments");
            LeaveRequestDto approvedRequest = leaveRequestService.approveLeaveRequest(id, comments, reviewer.getId());
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER') or hasRole('HR')")
    @Operation(summary = "Reject leave request", description = "Reject a leave request")
    public ResponseEntity<LeaveRequestDto> rejectLeaveRequest(@PathVariable Long id, 
                                                             @RequestBody Map<String, String> request,
                                                             Authentication authentication) {
        try {
            User reviewer = (User) authentication.getPrincipal();
            String comments = request.get("comments");
            LeaveRequestDto rejectedRequest = leaveRequestService.rejectLeaveRequest(id, comments, reviewer.getId());
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel leave request", description = "Cancel own leave request")
    public ResponseEntity<?> cancelLeaveRequest(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            leaveRequestService.cancelLeaveRequest(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}