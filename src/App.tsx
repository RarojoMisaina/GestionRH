import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { LeaveRequestForm } from './components/leaves/LeaveRequestForm';
import { LeaveRequestsList } from './components/leaves/LeaveRequestsList';
import { LeaveBalance } from './components/leaves/LeaveBalance';
import { EmployeeManagement } from './components/hr/EmployeeManagement';
import { Button } from './components/ui/Button';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { useLeaveData } from './hooks/useLeaveData';
import { Plus, Calendar, Users, BarChart3 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const { 
    getUserLeaveRequests, 
    getUserLeaveBalance, 
    getTeamLeaveRequests, 
    leaveRequests,
    updateLeaveRequest 
  } = useLeaveData();

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const userRequests = getUserLeaveRequests(user.id);
  const userBalance = getUserLeaveBalance(user.id);
  const teamRequests = user.role === 'manager' ? getTeamLeaveRequests(user.id) : [];

  const handleApproveRequest = (requestId: string) => {
    updateLeaveRequest(requestId, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.id,
      reviewerComments: 'Approved by manager',
    });
  };

  const handleRejectRequest = (requestId: string) => {
    updateLeaveRequest(requestId, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.id,
      reviewerComments: 'Request rejected',
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaveRequestsList
                requests={userRequests.slice(0, 5)}
                title="Recent Leave Requests"
              />
              {user.role === 'manager' && (
                <LeaveRequestsList
                  requests={teamRequests.filter(r => r.status === 'pending').slice(0, 5)}
                  title="Team Requests Pending Approval"
                  showApprovalActions
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}
            </div>
          </div>
        );

      case 'my-leaves':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Leave Requests</h2>
              <Button onClick={() => setShowLeaveForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
            <LeaveRequestsList
              requests={userRequests}
              title="All My Requests"
            />
          </div>
        );

      case 'balance':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Balance</h2>
            {userBalance && <LeaveBalance balance={userBalance} />}
          </div>
        );

      case 'team-requests':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Leave Requests</h2>
            <LeaveRequestsList
              requests={teamRequests}
              title="Team Requests"
              showApprovalActions
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </div>
        );

      case 'all-requests':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Leave Requests</h2>
            <LeaveRequestsList
              requests={leaveRequests}
              title="All Requests"
              showApprovalActions
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </div>
        );

      case 'employees':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Management</h2>
            <EmployeeManagement />
          </div>
        );

      case 'reports':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Leave Statistics
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requests</span>
                      <span className="font-medium">{leaveRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-medium text-green-600">
                        {leaveRequests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-amber-600">
                        {leaveRequests.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Department Overview
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engineering</span>
                      <span className="font-medium">3 employees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HR</span>
                      <span className="font-medium">1 employee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Usage Trends
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Leave</span>
                      <span className="font-medium">65% used</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sick Leave</span>
                      <span className="font-medium">23% used</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Annual Leave Days
                    </label>
                    <input
                      type="number"
                      defaultValue={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Workflow
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Manager Approval Required</option>
                      <option>Auto-Approve</option>
                      <option>HR Approval Required</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      {showLeaveForm && (
        <LeaveRequestForm onClose={() => setShowLeaveForm(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;