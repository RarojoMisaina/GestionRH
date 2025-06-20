package com.hrleave.dto;

import com.hrleave.entity.LeaveRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveRequestDto {
    private Long id;
    
    @NotNull
    private LeaveRequest.LeaveType type;
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
    
    @Positive
    private Integer days;
    
    @NotBlank
    private String reason;
    
    private LeaveRequest.Status status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewerComments;
    
    // User information
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    
    // Reviewer information
    private Long reviewedById;
    private String reviewerFirstName;
    private String reviewerLastName;

    // Constructors
    public LeaveRequestDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LeaveRequest.LeaveType getType() { return type; }
    public void setType(LeaveRequest.LeaveType type) { this.type = type; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LeaveRequest.Status getStatus() { return status; }
    public void setStatus(LeaveRequest.Status status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFirstName() { return userFirstName; }
    public void setUserFirstName(String userFirstName) { this.userFirstName = userFirstName; }

    public String getUserLastName() { return userLastName; }
    public void setUserLastName(String userLastName) { this.userLastName = userLastName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Long getReviewedById() { return reviewedById; }
    public void setReviewedById(Long reviewedById) { this.reviewedById = reviewedById; }

    public String getReviewerFirstName() { return reviewerFirstName; }
    public void setReviewerFirstName(String reviewerFirstName) { this.reviewerFirstName = reviewerFirstName; }

    public String getReviewerLastName() { return reviewerLastName; }
    public void setReviewerLastName(String reviewerLastName) { this.reviewerLastName = reviewerLastName; }
}