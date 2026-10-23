# NovaCart Backend

REST API backend for the NovaCart application. The project uses Node.js, Express, MongoDB/Mongoose, JWT authentication, bcrypt password hashing, cookies, and Nodemailer.

## Current status

The project is currently configured for local development.

Implemented:

- User registration and login
- Cookie-based JWT authentication
- User profile lookup, update, and self-delete routes
- Admin user listing and deletion
- Super-admin role assignment
- Welcome-email and password-reset email helpers using a local SMTP server
- Health-check endpoint

Known limitation:

- Password-reset JWTs expire after five minutes, but they are stateless and can
  be reused until they expire. A database-backed one-time reset-token mechanism
  is recommended before production use.

## Technology stack

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens with `jsonwebtoken`
- `bcrypt` for password hashing
- `cookie-parser` for authentication cookies
- `cors` for frontend access
- Nodemailer for email delivery
- MailDev for local email testing

## Project structure

```text
.
├── app.js                         Express app configuration
├── server.js                      MongoDB connection and HTTP server startup
├── package.json
├── .env                           Local environment variables (do not commit)
├── .env.example                   Safe configuration template
└── src/
    ├── controllers/
    │   ├── adminController.js     Admin and super-admin operations
    │   └── userController.js      Registration, login, profile, and reset handlers
    ├── middlewares/
    │   ├── authenticate.js        Verifies the JWT cookie
    │   ├── authorize.js            Role and ownership authorization
    │   └── jwt.js                  JWT signing and verification helpers
    ├── models/
    │   └── userModel.js            Mongoose user schema
    ├── routes/
    │   ├── adminRoute.js           Admin-protected routes
    │   └── userRoute.js            User routes
    └── services/
        ├── emailService.js         Welcome and password-reset emails
        ├── passwordResetService.js Password-reset business logic
        └── userService.js          User lookup and public-user helpers
```

## Prerequisites

- Node.js 18 or newer
- A running MongoDB instance
- npm
- MailDev, or another SMTP server listening on the configured host and port, for email features

## Installation

```bash
npm install
```

Create a `.env` file in the project root. Do not commit the real file or expose its values:

```env
DATABASE_URL=mongodb://localhost:27017/backend
PORT=8000
NODE_ENV=development
SECRET=replace-with-a-long-random-secret
```

`SECRET` must be set to the same long, random value whenever tokens are signed and verified. It should be rotated using a planned key-management process in production.

## Running locally

Start the API in development mode:

```bash
npm run dev
```

The server listens on:

```text
http://localhost:8000
```

The application only allows these frontend origins by default:

- `http://localhost:5500`
- `http://127.0.0.1:5500`

Because authentication is stored in an HTTP-only cookie, frontend requests must include credentials:

