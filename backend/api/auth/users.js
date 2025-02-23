// backend/server.js (GET /api/auth/users)
app.get('/api/auth/users', authMiddleware, roleMiddleware(['Admin', 'Support']), async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude passwords
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  });