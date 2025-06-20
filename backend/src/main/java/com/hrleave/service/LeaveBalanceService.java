package com.hrleave.service;

import com.hrleave.dto.LeaveBalanceDto;
import com.hrleave.entity.LeaveBalance;
import com.hrleave.entity.LeaveRequest;
import com.hrleave.entity.User;
import com.hrleave.repository.LeaveBalanceRepository;
import com.hrleave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    public LeaveBalanceDto getLeaveBalance(Long userId) {
        int currentYear = LocalDateTime.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndYear(userId, currentYear)
                .orElseGet(() -> createDefaultLeaveBalance(userId, currentYear));

        return convertToDto(balance);
    }

    public LeaveBalanceDto updateLeaveBalance(Long userId, LeaveBalanceDto balanceDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        int currentYear = LocalDateTime.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndYear(userId, currentYear)
                .orElseGet(() -> createDefaultLeaveBalance(userId, currentYear));

        balance.setAnnualLeave(balanceDto.getAnnualLeave());
        balance.setSickLeave(balanceDto.getSickLeave());
        balance.setPersonalLeave(balanceDto.getPersonalLeave());

        LeaveBalance savedBalance = leaveBalanceRepository.save(balance);

        auditService.logAction(user, "UPDATE_LEAVE_BALANCE", "LeaveBalance", savedBalance.getId(),
                "Updated leave balance");

        return convertToDto(savedBalance);
    }

    public boolean hasEnoughBalance(Long userId, LeaveRequest.LeaveType leaveType, Integer days) {
        LeaveBalanceDto balance = getLeaveBalance(userId);

        switch (leaveType) {
            case ANNUAL:
                return balance.getRemainingAnnual() >= days;
            case SICK:
                return balance.getRemainingSick() >= days;
            case PERSONAL:
                return balance.getRemainingPersonal() >= days;
            case MATERNITY:
            case EMERGENCY:
                return true; // These types don't count against regular balance
            default:
                return false;
        }
    }

    public void deductLeaveBalance(Long userId, LeaveRequest.LeaveType leaveType, Integer days) {
        int currentYear = LocalDateTime.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndYear(userId, currentYear)
                .orElseGet(() -> createDefaultLeaveBalance(userId, currentYear));

        switch (leaveType) {
            case ANNUAL:
                balance.setUsedAnnual(balance.getUsedAnnual() + days);
                break;
            case SICK:
                balance.setUsedSick(balance.getUsedSick() + days);
                break;
            case PERSONAL:
                balance.setUsedPersonal(balance.getUsedPersonal() + days);
                break;
            default:
                // MATERNITY and EMERGENCY don't affect regular balance
                return;
        }

        leaveBalanceRepository.save(balance);

        User user = userRepository.findById(userId).orElse(null);
        auditService.logAction(user, "DEDUCT_LEAVE_BALANCE", "LeaveBalance", balance.getId(),
                "Deducted " + days + " days of " + leaveType.name().toLowerCase() + " leave");
    }

    public void restoreLeaveBalance(Long userId, LeaveRequest.LeaveType leaveType, Integer days) {
        int currentYear = LocalDateTime.now().getYear();
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByUserIdAndYear(userId, currentYear);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();

            switch (leaveType) {
                case ANNUAL:
                    balance.setUsedAnnual(Math.max(0, balance.getUsedAnnual() - days));
                    break;
                case SICK:
                    balance.setUsedSick(Math.max(0, balance.getUsedSick() - days));
                    break;
                case PERSONAL:
                    balance.setUsedPersonal(Math.max(0, balance.getUsedPersonal() - days));
                    break;
                default:
                    return;
            }

            leaveBalanceRepository.save(balance);

            User user = userRepository.findById(userId).orElse(null);
            auditService.logAction(user, "RESTORE_LEAVE_BALANCE", "LeaveBalance", balance.getId(),
                    "Restored " + days + " days of " + leaveType.name().toLowerCase() + " leave");
        }
    }

    private LeaveBalance createDefaultLeaveBalance(Long userId, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        LeaveBalance balance = new LeaveBalance(user, year);
        return leaveBalanceRepository.save(balance);
    }

    private LeaveBalanceDto convertToDto(LeaveBalance balance) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(balance.getId());
        dto.setUserId(balance.getUser().getId());
        dto.setAnnualLeave(balance.getAnnualLeave());
        dto.setSickLeave(balance.getSickLeave());
        dto.setPersonalLeave(balance.getPersonalLeave());
        dto.setUsedAnnual(balance.getUsedAnnual());
        dto.setUsedSick(balance.getUsedSick());
        dto.setUsedPersonal(balance.getUsedPersonal());
        dto.setYear(balance.getYear());

        // Calculate remaining balances
        dto.setRemainingAnnual(balance.getAnnualLeave() - balance.getUsedAnnual());
        dto.setRemainingSick(balance.getSickLeave() - balance.getUsedSick());
        dto.setRemainingPersonal(balance.getPersonalLeave() - balance.getUsedPersonal());

        return dto;
    }
}