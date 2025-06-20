export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr';
  managerId?: string;
  department: string;
  joinDate: string;
  avatar?: string;
}

export interface LeaveBalance {
  userId: string;
  annualLeave: number;
  sickLeave: number;
  personalLeave: number;
  usedAnnual: number;
  usedSick: number;
  usedPersonal: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerComments?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}