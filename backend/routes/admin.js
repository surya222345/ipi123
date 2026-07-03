const express = require('express');
const router = express.Router();

// @desc   Admin login — verify password
// @route  POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const correct = process.env.ADMIN_PASSWORD;

  if (!password) return res.status(400).json({ message: 'Password required' });

  if (password === correct) {
    return res.json({ success: true, token: 'admin-authenticated' });
  }

  return res.status(401).json({ success: false, message: 'தவறான கடவுச்சொல் (Wrong password)' });
});

module.exports = router;
