# HR Leave Management System

A comprehensive, production-ready HR leave management system built with React, TypeScript, and Tailwind CSS. This system provides a complete solution for managing employee leave requests with role-based access control.

## 🚀 Features

### Multi-Role Support
- **Employee Portal**: Submit requests, view balances, track history
- **Manager Portal**: Approve/reject team requests, dashboard oversight
- **HR Portal**: User management, system reports, administrative controls

### Core Functionality
- ✅ Leave request submission and approval workflow
- ✅ Real-time leave balance tracking
- ✅ Automated notifications and status updates
- ✅ Comprehensive audit trail
- ✅ Mobile-responsive design
- ✅ Role-based access control
- ✅ Dashboard analytics and reporting

### Leave Types Supported
- Annual Leave
- Sick Leave
- Personal Leave
- Maternity Leave
- Emergency Leave

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Management**: date-fns
- **Build Tool**: Vite
- **Development**: Hot Module Replacement, ESLint

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hr-leave-management-system
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
# or
yarn build
```

### 5. Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 👥 Demo Users

The system includes pre-configured demo users for testing:

| Role | Name | Email | Password |
|------|------|-------|----------|
| Employee | John Doe | john.doe@company.com | password123 |
| Manager | Sarah Johnson | sarah.johnson@company.com | password123 |
| HR Admin | Lisa Chen | hr.admin@company.com | password123 |
| Employee | Mike Wilson | mike.wilson@company.com | password123 |

## 🏗 System Architecture

### Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard widgets
│   ├── hr/              # HR-specific components
│   ├── layout/          # Layout components
│   ├── leaves/          # Leave management components
│   └── ui/              # Base UI components
├── context/             # React Context providers
├── data/                # Mock data and API simulation
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

### Component Structure
- **Modular Design**: Each component focuses on a single responsibility
- **Reusable UI**: Consistent design system with reusable components
- **Type Safety**: Full TypeScript integration for better development experience
- **Context Management**: Centralized state management for authentication and data

## 📱 User Interfaces

### Employee Dashboard
- Personal leave balance overview
- Quick leave request submission
- Request history and status tracking
- Calendar integration

### Manager Dashboard
- Team leave request approvals
- Team calendar overview
- Leave balance monitoring
- Approval workflow management

### HR Administrative Panel
- Employee management
- System-wide leave reports
- Policy configuration
- User role management

## 🔐 Security Features

- Role-based access control (RBAC)
- Secure authentication simulation
- Data validation and sanitization
- Permission-based UI rendering

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Actions, links, primary elements
- **Success**: Green (#10B981) - Approved requests, positive actions
- **Warning**: Amber (#F59E0B) - Pending requests, attention needed
- **Error**: Red (#EF4444) - Rejected requests, errors
- **Gray Scale**: Neutral colors for text and backgrounds

### Typography
- Clean, professional font hierarchy
- Proper contrast ratios for accessibility
- Responsive text sizing

### Layout
- 8px spacing system for consistency
- Card-based design for content organization
- Responsive grid layouts
- Mobile-first approach

## 📊 Workflow Management

### Leave Request Process
1. **Submission**: Employee submits leave request
2. **Routing**: Request routed to appropriate manager
3. **Review**: Manager reviews and approves/rejects
4. **Notification**: Automated status updates
5. **Balance Update**: Leave balances automatically adjusted
6. **Archive**: Request archived with audit trail

### Approval Hierarchy
- Employees → Direct Manager → HR (for special cases)
- Automatic routing based on organizational structure
- Escalation rules for delayed approvals

## 🚀 Future Enhancements

### Planned Features
- [ ] Email notification integration
- [ ] Calendar synchronization (Google Calendar, Outlook)
- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] Integration with payroll systems
- [ ] Multi-language support
- [ ] Document attachments for requests

### Technical Improvements
- [ ] Backend API integration
- [ ] Database persistence
- [ ] Real-time notifications
- [ ] Automated testing suite
- [ ] Performance optimization
- [ ] PWA capabilities

## 🧪 Testing

Run the linting checks:
```bash
npm run lint
```

## 📝 Development Guidelines

### Code Organization
- Follow component-based architecture
- Maintain single responsibility principle
- Use TypeScript for type safety
- Implement proper error handling

### Styling
- Use Tailwind CSS utility classes
- Maintain consistent spacing (8px system)
- Ensure responsive design
- Follow accessibility guidelines

### State Management
- Use React Context for global state
- Custom hooks for data fetching
- Immutable state updates
- Proper error boundaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to the documentation

---

**Note**: This is a demonstration application with mock data. For production use, integrate with a proper backend API and database system following the architectural patterns established in this codebase.