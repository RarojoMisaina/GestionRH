package com.hrleave.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Min(0)
    @Column(name = "annual_leave")
    private Integer annualLeave = 25;

    @Min(0)
    @Column(name = "sick_leave")
    private Integer sickLeave = 10;

    @Min(0)
    @Column(name = "personal_leave")
    private Integer personalLeave = 5;

    @Min(0)
    @Column(name = "used_annual")
    private Integer usedAnnual = 0;

    @Min(0)
    @Column(name = "used_sick")
    private Integer usedSick = 0;

    @Min(0)
    @Column(name = "used_personal")
    private Integer usedPersonal = 0;

    @Column(name = "year")
    private Integer year;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public LeaveBalance() {}

    public LeaveBalance(User user, Integer year) {
        this.user = user;
        this.year = year;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (year == null) {
            year = LocalDateTime.now().getYear();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}