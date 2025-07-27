const express = require('express');
const router = express.Router();
const { signup, login, logout, getProfile, updateProfile } = require('../controllers/auth.controller');

router.post('/register', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 