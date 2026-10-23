# Known issues and future work

This document records the assessment of the current development project. It is
intentionally descriptive: these items are not being silently fixed as part of
the repository-preparation work.

## Critical before a public repository push

### Local secret handling

`myBackend/.env` contains a JWT signing secret. It is now covered by the root
`.gitignore`, but ignoring a file does not remove it from an existing commit.
Before publishing, confirm that `.env` has never been committed. Rotate the
secret before using a public or shared environment.

### Dependency audit

The production dependency audit reported a critical transitive advisory in
`proxy-addr`. Review the lockfile and apply a compatible dependency update
before deployment.

## High-priority security work

### Password-reset token design

Password-reset tokens are stateless JWTs and can be reused until expiration.
They use the same signing secret and general JWT mechanism as login tokens,
without a dedicated purpose claim. A future implementation should use
cryptographically random, one-time tokens whose hashes, expiration, and
consumed state are stored in MongoDB. Password reset should also invalidate
appropriate existing sessions.

### CSRF protection

Authentication is cookie-based and state-changing routes do not currently have
CSRF protection. CORS is not a replacement for CSRF protection. Add a suitable
CSRF strategy before using cross-site cookies in production.

### Cookie and HTTPS configuration

The login cookie currently uses `secure: true` and `sameSite: "none"`. These
settings are appropriate only for a compatible HTTPS deployment. Local HTTP
development and future deployments should use environment-aware, explicitly
reviewed cookie settings.

### Brute-force and abuse controls

Login, signup, and password-reset endpoints have no rate limiting, lockout,
backoff, or abuse monitoring.

## Validation and API robustness

- Request bodies need schema validation.
- Email addresses need format and normalization rules.
- Password type and strength checks should be consistent across signup and
  password reset.
- Names, usernames, and roles need explicit format and length constraints.
- MongoDB IDs should be validated before querying.
- Error responses should avoid exposing internal database or implementation
  details.
- A centralized error handler would improve consistency.

## Data and scalability

- The admin user list loads all users at once and needs pagination.
- User listing should select only fields needed by the client.
- Password reset and session state need a clear invalidation policy.
- Production logging, monitoring, and request correlation are not configured.

## Email and deployment configuration

- SMTP host, port, credentials, sender address, and frontend links are
  hardcoded or local-development-only.
- Email HTML interpolates user-controlled values without an explicit escaping
  layer.
- CORS origins are hardcoded for the temporary frontend.
- The server binds to `localhost`; container or remote deployment may require a
  configurable host.
- HTTPS and a production email provider are not configured.

## Testing and maintenance

- There is no automated test suite.
- `npm test` is currently a placeholder that exits with an error.
- Authentication, authorization, reset flows, validation, and failure paths
  need integration coverage.
- API documentation is currently maintained manually and should eventually be
  generated or validated against route tests.

## Current strengths

- Passwords are hashed with bcrypt before storage.
- Public responses remove password and Mongoose version fields.
- Protected role decisions consult the current database user.
- Self-service routes enforce ownership.
- Admin deletion prevents deleting administrators or the requester.
- Login and unknown-email reset responses avoid basic credential disclosure.
- Database connection failure prevents the HTTP server from starting.
