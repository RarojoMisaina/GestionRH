import { useState, useEffect } from 'react';
import { LeaveRequest, LeaveBalance, User } from '../types';
import { mockLeaveRequests, mockLeaveBalances, mockUsers } from '../data/mockData';

export const useLeaveData = (userId?: string) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaveRequests(mockLeaveRequests);
      setLeaveBalances(mockLeaveBalances);
      setLoading(false);
    }, 300);
  }, []);

  const getUserLeaveRequests = (uid: string) => {
    return leaveRequests.filter(request => request.userId === uid);
  };

  const getUserLeaveBalance = (uid: string) => {
    return leaveBalances.find(balance => balance.userId === uid);
  };

  const getTeamLeaveRequests = (managerId: string) => {
    const teamMembers = mockUsers.filter(user => user.managerId === managerId);
    return leaveRequests.filter(request => 
      teamMembers.some(member => member.id === request.userId)
    );
  };

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setLeaveRequests(prev => [...prev, newRequest]);
    return newRequest;
  };

  const updateLeaveRequest = (requestId: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === requestId ? { ...request, ...updates } : request
      )
    );
  };

  return {
    leaveRequests,
    leaveBalances,
    loading,
    getUserLeaveRequests,
    getUserLeaveBalance,
    getTeamLeaveRequests,
    submitLeaveRequest,
    updateLeaveRequest,
  };
};