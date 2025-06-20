-- Insert default users
INSERT INTO users (email, password, first_name, last_name, role, department, join_date, created_at, updated_at, enabled) VALUES
('john.doe@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Doe', 'EMPLOYEE', 'Engineering', '2022-01-15', NOW(), NOW(), true),
('sarah.johnson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Sarah', 'Johnson', 'MANAGER', 'Engineering', '2020-03-10', NOW(), NOW(), true),
('hr.admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Lisa', 'Chen', 'HR', 'Human Resources', '2019-06-01', NOW(), NOW(), true),
('mike.wilson@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Mike', 'Wilson', 'EMPLOYEE', 'Engineering', '2023-02-20', NOW(), NOW(), true);

-- Update manager relationships
UPDATE users SET manager_id = 2 WHERE id IN (1, 4);

-- Insert default leave balances
INSERT INTO leave_balances (user_id, annual_leave, sick_leave, personal_leave, used_annual, used_sick, used_personal, year, created_at, updated_at) VALUES
(1, 25, 10, 5, 8, 2, 1, 2024, NOW(), NOW()),
(2, 30, 15, 8, 12, 3, 2, 2024, NOW(), NOW()),
(3, 25, 12, 5, 5, 1, 0, 2024, NOW(), NOW()),
(4, 20, 8, 3, 3, 0, 1, 2024, NOW(), NOW());

-- Insert sample leave requests
INSERT INTO leave_requests (user_id, type, start_date, end_date, days, reason, status, submitted_at, created_at, updated_at) VALUES
(1, 'ANNUAL', '2024-02-15', '2024-02-19', 5, 'Family vacation', 'PENDING', NOW(), NOW(), NOW()),
(4, 'SICK', '2024-01-10', '2024-01-11', 2, 'Flu symptoms', 'APPROVED', '2024-01-09 08:00:00', NOW(), NOW()),
(1, 'PERSONAL', '2024-01-25', '2024-01-25', 1, 'Medical appointment', 'APPROVED', '2024-01-20 09:15:00', NOW(), NOW());

-- Update approved requests with reviewer information
UPDATE leave_requests SET reviewed_at = '2024-01-09 14:30:00', reviewed_by = 2, reviewer_comments = 'Approved. Hope you feel better soon.' WHERE id = 2;
UPDATE leave_requests SET reviewed_at = '2024-01-20 16:45:00', reviewed_by = 2 WHERE id = 3;