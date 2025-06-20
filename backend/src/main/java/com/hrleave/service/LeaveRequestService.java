package com.hrleave.service;

import com.hrleave.dto.LeaveRequestDto;
import com.hrleave.entity.LeaveRequest;
import com.hrleave.entity.User;
import com.hrleave.repository.LeaveRequestRepository;
import com.hrleave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    public List<LeaveRequestDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<LeaveRequestDto> getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id)
                .map(this::convertToDto);
    }

    public List<LeaveRequestDto> getLeaveRequestsByUserId(Long userId) {
        return leaveRequestRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getLeaveRequestsByManagerId(Long managerId) {
        return leaveRequestRepository.findByManagerId(managerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getPendingRequestsByManagerId(Long managerId) {
        return leaveRequestRepository.findByManagerIdAndStatus(managerId, LeaveRequest.Status.PENDING).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public LeaveRequestDto createLeaveRequest(LeaveRequestDto requestDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate leave balance
        if (!leaveBalanceService.hasEnoughBalance(userId, requestDto.getType(), requestDto.getDays())) {
            throw new RuntimeException("Insufficient leave balance");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(user);
        leaveRequest.setType(requestDto.getType());
        leaveRequest.setStartDate(requestDto.getStartDate());
        leaveRequest.setEndDate(requestDto.getEndDate());
        leaveRequest.setDays(requestDto.getDays());
        leaveRequest.setReason(requestDto.getReason());
        leaveRequest.setStatus(LeaveRequest.Status.PENDING);
        leaveRequest.setSubmittedAt(LocalDateTime.now());

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        auditService.logAction(user, "CREATE_LEAVE_REQUEST", "LeaveRequest", savedRequest.getId(),
                "Created leave request for " + requestDto.getDays() + " days");

        // Send notification to manager
        if (user.getManager() != null) {
            notificationService.sendLeaveRequestNotification(savedRequest, user.getManager());
        }

        return convertToDto(savedRequest);
    }

    public LeaveRequestDto updateLeaveRequest(Long id, LeaveRequestDto requestDto, Long userId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Only allow updates if request is pending and user owns the request
        if (!leaveRequest.getStatus().equals(LeaveRequest.Status.PENDING)) {
            throw new RuntimeException("Cannot update non-pending leave request");
        }

        if (!leaveRequest.getUser().getId().equals(userId)) {
            throw new RuntimeException("User can only update their own leave requests");
        }

        leaveRequest.setType(requestDto.getType());
        leaveRequest.setStartDate(requestDto.getStartDate());
        leaveRequest.setEndDate(requestDto.getEndDate());
        leaveRequest.setDays(requestDto.getDays());
        leaveRequest.setReason(requestDto.getReason());

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

        auditService.logAction(user, "UPDATE_LEAVE_REQUEST", "LeaveRequest", updatedRequest.getId(),
                "Updated leave request");

        return convertToDto(updatedRequest);
    }

    public LeaveRequestDto approveLeaveRequest(Long id, String comments, Long reviewerId) {
        return updateLeaveRequestStatus(id, LeaveRequest.Status.APPROVED, comments, reviewerId);
    }

    public LeaveRequestDto rejectLeaveRequest(Long id, String comments, Long reviewerId) {
        return updateLeaveRequestStatus(id, LeaveRequest.Status.REJECTED, comments, reviewerId);
    }

    private LeaveRequestDto updateLeaveRequestStatus(Long id, LeaveRequest.Status status, String comments, Long reviewerId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + reviewerId));

        if (!leaveRequest.getStatus().equals(LeaveRequest.Status.PENDING)) {
            throw new RuntimeException("Leave request is not pending");
        }

        leaveRequest.setStatus(status);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        leaveRequest.setReviewedBy(reviewer);
        leaveRequest.setReviewerComments(comments);

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

        // Update leave balance if approved
        if (status.equals(LeaveRequest.Status.APPROVED)) {
            leaveBalanceService.deductLeaveBalance(leaveRequest.getUser().getId(), 
                    leaveRequest.getType(), leaveRequest.getDays());
        }

        auditService.logAction(reviewer, status.name() + "_LEAVE_REQUEST", "LeaveRequest", updatedRequest.getId(),
                status.name().toLowerCase() + " leave request");

        // Send notification to employee
        notificationService.sendLeaveRequestStatusNotification(updatedRequest);

        return convertToDto(updatedRequest);
    }

    public void cancelLeaveRequest(Long id, Long userId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!leaveRequest.getUser().getId().equals(userId)) {
            throw new RuntimeException("User can only cancel their own leave requests");
        }

        if (leaveRequest.getStatus().equals(LeaveRequest.Status.APPROVED) && 
            leaveRequest.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot cancel approved leave request that has already started");
        }

        LeaveRequest.Status oldStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequest.Status.CANCELLED);

        // If the request was approved, restore the leave balance
        if (oldStatus.equals(LeaveRequest.Status.APPROVED)) {
            leaveBalanceService.restoreLeaveBalance(userId, leaveRequest.getType(), leaveRequest.getDays());
        }

        leaveRequestRepository.save(leaveRequest);

        auditService.logAction(user, "CANCEL_LEAVE_REQUEST", "LeaveRequest", id,
                "Cancelled leave request");
    }

    private LeaveRequestDto convertToDto(LeaveRequest leaveRequest) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(leaveRequest.getId());
        dto.setType(leaveRequest.getType());
        dto.setStartDate(leaveRequest.getStartDate());
        dto.setEndDate(leaveRequest.getEndDate());
        dto.setDays(leaveRequest.getDays());
        dto.setReason(leaveRequest.getReason());
        dto.setStatus(leaveRequest.getStatus());
        dto.setSubmittedAt(leaveRequest.getSubmittedAt());
        dto.setReviewedAt(leaveRequest.getReviewedAt());
        dto.setReviewerComments(leaveRequest.getReviewerComments());

        // User information
        dto.setUserId(leaveRequest.getUser().getId());
        dto.setUserFirstName(leaveRequest.getUser().getFirstName());
        dto.setUserLastName(leaveRequest.getUser().getLastName());
        dto.setUserEmail(leaveRequest.getUser().getEmail());

        // Reviewer information
        if (leaveRequest.getReviewedBy() != null) {
            dto.setReviewedById(leaveRequest.getReviewedBy().getId());
            dto.setReviewerFirstName(leaveRequest.getReviewedBy().getFirstName());
            dto.setReviewerLastName(leaveRequest.getReviewedBy().getLastName());
        }

        return dto;
    }
}