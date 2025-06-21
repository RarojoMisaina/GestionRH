const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { getConnection } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @swagger
 * /api/leaves/request:
 *   post:
 *     summary: Submit a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type_id
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               leave_type_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 */
router.post('/request', [
  body('leave_type_id').isInt({ min: 1 }).withMessage('Valid leave type is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { leave_type_id, start_date, end_date, reason } = req.body;

  try {
    const connection = await getConnection();
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (endDate < startDate) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Calculate days requested (simple calculation - can be enhanced for business days)
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const [balances] = await connection.query(`
      SELECT remaining_days 
      FROM leave_balances 
      WHERE user_id = ? AND leave_type_id = ? AND year = ?
    `, [req.user.id, leave_type_id, currentYear]);

    if (balances.length === 0 || balances[0].remaining_days < daysRequested) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Insufficient leave balance'
      });
    }

    // Check for overlapping requests
    const [overlapping] = await connection.query(`
      SELECT id FROM leave_requests 
      WHERE user_id = ? 
      AND status IN ('pending', 'approved')
      AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))
    `, [req.user.id, start_date, start_date, end_date, end_date]);

    if (overlapping.length > 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'You have overlapping leave requests'
      });
    }

    // Create leave request
    const [result] = await connection.query(`
      INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, days_requested, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, leave_type_id, start_date, end_date, daysRequested, reason]);

    // Get manager for notification
    const [managers] = await connection.query(`
      SELECT m.id, m.email, m.first_name, m.last_name
      FROM users u
      JOIN users m ON u.manager_id = m.id
      WHERE u.id = ?
    `, [req.user.id]);

    // Create notification for manager
    if (managers.length > 0) {
      await connection.query(`
        INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
        VALUES (?, ?, ?, 'info', 'leave_requests', ?)
      `, [
        managers[0].id,
        'New Leave Request',
        `${req.user.first_name} ${req.user.last_name} has submitted a leave request for approval`,
        result.insertId
      ]);
    }

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        request_id: result.insertId,
        days_requested: daysRequested
      }
    });

  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/leaves/my-requests:
 *   get:
 *     summary: Get current user's leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully
 */
router.get('/my-requests', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled'])
], async (req, res) => {
  try {
    const { status, year } = req.query;
    const connection = await getConnection();
    
    let query = `
      SELECT lr.*, lt.name as leave_type_name,
             u.first_name as approver_first_name, u.last_name as approver_last_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE lr.user_id = ?
    `;
    
    const params = [req.user.id];
    
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    
    if (year) {
      query += ' AND YEAR(lr.start_date) = ?';
      params.push(year);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    const [requests] = await connection.query(query, params);
    connection.release();

    res.json({
      success: true,
      data: {
        requests: requests.map(request => ({
          ...request,
          approver: request.approver_first_name ? {
            name: `${request.approver_first_name} ${request.approver_last_name}`
          } : null
        }))
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/leaves/balance:
 *   get:
 *     summary: Get current user's leave balance
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 */
router.get('/balance', async (req, res) => {
  try {
    const connection = await getConnection();
    const currentYear = new Date().getFullYear();
    
    const [balances] = await connection.query(`
      SELECT lb.*, lt.name as leave_type_name, lt.description
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.user_id = ? AND lb.year = ?
      ORDER BY lt.name
    `, [req.user.id, currentYear]);
    
    connection.release();

    res.json({
      success: true,
      data: {
        year: currentYear,
        balances
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/leaves/pending-approvals:
 *   get:
 *     summary: Get pending leave requests for approval (managers/HR only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 */
router.get('/pending-approvals', authorize('manager', 'hr'), async (req, res) => {
  try {
    const connection = await getConnection();
    
    let query = `
      SELECT lr.*, lt.name as leave_type_name,
             u.first_name, u.last_name, u.department
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.user_id = u.id
      WHERE lr.status = 'pending'
    `;
    
    const params = [];
    
    // If manager, only show requests from their team
    if (req.user.role === 'manager') {
      query += ' AND u.manager_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY lr.created_at ASC';
    
    const [requests] = await connection.query(query, params);
    connection.release();

    res.json({
      success: true,
      data: {
        requests: requests.map(request => ({
          ...request,
          employee: {
            name: `${request.first_name} ${request.last_name}`,
            department: request.department
          }
        }))
      }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/leaves/approve/{id}:
 *   put:
 *     summary: Approve a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave request approved successfully
 */
router.put('/approve/:id', authorize('manager', 'hr'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const connection = await getConnection();
    
    // Get the request details
    const [requests] = await connection.query(`
      SELECT lr.*, u.manager_id
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ? AND lr.status = 'pending'
    `, [requestId]);
    
    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or already processed'
      });
    }
    
    const request = requests[0];
    
    // Check authorization (manager can only approve their team's requests)
    if (req.user.role === 'manager' && request.manager_id !== req.user.id) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You can only approve requests from your team'
      });
    }
    
    // Update request status
    await connection.query(`
      UPDATE leave_requests 
      SET status = 'approved', approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [req.user.id, requestId]);
    
    // Update leave balance
    const currentYear = new Date().getFullYear();
    await connection.query(`
      UPDATE leave_balances 
      SET used_days = used_days + ?, remaining_days = remaining_days - ?
      WHERE user_id = ? AND leave_type_id = ? AND year = ?
    `, [request.days_requested, request.days_requested, request.user_id, request.leave_type_id, currentYear]);
    
    // Create notification for employee
    await connection.query(`
      INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
      VALUES (?, ?, ?, 'success', 'leave_requests', ?)
    `, [
      request.user_id,
      'Leave Request Approved',
      `Your leave request has been approved by ${req.user.first_name} ${req.user.last_name}`,
      requestId
    ]);
    
    connection.release();

    res.json({
      success: true,
      message: 'Leave request approved successfully'
    });

  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/leaves/reject/{id}:
 *   put:
 *     summary: Reject a leave request
 *     tags: [Leaves]
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request rejected successfully
 */
router.put('/reject/:id', [
  authorize('manager', 'hr'),
  body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const requestId = req.params.id;
    const { reason } = req.body;
    const connection = await getConnection();
    
    // Get the request details
    const [requests] = await connection.query(`
      SELECT lr.*, u.manager_id
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ? AND lr.status = 'pending'
    `, [requestId]);
    
    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or already processed'
      });
    }
    
    const request = requests[0];
    
    // Check authorization
    if (req.user.role === 'manager' && request.manager_id !== req.user.id) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests from your team'
      });
    }
    
    // Update request status
    await connection.query(`
      UPDATE leave_requests 
      SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `, [req.user.id, reason, requestId]);
    
    // Create notification for employee
    await connection.query(`
      INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
      VALUES (?, ?, ?, 'error', 'leave_requests', ?)
    `, [
      request.user_id,
      'Leave Request Rejected',
      `Your leave request has been rejected. Reason: ${reason}`,
      requestId
    ]);
    
    connection.release();

    res.json({
      success: true,
      message: 'Leave request rejected successfully'
    });

  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;