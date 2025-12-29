const express = require('express');
const router = express.Router();
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const verifyToken = require('../middleware/verifyToken'); // Token middleware

const config = {
  user: 'sa',
  password: process.env.DB_USER,
  server: process.env.DB_PASSWORD,
  port: 1433,
  database: 'TwiTrends_1',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const secretKey = 'secret-key';


const sendEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const mailOptions = {
      from: 'koraysarican423@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the following link: http://localhost:3000/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
  }
};

//  LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: '2h' }
    );

    res.json({ token, role: user.role, user_id: user.user_id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

//  REGISTER
router.post('/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    await sql.connect(config);
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql.query`
      INSERT INTO Users (full_name, email, password, role)
      VALUES (${fullName}, ${email}, ${hashedPassword}, ${role})
    `;
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

//  PASSWORD RESET (Forgot Password)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;
    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpire = Date.now() + 86400000; // 24 saat

   
    await sql.query`
      UPDATE Users 
      SET resetPasswordToken = ${resetToken}, resetPasswordExpire = ${resetTokenExpire}
      WHERE email = ${email}
    `;

    
    await sendEmail(email, resetToken);  // sendEmail fonksiyonunu çağırıyoruz.

    res.status(200).json({ message: 'Password reset link sent' });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

//  VERIFY RESET TOKEN
router.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const result = await sql.query`
      SELECT * FROM Users 
      WHERE resetPasswordToken = ${token} AND resetPasswordExpire > ${new Date().getTime()}
    `;
    
    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }

    res.status(200).json({ message: 'Token geçerli.' });

  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

//  PASSWORD RESET (Reset Password)
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Şifreler eşleşmiyor' });
  }

  try {
    const result = await sql.query`
      SELECT * FROM Users 
      WHERE resetPasswordToken = ${token} AND resetPasswordExpire > ${new Date().getTime()}
    `;
    
    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

 
    await sql.query`
      UPDATE Users 
      SET password = ${hashedPassword}, resetPasswordToken = NULL, resetPasswordExpire = NULL
      WHERE user_id = ${user.user_id}
    `;

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/me', verifyToken, async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT user_id, full_name, email FROM Users WHERE user_id = ${req.user.user_id}
    `;
    const user = result.recordset[0];
    res.json(user);
  } catch (err) {
    console.error('Fetch my account error:', err);
    res.status(500).json({ error: 'Failed to fetch account data' });
  }
});


router.put('/me', verifyToken, async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    await sql.connect(config);

    const updates = [];
    if (full_name) updates.push(`full_name = '${full_name}'`);
    if (email) updates.push(`email = '${email}'`);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = '${hashedPassword}'`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE Users SET ${updates.join(', ')} WHERE user_id = ${req.user.user_id}`;
    await sql.query(query);

    res.json({ message: 'Account updated successfully' });
  } catch (err) {
    console.error('Update my account error:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});



router.get('/admin/users', verifyToken, async (req, res) => {
  const role = req.user.role; // Kullanıcı rolü, token'dan alınmalı

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Erişim engellendi. Admin olmanız gerekiyor.' });
  }

  try {
    await sql.connect(config); 
    const result = await sql.query`
      SELECT user_id, full_name, email, role, created_at FROM Users
    `;
    const users = result.recordset;
    res.json(users); 
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});




router.delete('/admin/users/:id', verifyToken, async (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.user.user_id;

  console.log("Silinmek istenen ID:", userId);
  console.log("Giriş yapan ID:", currentUserId);

  if (parseInt(userId) === parseInt(currentUserId)) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
     .input('userId', sql.Int, userId)
    .query('DELETE FROM Users WHERE user_id = @userId');


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


