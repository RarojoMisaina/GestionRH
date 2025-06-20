package com.hrleave.dto;

public class LeaveBalanceDto {
    private Long id;
    private Long userId;
    private Integer annualLeave;
    private Integer sickLeave;
    private Integer personalLeave;
    private Integer usedAnnual;
    private Integer usedSick;
    private Integer usedPersonal;
    private Integer year;
    
    // Calculated fields
    private Integer remainingAnnual;
    private Integer remainingSick;
    private Integer remainingPersonal;

    // Constructors
    public LeaveBalanceDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getAnnualLeave() { return annualLeave; }
    public void setAnnualLeave(Integer annualLeave) { this.annualLeave = annualLeave; }

    public Integer getSickLeave() { return sickLeave; }
    public void setSickLeave(Integer sickLeave) { this.sickLeave = sickLeave; }

    public Integer getPersonalLeave() { return personalLeave; }
    public void setPersonalLeave(Integer personalLeave) { this.personalLeave = personalLeave; }

    public Integer getUsedAnnual() { return usedAnnual; }
    public void setUsedAnnual(Integer usedAnnual) { this.usedAnnual = usedAnnual; }

    public Integer getUsedSick() { return usedSick; }
    public void setUsedSick(Integer usedSick) { this.usedSick = usedSick; }

    public Integer getUsedPersonal() { return usedPersonal; }
    public void setUsedPersonal(Integer usedPersonal) { this.usedPersonal = usedPersonal; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getRemainingAnnual() { return remainingAnnual; }
    public void setRemainingAnnual(Integer remainingAnnual) { this.remainingAnnual = remainingAnnual; }

    public Integer getRemainingSick() { return remainingSick; }
    public void setRemainingSick(Integer remainingSick) { this.remainingSick = remainingSick; }

    public Integer getRemainingPersonal() { return remainingPersonal; }
    public void setRemainingPersonal(Integer remainingPersonal) { this.remainingPersonal = remainingPersonal; }
}