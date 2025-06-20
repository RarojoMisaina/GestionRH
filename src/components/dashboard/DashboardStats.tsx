import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLeaveData } from '../../hooks/useLeaveData';

export const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const { getUserLeaveRequests, getUserLeaveBalance, getTeamLeaveRequests } = useLeaveData();

  if (!user) return null;

  const userRequests = getUserLeaveRequests(user.id);
  const userBalance = getUserLeaveBalance(user.id);
  const teamRequests = user.role === 'manager' ? getTeamLeaveRequests(user.id) : [];

  const stats = [
    {
      title: 'Remaining Annual Leave',
      value: userBalance ? `${userBalance.annualLeave - userBalance.usedAnnual} days` : '0 days',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Requests',
      value: userRequests.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Approved This Year',
      value: userRequests.filter(r => r.status === 'approved').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  if (user.role === 'manager') {
    stats.push({
      title: 'Team Requests Pending',
      value: teamRequests.filter(r => r.status === 'pending').length,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} hover>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};