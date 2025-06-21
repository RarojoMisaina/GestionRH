const express = require('express');
const { body, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (HR only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', authorize('hr'), async (req, res) => {
  try {
    const connection = await getConnection();
    
    const [users] = await connection.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.department, u.hire_date, u.is_active,
             m.first_name as manager_first_name, m.last_name as manager_last_name
      FROM users u
      LEFT JOIN users m ON u.manager_id = m.id
      ORDER BY u.last_name, u.first_name
    `);
    
    connection.release();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          manager: user.manager_first_name ? {
            name: `${user.manager_first_name} ${user.manager_last_name}`
          } : null
        }))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/team:
 *   get:
 *     summary: Get team members (for managers)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 */
router.get('/team', authorize('manager', 'hr'), async (req, res) => {
  try {
    const connection = await getConnection();
    
    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.department, u.hire_date,
             COALESCE(SUM(lb.remaining_days), 0) as total_remaining_days
      FROM users u
      LEFT JOIN leave_balances lb ON u.id = lb.user_id AND lb.year = YEAR(CURDATE())
    `;
    
    const params = [];
    
    if (req.user.role === 'manager') {
      query += ' WHERE u.manager_id = ?';
      params.push(req.user.id);
    }
    
    query += ' GROUP BY u.id ORDER BY u.last_name, u.first_name';
    
    const [team] = await connection.query(query, params);
    connection.release();

    res.json({
      success: true,
      data: {
        team
      }
    });

  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (HR only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               department:
 *                 type: string
 *               role:
 *                 type: string
 *               manager_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', authorize('hr'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { first_name, last_name, department, role, manager_id, is_active } = req.body;
    
    const connection = await getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(department);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (manager_id !== undefined) {
      updateFields.push('manager_id = ?');
      updateValues.push(manager_id);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }
    
    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(userId);
    
    await connection.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    connection.release();

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;