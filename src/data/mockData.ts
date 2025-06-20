import { User, LeaveBalance, LeaveRequest, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@company.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    managerId: '2',
    department: 'Engineering',
    joinDate: '2022-01-15',
  },
  {
    id: '2',
    email: 'sarah.johnson@company.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'manager',
    department: 'Engineering',
    joinDate: '2020-03-10',
  },
  {
    id: '3',
    email: 'hr.admin@company.com',
    firstName: 'Lisa',
    lastName: 'Chen',
    role: 'hr',
    department: 'Human Resources',
    joinDate: '2019-06-01',
  },
  {
    id: '4',
    email: 'mike.wilson@company.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'employee',
    managerId: '2',
    department: 'Engineering',
    joinDate: '2023-02-20',
  }
];

export const mockLeaveBalances: LeaveBalance[] = [
  {
    userId: '1',
    annualLeave: 25,
    sickLeave: 10,
    personalLeave: 5,
    usedAnnual: 8,
    usedSick: 2,
    usedPersonal: 1,
  },
  {
    userId: '2',
    annualLeave: 30,
    sickLeave: 15,
    personalLeave: 8,
    usedAnnual: 12,
    usedSick: 3,
    usedPersonal: 2,
  },
  {
    userId: '3',
    annualLeave: 25,
    sickLeave: 12,
    personalLeave: 5,
    usedAnnual: 5,
    usedSick: 1,
    usedPersonal: 0,
  },
  {
    userId: '4',
    annualLeave: 20,
    sickLeave: 8,
    personalLeave: 3,
    usedAnnual: 3,
    usedSick: 0,
    usedPersonal: 1,
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '1',
    type: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-19',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    submittedAt: '2024-01-28T10:30:00Z',
  },
  {
    id: '2',
    userId: '4',
    type: 'sick',
    startDate: '2024-01-10',
    endDate: '2024-01-11',
    days: 2,
    reason: 'Flu symptoms',
    status: 'approved',
    submittedAt: '2024-01-09T08:00:00Z',
    reviewedAt: '2024-01-09T14:30:00Z',
    reviewedBy: '2',
    reviewerComments: 'Approved. Hope you feel better soon.',
  },
  {
    id: '3',
    userId: '1',
    type: 'personal',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    days: 1,
    reason: 'Medical appointment',
    status: 'approved',
    submittedAt: '2024-01-20T09:15:00Z',
    reviewedAt: '2024-01-20T16:45:00Z',
    reviewedBy: '2',
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Leave Request Submitted',
    message: 'Your leave request for Feb 15-19 has been submitted for approval.',
    type: 'info',
    isRead: false,
    createdAt: '2024-01-28T10:30:00Z',
  },
  {
    id: '2',
    userId: '2',
    title: 'New Leave Request',
    message: 'John Doe has submitted a leave request requiring your approval.',
    type: 'warning',
    isRead: false,
    createdAt: '2024-01-28T10:30:00Z',
  }
];