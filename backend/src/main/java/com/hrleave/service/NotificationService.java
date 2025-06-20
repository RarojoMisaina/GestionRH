package com.hrleave.service;

import com.hrleave.entity.LeaveRequest;
import com.hrleave.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendLeaveRequestNotification(LeaveRequest leaveRequest, User manager) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(manager.getEmail());
            message.setSubject("New Leave Request - " + leaveRequest.getUser().getFirstName() + " " + leaveRequest.getUser().getLastName());
            
            String text = String.format(
                "Dear %s,\n\n" +
                "A new leave request has been submitted by %s %s:\n\n" +
                "Type: %s\n" +
                "Start Date: %s\n" +
                "End Date: %s\n" +
                "Days: %d\n" +
                "Reason: %s\n\n" +
                "Please review and approve/reject this request.\n\n" +
                "Best regards,\n" +
                "HR Leave Management System",
                manager.getFirstName(),
                leaveRequest.getUser().getFirstName(),
                leaveRequest.getUser().getLastName(),
                leaveRequest.getType().name(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getDays(),
                leaveRequest.getReason()
            );
            
            message.setText(text);
            mailSender.send(message);
            
            logger.info("Leave request notification sent to manager: {}", manager.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send leave request notification to manager: {}", manager.getEmail(), e);
        }
    }

    @Async
    public void sendLeaveRequestStatusNotification(LeaveRequest leaveRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(leaveRequest.getUser().getEmail());
            message.setSubject("Leave Request " + leaveRequest.getStatus().name() + " - " + leaveRequest.getType().name());
            
            String text = String.format(
                "Dear %s,\n\n" +
                "Your leave request has been %s:\n\n" +
                "Type: %s\n" +
                "Start Date: %s\n" +
                "End Date: %s\n" +
                "Days: %d\n" +
                "Status: %s\n" +
                "%s" +
                "\nBest regards,\n" +
                "HR Leave Management System",
                leaveRequest.getUser().getFirstName(),
                leaveRequest.getStatus().name().toLowerCase(),
                leaveRequest.getType().name(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getDays(),
                leaveRequest.getStatus().name(),
                leaveRequest.getReviewerComments() != null ? 
                    "Comments: " + leaveRequest.getReviewerComments() + "\n" : ""
            );
            
            message.setText(text);
            mailSender.send(message);
            
            logger.info("Leave request status notification sent to employee: {}", leaveRequest.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Failed to send leave request status notification to employee: {}", leaveRequest.getUser().getEmail(), e);
        }
    }
}