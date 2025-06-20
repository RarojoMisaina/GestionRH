import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LeaveRequest, User } from '../../types';
import { format } from 'date-fns';
import { Calendar, Clock, User as UserIcon, MessageSquare } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
  title: string;
  showApprovalActions?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export const LeaveRequestsList: React.FC<LeaveRequestsListProps> = ({
  requests,
  title,
  showApprovalActions = false,
  onApprove,
  onReject,
}) => {
  const getRequestUser = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-green-100 text-green-800',
      maternity: 'bg-purple-100 text-purple-800',
      emergency: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || colors.annual;
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => {
            const user = getRequestUser(request.userId);
            return (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {showApprovalActions && user && (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      )}
                      <Badge variant={request.status as any}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeaveTypeColor(request.type)}`}>
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Submitted {format(new Date(request.submittedAt), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{request.reason}</p>

                    {request.reviewerComments && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Comments</span>
                        </div>
                        <p className="text-sm text-gray-600">{request.reviewerComments}</p>
                      </div>
                    )}
                  </div>

                  {showApprovalActions && request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onApprove?.(request.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onReject?.(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};