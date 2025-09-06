// server.js
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // In a real app, use an environment variable

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory "database" for a simple example
const users = [
  { id: 1, username: 'testuser', password: 'password123' },
  { id: 2, username: 'admin', password: 'adminpassword' },
];

/**
 * Middleware to authenticate a user based on a JWT.
 * It checks for a token in the 'Authorization' header.
 * If the token is valid, it decodes it and attaches the user payload to the request.
 * If not, it sends a 401 Unauthorized response.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // The token is typically in the format "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).send('Invalid or expired token.');
    }
    // Attach the decoded user payload to the request object
    req.user = user;
    next(); // Pass control to the next handler
  });
};

// =======================
// ROUTES
// =======================

/**
 * Login Route
 * Authenticates the user and returns a JWT.
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user in the database
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).send('Invalid username or password.');
  }

  // Create a JWT with the user's information
  // The token expires in 1 hour
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  // Send the token back to the client
  res.json({ token });
});

/**
 * Protected Route
 * This route is only accessible to authenticated users.
 */
app.get('/dashboard', authenticateToken, (req, res) => {
  // If we reach here, the token was successfully validated by the middleware.
  // We can now access the user's information from req.user
  res.json({
    message: `Welcome to the dashboard, ${req.user.username}!`,
    userId: req.user.id,
  });
});

/**
 * Public Route
 * This route does not require any authentication.
 */
app.get('/', (req, res) => {
  res.send('This is a public route. You can access it without a token.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});