```js
fetch("http://localhost:8000/api/v1/users/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

## Local email testing

The email service currently sends SMTP mail to:

```text
host: localhost
port: 1025
secure: false
```

Start MailDev in a separate terminal if it is installed:

```bash
npx maildev
```

MailDev normally exposes its inbox at:

```text
http://localhost:1080
```

The current email templates contain local frontend links and the SMTP
configuration is hardcoded for MailDev. Before deployment, move the frontend
base URL and SMTP settings into environment configuration and use a production
SMTP provider.

## API reference

All API paths below are prefixed with `/api/v1/users`.

### Health check

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | None | Checks whether the Express server is running. |

The health endpoint is mounted at `/health`, not under the users prefix.

### Authentication and user routes

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | None | Verifies credentials and sets the `token` HTTP-only cookie. |
| `POST` | `/signup` | None | Creates a user and attempts to send a welcome email. |
| `POST` | `/user/logout` | None | Clears the authentication cookie. |
| `GET` | `/user/id/:id` | Authenticated owner | Returns the requesting user's public profile. |
| `PATCH` | `/user/update/:id` | Authenticated owner | Updates profile fields. |
| `DELETE` | `/user/delete/:id` | Authenticated owner | Deletes the requesting user's account. |

### Admin routes

| Method | Path | Required role | Description |
| --- | --- | --- | --- |
| `GET` | `/` | `admin` or `super-admin` | Returns all users without password fields. |
| `DELETE` | `/admin/delete/:id` | `admin` or `super-admin` | Deletes another user, subject to role protections. |
| `PATCH` | `/admin/update/:id/role` | `super-admin` | Changes another user's role. |

### Password reset routes

The following controller handlers and services exist:

- `forgotPassword`
- `resetPassword`
- `forgotPasswordService`
- `resetUserPasswordService`

These handlers are mounted in `src/routes/userRoute.js` at the following
endpoints:

```text
POST /api/v1/users/forgot-password
POST /api/v1/users/reset-password
```

The intended request shapes are:

```json
{
  "email": "user@example.com"
}
```

```json
{
  "token": "token-from-reset-link",
  "newPassword": "new-password"
}
```

## Authentication flow

1. A user logs in with an email and password.
2. The password is compared with the bcrypt hash stored in MongoDB.
3. The server signs a JWT using `SECRET`.
4. The JWT is stored in an HTTP-only `token` cookie.
5. Protected requests are verified by `authenticate`.
6. Admin and ownership middleware checks the authenticated user's current database record.

The login JWT expires after 20 minutes. The cookie currently has a one-hour `maxAge`, so the JWT is the effective authentication limit.

## Password handling

- Signup hashes passwords with bcrypt before saving them.
- Passwords are not returned by `publicUser`.
- Password-reset passwords are also hashed with bcrypt.
- Password reset links currently contain a five-minute JWT.

JWTs are stateless. A valid reset JWT can be submitted more than once during its lifetime. For production, replace or supplement the reset JWT with a random reset token whose hash, expiry, and used state are stored in MongoDB. Mark the token as used atomically when the password is changed.

## Roles

The user schema supports:

- `student`
- `admin`
- `super-admin`

Regular users can access only their own user-specific routes. Admins can list and delete users, while super-admins can update roles. Self-deletion and self-role changes are explicitly blocked in the admin controller.

## Response conventions

Successful responses generally include:

```json
{
  "success": true,
  "message": "..."
}
```

Errors generally include:

```json
{
  "success": false,
  "message": "..."
}
```

## Important limitations and recommended improvements

Before treating this API as production-ready, address the following:

1. Add a one-time, database-backed password-reset token flow.
2. Enforce reset-password strength rules consistently with signup.
3. Use a configurable frontend URL instead of hardcoded localhost links in email templates.
4. Use a production SMTP provider and environment-based mail configuration.
5. Add rate limiting to login and password-reset requests.
6. Add request validation for email, IDs, names, roles, and password fields.
7. Add centralized error handling and consistent status-code handling.
8. Add tests for authentication, authorization, signup, login, account deletion, role changes, and password reset.
9. Review cookie settings for the deployment environment. `secure: true` and `sameSite: "none"` require HTTPS and cross-site cookie support.
10. Do not expose `.env` or real secrets in source control.
11. Add pagination to the admin user-list endpoint as the database grows.
12. Make host binding configurable for container and remote deployments.
13. Add logging, monitoring, and request correlation for production troubleshooting.

## Testing

No automated test suite is currently configured. The `npm test` script is still a placeholder and exits with an error. Manual smoke testing should at least cover:

- `GET /health`
- Signup with valid and invalid data
- Login with valid and invalid credentials
- Access to protected routes with and without the cookie
- Owner versus non-owner access
- Admin and super-admin restrictions
- Logout and cookie clearing
- Password-reset email delivery and expired-token behavior

## Security notes

- Keep `.env` private.
- Use a strong random `SECRET`.
- Use HTTPS in production.
- Keep authentication cookies HTTP-only.
- Avoid returning sensitive database fields.
- Do not log passwords or reset tokens.
- Use generic password-reset responses so attackers cannot discover registered email addresses.