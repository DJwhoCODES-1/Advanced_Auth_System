# 🔐 Advanced Auth System

A **secure and production-grade authentication system** built with modern best practices in mind — focusing on **security**, **scalability**, and **user safety**.  
This project demonstrates an advanced approach to authentication and authorization using layered protection techniques.

---

## 🚀 Features

### 🧩 Security & Authentication Features

- **🧱 NoSQL Injection Protection** — Safeguards against malicious database query manipulations.
- **📧 Email Verification via Secure Link** — Users must verify their email before activating their account.
- **🔢 Two-Factor Authentication (2FA)** — Adds an additional verification step using OTP or authenticator apps.
- **🌐 CSRF Token Protection (Cross-Site Request Forgery)** — Defends against malicious cross-origin requests by validating origin and token pairs.
- **🔒 Access & Refresh Token Mechanism** — Uses short-lived access tokens and refresh tokens for secure, seamless session renewal.
- **🚦 IP + Email-Based Rate Limiting (Redis)** — Prevents brute-force attacks by tracking requests via Redis.
- **🧍 Role-Based Authentication** — Assigns specific permissions and access scopes based on user roles.
- **💾 Session-Based Authentication** — Restricts login to a **single active session** per user or device.

---

## 🛡️ CSRF Protection — In Depth

**Cross-Site Request Forgery (CSRF)** occurs when a malicious website tricks a user’s browser into sending authenticated requests (including cookies) to another site without consent.

To prevent this, we’ve implemented **multi-layered CSRF defense**:

### 1. 🧁 Double-Submit Cookie Pattern

- On successful authentication, the backend issues a short-lived, `httpOnly` **CSRF secret cookie** (`csrfSecret`) — **unreadable by JavaScript**.
- The frontend explicitly requests a **CSRF token** via `/csrf-token` API.
- This API issues a **signed JWT token** using the server’s secret, embedding the `csrfSecret` inside it.
- The frontend must include this token in request headers (`x-csrf-token`) for all **state-changing requests** (POST, PUT, DELETE).

### 2. 🧩 Server-Side Token Validation

- The backend validates:
  - The **origin** header (must match your trusted frontend domain).
  - The **CSRF token signature** using a private server secret.
  - The **matching secret** stored in the user’s CSRF cookie and Redis.

### 3. 🔄 Cookie Lifecycle Management

- The `csrfSecret` cookie is **rotated** periodically and **deleted** after a CSRF token is issued — ensuring it can’t be reused.
- Any subsequent token request without a valid `csrfSecret` is denied.

### 4. 🌐 Origin Enforcement

The middleware enforces that only requests from your **frontend domain** are accepted:

```js
const requestOrigin = req.get("origin");
if (requestOrigin !== process.env.FRONTEND_URL) {
  return res.status(403).json({ message: "Invalid request origin." });
}
```

This blocks all browser-originated requests from untrusted domains — even if the cookies are attached.

✅ Result:
Even if a user visits a malicious site, their browser cannot forge a valid CSRF token, and requests from untrusted origins are rejected outright.

🧱 NoSQL Injection

NoSQL injection happens when untrusted user input is inserted directly into NoSQL queries (e.g., MongoDB) and an attacker manipulates operators like $ne, $gt, $or, or $where to alter query logic.

Vulnerable example (do not use):

db["merchants"].findOne({ email: { $ne: null }, otp: { $ne: null } });

✅ Safe Approach:

const email = String(req.body.email || '').trim();
const otp = String(req.body.otp || '').trim();
const merchant = await merchants.findOne({ email, otp });

🧱 Tech Stack

Backend: Node.js / Express

Database: MongoDB (NoSQL)

Cache & Rate Limiting: Redis

Authentication: JWT (Access & Refresh Tokens)

Email Service: Nodemailer / AWS SES / SendGrid

🔄 Authentication Flow

User Registration

Email verification via signed, time-limited link.

Login

Credentials validated → OTP sent for 2FA.

OTP Verification

Upon success → Access, Refresh, and CSRF secret issued.

CSRF Token Fetch

Frontend requests a CSRF token using the secret cookie.

Protected Requests

Frontend includes the token in headers; server validates.

Logout

Session invalidated and all tokens (including CSRF) revoked.

🧰 Setup & Installation

# Clone the repository

git clone https://github.com/yourusername/Advanced_Auth_System.git

# Navigate into the project

cd Advanced_Auth_System

# Install dependencies

npm install

# Create environment configuration

cp .env.example .env

# Start the development server

npm run dev

🧩 Environment Variables Example
PORT=5000
MONGO_URL=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
SERVER_CSRF_SECRET=your_csrf_signing_secret
FRONTEND_URL=https://your-frontend-domain.com

```

📖 License

DJwhoCODES © 2025 — Advanced Auth System
```
