# Temporary NovaCart test frontend

This is a small static HTML/CSS/JavaScript client used to exercise the
`myBackend` API while the real NovaCart frontend is not yet ready.

## Screens

- `index.html` - login
- `signup.html` - registration
- `forgetpassword.html` - request a password-reset email
- `resetpassword.html` - submit a new password
- `user-dashboard.html` - placeholder user dashboard
- `admin-dashboard.html` - list and manage users as an administrator

## Running locally

Open this folder with VS Code Live Server on port `5500`. The JavaScript client
currently calls:

```text
http://localhost:8000/api/v1/users
```

Start the backend separately from `myBackend/` with `npm run dev`.

This frontend is intentionally temporary and is not production-ready. Its API
URL, authentication behavior, and UI will be revisited when the NovaCart
frontend is implemented.
