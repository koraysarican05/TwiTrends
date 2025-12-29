// TwiTrends-Backend/routes/admin.js
const express = require('express');
const sql = require('mssql');
const router = express.Router();
const config = require('../dbConfig'); 
const verifyToken = require('../middleware/verifyToken');  


router.get('/users', verifyToken, async (req, res) => {
  const role = req.user.role;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Erişim engellendi. Admin olmanız gerekiyor.' });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT user_id, full_name, email, role, created_at FROM Users
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/users/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.user.user_id;
  const role = req.user.role;

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Erişim engellendi. Sadece admin kullanıcılar silebilir.' });
  }

  if (parseInt(userId) === parseInt(currentUserId)) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      DELETE FROM Users WHERE user_id = ${userId}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


module.exports = router;

