# NovaCart full-stack project

This repository contains the early backend for **NovaCart** and a small temporary
browser frontend used to exercise the backend while the real NovaCart frontend
is being designed.

The temporary frontend is intentionally simple. It is a development and
demonstration client, not the final NovaCart user interface.

## Repository layout

```text
myFullStack/
├── myBackend/                 Node.js REST API
│   ├── README.md              Backend setup and API details
│   ├── app.js                 Express middleware and route mounting
│   ├── server.js              MongoDB connection and server startup
│   ├── .env.example           Local configuration template
│   ├── package.json
│   └── src/
│       ├── controllers/       HTTP request handlers
│       ├── middlewares/       Authentication and authorization
│       ├── models/            Mongoose models
│       ├── routes/            API route definitions
│       └── services/          Reusable business and email logic
├── myFrontEnd/                Temporary HTML, CSS, and JavaScript client
│   ├── README.md              Temporary frontend instructions
│   ├── index.html              Login screen
│   ├── signup.html             Registration screen
│   ├── forgetpassword.html     Password-reset request screen
│   ├── resetpassword.html      Password-reset form
│   ├── user-dashboard.html     Placeholder user dashboard
│   └── admin-dashboard.html    User administration screen
├── docs/
│   └── KNOWN-ISSUES.md         Assessment and planned improvements
├── .gitignore
└── .gitattributes
```

See the [backend README](myBackend/README.md) for backend-specific setup and
the [temporary frontend README](myFrontEnd/README.md) for the browser client.

## Current capabilities

The backend currently provides:

- User registration with bcrypt password hashing
- Email/password login
- HTTP-only JWT authentication cookies
- User profile lookup, update, and self-deletion
- Admin user listing and deletion
- Super-admin role assignment
- Password-reset request and reset endpoints
- Welcome and password-reset email helpers
- A `/health` endpoint

The temporary frontend provides forms and screens for these flows. The user
dashboard is currently a placeholder. The admin dashboard displays users and
provides the currently implemented role and deletion controls.

## Technology

### Backend

- Node.js with ES modules
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- bcrypt
- cookie-parser and CORS
- Nodemailer
- MailDev for local email testing

### Frontend

- Static HTML
- CSS
- Browser JavaScript modules
- Fetch API
- VS Code Live Server during local development

## Local setup

### Requirements

- Node.js 18 or newer
- npm
- MongoDB
- MailDev or another SMTP server on `localhost:1025` for email features
- VS Code Live Server, or another static-file server, for the temporary frontend

### Backend

From `myBackend/`:

```bash
npm install
copy .env.example .env
npm run dev
```

Edit `.env` before starting the server. At minimum, set `DATABASE_URL` and a
long random `SECRET`. The real `.env` file is ignored by Git and must never be
committed.

The API runs at `http://localhost:8000` by default.

### Local email

The current email service uses MailDev's SMTP listener:

```bash
npx maildev
```

MailDev normally provides an inbox at `http://localhost:1080`.

### Temporary frontend

Open `myFrontEnd/` with VS Code Live Server using port `5500`. The frontend is
currently configured to call:

```text
http://localhost:8000/api/v1/users
```

The backend allows the local origins `http://localhost:5500` and
`http://127.0.0.1:5500`.

## API overview

All user API paths are prefixed with `/api/v1/users`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | Public |
| POST | `/login` | Public |
| POST | `/signup` | Public |
| POST | `/user/logout` | Public |
| POST | `/user/forgot-password` | Public |
| POST | `/user/reset-password` | Public |
| GET | `/user/id/:id` | Authenticated owner |
| PATCH | `/user/update/:id` | Authenticated owner |
| DELETE | `/user/delete/:id` | Authenticated owner |
| GET | `/` | Admin or super-admin |
| DELETE | `/admin/delete/:id` | Admin or super-admin |
| PATCH | `/admin/update/:id/role` | Super-admin |

## Authentication and roles

Successful login creates an HTTP-only `token` cookie containing a JWT. The
backend checks the current database record for protected role and ownership
decisions.

The user model currently supports:

- `student`
- `admin`
- `super-admin`

There is no public registration option for an initial administrator. For local
testing, an administrator must be provisioned through the database or an
explicitly controlled administrative process.

## Development status

This is an early development project. The backend works for the intended local
test flows, but it is not production-ready. Known security, reliability,
validation, and maintainability limitations are documented in
[docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md).

The most important pre-production items are:

1. Remove and rotate any secret that has ever been stored in a local `.env`
   before publishing history.
2. Resolve the reported dependency audit issue.
3. Add request validation and rate limiting.
4. Harden password-reset tokens and add CSRF protection for cookie-authenticated
   state-changing requests.
5. Configure HTTPS, cookies, CORS, email delivery, and URLs per environment.
6. Add automated tests and production logging.

## Testing

No automated test suite is configured yet. The current `npm test` command is a
placeholder and exits with an error. JavaScript syntax checks and manual smoke
tests are the current validation approach.

## Scope boundary

The temporary frontend is included to make backend testing convenient. It will
likely be replaced or substantially redesigned when the NovaCart frontend is
ready. Backend behavior should therefore be treated as the current API
contract, while the temporary UI should not be treated as a final product
design.
