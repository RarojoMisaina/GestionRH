const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const leaveRoutes = require('./leaves');
const notificationRoutes = require('./notifications');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leaves', leaveRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;