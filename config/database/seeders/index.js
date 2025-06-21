const bcrypt = require('bcryptjs');
const { getConnection, connectDB } = require('../../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    const connection = await getConnection();

    // Create default leave types
    const leaveTypes = [
      { name: 'Annual Leave', description: 'Vacation days', max_days_per_year: 25 },
      { name: 'Sick Leave', description: 'Medical leave', max_days_per_year: 10 },
      { name: 'Personal Leave', description: 'Personal time off', max_days_per_year: 5 },
      { name: 'Maternity/Paternity Leave', description: 'Parental leave', max_days_per_year: 90 }
    ];

    console.log('Creating leave types...');
    for (const leaveType of leaveTypes) {
      await connection.query(`
        INSERT INTO leave_types (name, description, max_days_per_year)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE description = VALUES(description), max_days_per_year = VALUES(max_days_per_year)
      `, [leaveType.name, leaveType.description, leaveType.max_days_per_year]);
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO users (email, password, first_name, last_name, role, department)
      VALUES ('admin@company.com', ?, 'Admin', 'User', 'hr', 'Human Resources')
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, [adminPassword]);

    // Create sample manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const [managerResult] = await connection.query(`
      INSERT INTO users (email, password, first_name, last_name, role, department)
      VALUES ('manager@company.com', ?, 'John', 'Manager', 'manager', 'IT Department')
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, [managerPassword]);
    
    let managerId = managerResult.insertId;
    if (managerId === 0) {
      // User already exists, get the ID
      const [existingManager] = await connection.query('SELECT id FROM users WHERE email = ?', ['manager@company.com']);
      managerId = existingManager[0].id;
    }

    // Create sample employee
    const employeePassword = await bcrypt.hash('employee123', 10);
    const [employeeResult] = await connection.query(`
      INSERT INTO users (email, password, first_name, last_name, role, department, manager_id)
      VALUES ('employee@company.com', ?, 'Jane', 'Employee', 'employee', 'IT Department', ?)
      ON DUPLICATE KEY UPDATE password = VALUES(password), manager_id = VALUES(manager_id)
    `, [employeePassword, managerId]);

    // Initialize leave balances for all users
    const currentYear = new Date().getFullYear();
    const [users] = await connection.query('SELECT id FROM users');
    const [leaveTypesResult] = await connection.query('SELECT id, max_days_per_year FROM leave_types WHERE is_active = true');

    console.log('Initializing leave balances...');
    for (const user of users) {
      for (const leaveType of leaveTypesResult) {
        await connection.query(`
          INSERT INTO leave_balances (user_id, leave_type_id, year, total_days, remaining_days)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            total_days = VALUES(total_days), 
            remaining_days = VALUES(remaining_days)
        `, [user.id, leaveType.id, currentYear, leaveType.max_days_per_year, leaveType.max_days_per_year]);
      }
    }

    connection.release();
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📧 Default accounts created:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Employee: employee@company.com / employee123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();