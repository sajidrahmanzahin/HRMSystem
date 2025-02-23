// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (using environment variables for security)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sajidrahmanzahin:Sajid@5479@cluster0.kjndxtb.mongodb.net/hrm_dashboard';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to HRM Dashboard'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, unique: true, trim: true }, // Optional for login, required for registration
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Office Staff', 'Support'], default: 'Office Staff' },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.index({ username: 1, email: 1, role: 1 }); // Index for faster queries

const settingsSchema = new mongoose.Schema({
  theme: { type: String, default: 'Dark' },
  notifications: { type: Boolean, default: true },
  currency: { type: String, default: 'USD' },
});

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  role: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
});

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  action: { type: String, required: true, enum: ['check-in', 'check-out'] },
  timestamp: { type: Date, default: Date.now },
});

const payrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true, enum: ['Monthly', 'Quarterly'] },
  date: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['Employee', 'Attendance', 'Payroll'] },
  details: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  email: { type: String, trim: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Payroll = mongoose.model('Payroll', payrollSchema);
const Report = mongoose.model('Report', reportSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Middleware for Authentication and Authorization
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Auth Middleware Token:', token); // Debug token
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded User in Auth Middleware:', decoded); // Debug decoded user
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log('Checking role for:', req.user.role, 'Allowed roles:', allowedRoles); // Debug roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes
// Auth Routes (Login only, no self-registration)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body; // Only username and password required
  try {
    const user = await User.findOne({ username });
    console.log('User found for login:', user); // Debug user
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated Token:', token); // Debug token
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login error', error });
  }
});

app.get('/api/auth/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    console.log('Current user fetched:', user); // Debug user
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

app.put('/api/auth/update', authMiddleware, async (req, res) => {
  const { username, email, password, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent users from updating their own role (only Admin/Support via UsersList)
    if (req.body.role) {
      return res.status(403).json({ message: 'Cannot update role directly. Use Users List page.' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Account updated successfully', user: user.select('-password') });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Error updating account', error });
  }
});

app.delete('/api/auth/users/:id', authMiddleware, roleMiddleware(['Admin', 'Support']), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting self or Admins (except by another Admin)
    if (targetUser._id.toString() === req.user.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }
    if (targetUser.role === 'Admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can delete other Admins' });
    }
    if (targetUser.role === 'Admin' || (targetUser.role === 'Support' && req.user.role === 'Support')) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    console.log(`User ${req.user.username} logged out at ${new Date().toISOString()}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Error during logout', error });
  }
});

// User Management Routes (for Admin/Support only)
app.get('/api/auth/users', authMiddleware, roleMiddleware(['Admin', 'Support']), async (req, res) => {
  try {
    console.log('Fetching users for role:', req.user.role); // Debug role
    const users = await User.find().select('-password'); // Exclude passwords
    console.log('Users fetched:', users); // Debug response data
    if (!users.length) {
      console.warn('No users found in database');
      res.json([]); // Return empty array if no users exist
    } else {
      res.json(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

app.post('/api/auth/register', authMiddleware, roleMiddleware(['Admin', 'Support']), async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Only Admin can create other Admins
    if (role === 'Admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can create other Admins' });
    }
    // Support cannot create Admins or themselves
    if (role === 'Admin' || (role === req.user.role && req.user.role === 'Support')) {
      return res.status(403).json({ message: 'Insufficient permissions to create this role' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'Username or email already exists' });

    const newUser = new User({ username, email, password, role: role || 'Office Staff' });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration error', error });
  }
});

app.put('/api/auth/users/:id', authMiddleware, roleMiddleware(['Admin', 'Support']), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Prevent updating self or Admins (except by another Admin)
    if (targetUser._id.toString() === req.user.id) {
      return res.status(403).json({ message: 'Cannot update your own account' });
    }
    if (targetUser.role === 'Admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can update other Admins' });
    }

    const { role } = req.body;
    if (role && !['Admin', 'Manager', 'Office Staff', 'Support'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role) targetUser.role = role;
    await targetUser.save();
    res.json({ message: 'User updated successfully', user: targetUser.select('-password') });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Settings Routes
app.get('/api/settings', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ theme: 'Dark', notifications: true, currency: 'USD' });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error });
  }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error });
  }
});

app.delete('/api/settings', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const settings = await Settings.findOneAndDelete();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    res.json({ message: 'Settings deleted successfully' });
  } catch (error) {
    console.error('Error deleting settings:', error);
    res.status(500).json({ message: 'Error deleting settings', error });
  }
});

// Employees Routes
app.get('/api/employees', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

app.post('/api/employees', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee', error });
  }
});

app.put('/api/employees/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee', error });
  }
});

app.delete('/api/employees/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

// Attendance Routes
app.get('/api/attendance', authMiddleware, async (req, res) => {
  try {
    const { filter } = req.query;
    let attendance = await Attendance.find();
    if (filter && filter !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (filter.toLowerCase() === 'today') {
        attendance = attendance.filter(a => new Date(a.timestamp) >= today);
      }
    }
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error });
  }
});

app.post('/api/attendance', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Office Staff']), async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Error recording attendance', error });
  }
});

app.delete('/api/attendance/:id', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Office Staff']), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Error deleting attendance', error });
  }
});

// Payroll Routes
app.get('/api/payrolls', authMiddleware, async (req, res) => {
  try {
    const { filter } = req.query;
    let payrolls = await Payroll.find();
    if (filter && filter !== 'All') {
      payrolls = payrolls.filter(p => p.period === filter);
    }
    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ message: 'Error fetching payrolls', error });
  }
});

app.post('/api/payrolls', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Error adding payroll:', error);
    res.status(500).json({ message: 'Error adding payroll', error });
  }
});

app.delete('/api/payrolls/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ message: 'Error deleting payroll', error });
  }
});

// Reports Routes
app.get('/api/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error });
  }
});

app.post('/api/reports', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Error adding report:', error);
    res.status(500).json({ message: 'Error adding report', error });
  }
});

app.delete('/api/reports/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report', error });
  }
});

// Feedback Route
app.post('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error });
  }
});

app.delete('/api/feedback/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback', error });
  }
});

// Search API
app.get('/api/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const searchRegex = new RegExp(q, 'i'); // Case-insensitive search
    const results = [];

    // Search Employees
    const employees = await Employee.find({
      $or: [{ name: searchRegex }, { email: searchRegex }, { role: searchRegex }, { department: searchRegex }],
    }).limit(5);
    employees.forEach(employee => results.push({ id: employee._id, name: employee.name, type: 'Employee' }));

    // Search Attendance
    const attendance = await Attendance.find({ employeeId: searchRegex }).limit(5);
    attendance.forEach(record => results.push({ id: record._id, name: record.employeeId, type: 'Attendance' }));

    // Search Payroll
    const payrolls = await Payroll.find({ employeeId: searchRegex }).limit(5);
    payrolls.forEach(payroll => results.push({ id: payroll._id, name: payroll.employeeId, type: 'Payroll', title: `Payroll $${payroll.amount}` }));

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Error searching:', error });
  }
});

// Graceful Shutdown
const server = app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});