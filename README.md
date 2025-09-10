# Assignment Submission: URL Shortener with Authentication and Middleware  

## 1. Introduction  
This project implements a backend service using **Node.js** and **Express.js**. The application provides:  
- A **URL shortener** service  
- **User authentication** with JSON Web Tokens (JWT)  
- **Middleware-based access control** for secure routes  

The design balances simplicity for academic demonstration with scalability considerations for real-world systems.  

---

## 2. Features  

### URL Shortener Backend (`url_shortner_backend (1).js`)  
- **Register**: Add new users with username and password.  
- **Login**: Authenticate and receive a signed JWT (valid for 1 hour).  
- **Shorten URL**: Create a custom or auto-generated shortcode.  
- **My URLs**: Retrieve shortened URLs for the logged-in user.  
- **Redirect**: Access original link using the shortcode.  
- **Public Route**: Accessible without authentication.  

### Middleware Example (`middle_wear.js`)  
- **Login**: Authenticate a test or admin user to receive a JWT.  
- **Dashboard**: Protected route accessible only with a valid token.  
- **Public Route**: Open endpoint for unauthenticated access.  

---

## 3. Data Models  

**User**  
```json
{ "id": 1, "username": "alice", "password": "plaintext" }
```  

**Shortened URL**  
```json
{ "originalUrl": "https://example.com", "shortcode": "abc123", "createdAt": "2025-09-06T12:00:00Z" }
```  

---

## 4. Technology Choices  
- **Node.js** – Non-blocking runtime for scalable applications  
- **Express.js** – Lightweight and flexible web framework  
- **jsonwebtoken (JWT)** – Provides stateless, token-based authentication  

---

## 5. Installation & Execution  

1. Install dependencies:  
   ```bash
   npm install express jsonwebtoken
   ```

2. Run backend server:  
   ```bash
   node url_shortner_backend.js
   ```

3. Run middleware example:  
   ```bash
   node middle_wear.js
   ```

4. Server runs at:  
   ```
   http://localhost:3000
   ```  

---

## 6. Example Workflow  

1. **Register**  
   ```json
   POST /register
   { "username": "student", "password": "securepass" }
   ```

2. **Login**  
   ```json
   POST /login
   { "username": "student", "password": "securepass" }
   ```

   Response:  
   ```json
   { "token": "your.jwt.token" }
   ```

3. **Shorten a URL**  
   ```json
   POST /shorturls
   Authorization: Bearer <token>
   { "url": "https://example.org" }
   ```

---

## 7. Security Notes  
- Passwords stored in plaintext (for demonstration). Should be hashed in production.  
- Hardcoded `SECRET_KEY`; in real deployments use environment variables.  
- Tokens expire after **1 hour** to reduce misuse risks.  

---

## 8. File Structure  
```
├── url_shortner_backend.js   # Full-featured URL shortener with JWT
├── middle_wear.js            # Middleware example with protected route
└── README.md                 # Documentation
```

---

## 9. Conclusion  
The system demonstrates secure backend practices by combining **authentication, middleware, and API design**. Though simplified for assignment purposes, the design can be extended into a scalable production service with persistent storage, encrypted credentials, and containerized deployment.  
