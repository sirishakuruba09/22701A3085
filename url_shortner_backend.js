const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // REMEMBER TO CHANGE THIS IN PRODUCTION

// In-memory "database" for a simple example. Not suitable for production.
const users = [];
const shortenedUrls = {}; // Stores URLs by userId: { userId: [{shortcode: '...', originalUrl: '...'}] }

// Middleware to parse JSON bodies
app.use(express.json());

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

// --- ROUTES ---

/**
 * Register Route
 * Creates a new user in the in-memory array.
 */
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).send('Username already exists.');
  }

  const userId = users.length + 1;
  const newUser = { id: userId, username, password };
  users.push(newUser);

  res.status(201).json({ message: 'User created successfully.', userId: newUser.id });
});

/**
 * Login Route
 * Authenticates the user from the in-memory array and returns a JWT.
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).send('Invalid username or password.');
  }

  // Create a JWT with the user's information
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  // Send the token back to the client
  res.json({ token });
});

/**
 * Protected Route: Get a user's shortened URLs
 * This route is only accessible to authenticated users.
 */
app.get('/my-urls', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userUrls = shortenedUrls[userId] || [];

  res.json({
    message: `Here are the URLs you've shortened, ${req.user.username}:`,
    urls: userUrls
  });
});

/**
 * Protected Route: Create a new short URL for the authenticated user
 * This is a new route that fits into the project logic.
 */
app.post('/shorturls', authenticateToken, (req, res) => {
  const { url, shortcode } = req.body;
  const userId = req.user.id;

  if (!url) {
    return res.status(400).send('Original URL is required.');
  }

  const finalShortcode = shortcode || Math.random().toString(36).substring(2, 8);
  
  // Check if the shortcode is unique across all users
  const isShortcodeTaken = Object.values(shortenedUrls).flat().some(item => item.shortcode === finalShortcode);
  
  if (isShortcodeTaken) {
    return res.status(409).send('Custom shortcode is already taken. Please try another.');
  }

  const newUrl = {
    originalUrl: url,
    shortcode: finalShortcode,
    createdAt: new Date().toISOString()
  };

  // Add the new URL to the user's array in our in-memory storage
  if (!shortenedUrls[userId]) {
    shortenedUrls[userId] = [];
  }
  shortenedUrls[userId].push(newUrl);

  res.status(201).json({
    message: 'URL shortened successfully.',
    shortcode: finalShortcode,
    fullUrl: `http://localhost:${PORT}/${finalShortcode}`
  });
});

/**
 * Public Route: Redirection from shortcode
 * This route is public and redirects to the original URL.
 */
app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  
  // Find the URL in the in-memory storage
  const urlEntry = Object.values(shortenedUrls).flat().find(item => item.shortcode === shortcode);

  if (!urlEntry) {
    return res.status(404).send('Shortened URL not found.');
  }

  res.redirect(urlEntry.originalUrl);
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
