import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, BarChart3, Settings, Home, Clock } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    switch (user?.role) {
      case 'employee':
        return [
          ...baseItems,
          { id: 'my-leaves', label: 'My Leaves', icon: Calendar },
          { id: 'balance', label: 'Leave Balance', icon: Clock },
        ];
      case 'manager':
        return [
          ...baseItems,
          { id: 'my-leaves', label: 'My Leaves', icon: Calendar },
          { id: 'team-requests', label: 'Team Requests', icon: Users },
          { id: 'balance', label: 'Leave Balance', icon: Clock },
        ];
      case 'hr':
        return [
          ...baseItems,
          { id: 'all-requests', label: 'All Requests', icon: Calendar },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white border-r border-gray-200 w-64 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <div className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};