import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { LeaveBalance as LeaveBalanceType } from '../../types';
import { Calendar, Activity, User } from 'lucide-react';

interface LeaveBalanceProps {
  balance: LeaveBalanceType;
}

export const LeaveBalance: React.FC<LeaveBalanceProps> = ({ balance }) => {
  const leaveTypes = [
    {
      type: 'Annual Leave',
      total: balance.annualLeave,
      used: balance.usedAnnual,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progressColor: 'bg-blue-600',
    },
    {
      type: 'Sick Leave',
      total: balance.sickLeave,
      used: balance.usedSick,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      progressColor: 'bg-red-600',
    },
    {
      type: 'Personal Leave',
      total: balance.personalLeave,
      used: balance.usedPersonal,
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progressColor: 'bg-green-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Leave Balance</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {leaveTypes.map((leave) => {
            const Icon = leave.icon;
            const remaining = leave.total - leave.used;
            const usagePercentage = (leave.used / leave.total) * 100;

            return (
              <div key={leave.type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${leave.bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${leave.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{leave.type}</h4>
                      <p className="text-sm text-gray-600">
                        {remaining} days remaining of {leave.total}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{leave.used} used</p>
                    <p className="text-xs text-gray-500">{Math.round(usagePercentage)}% utilized</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${leave.progressColor}`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};