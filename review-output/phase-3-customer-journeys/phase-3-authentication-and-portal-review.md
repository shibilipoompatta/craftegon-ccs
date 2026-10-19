# CraftEgon CCS — Phase 3: Authentication and Customer Portal Review

**Project:** CraftEgon CCS (`ccs.craftegon.com`)  
**Workspace:** `C:\Users\shibi\OneDrive\Desktop\craftegon-ccs`  
**Report Focus:** Cryptographic Authentication, Session Management, Account Integrity & Row-Level Security  
**Execution Timestamp:** 2026-10-19  

---

## 1. Authentication Architecture & Password Cryptography

Customer authentication and session security are implemented in `src/backend/controllers/auth.controller.js` and `src/backend/storage/account-repository.js` using Node.js built-ins (`node:crypto`).

### Cryptographic Baseline
- **Key Derivation Function:** `scrypt` (`crypto.scryptSync(password, salt, 64)`).
- **Salt Generation:** Unique 16-byte cryptographically secure random salt generated per user via `crypto.randomBytes(16)`.
- **Timing-Safe Verification:** Password verification uses `crypto.timingSafeEqual` between stored hash buffer and newly derived hash buffer, eliminating timing side-channel attacks.
- **Password Policy:**
  - Minimum 8 characters, maximum 128 characters.
  - Requires at least one uppercase letter, one lowercase letter, and one number.
  - Weak passwords (e.g., `'Pass1'`, `'PasswordOnly'`) are rejected with descriptive HTTP 400 errors.

---

## 2. Session Management & Transport Security

### Dual Token & Cookie Authentication
The authentication guard (`src/backend/middleware/auth-guard.js`) transparently accepts two credential channels:
1. `Authorization: Bearer <cct_token>` header (for programmatic API clients and mobile interfaces).
2. `craftegon_session=<cct_token>` cookie (for interactive browser-based portal navigation).

### Cookie Security Attributes
Successful login sets the session cookie with hardened flags:
- `HttpOnly`: Prevents client-side JavaScript access and protects against XSS token extraction.
- `SameSite=Strict`: Prevents cross-site request forgery (CSRF) in cross-origin contexts.
- `Path=/`: Scoped to application root.
- `Secure`: Enforced in production TLS environments.

### Session Lifecycle & Invalidation
- **Token Generation:** Opaque 32-byte hexadecimal token prefixed with `cct_` (`crypto.randomBytes(32).toString('hex')`).
- **Database Hashing:** Session tokens are stored in the database as SHA-256 hashes (`token_hash`), ensuring raw tokens cannot be recovered if the database is dumped.
- **Revocation on Logout:** `POST /api/v1/auth/logout` sets `revoked_at = CURRENT_TIMESTAMP` and issues a `Set-Cookie: craftegon_session=; Max-Age=0` clearing header.
- **Automatic Invalidation on Password Reset:** Updating an account's password automatically revokes all existing active sessions across all devices for that account.

---

## 3. Account Enumeration & Brute-Force Defenses

1. **Uniform Error Responses:**
   - Login attempts with incorrect credentials return identical generic error messages:
     `{"error": "Unauthorized", "message": "Invalid email or password"}`
   - Registration attempts for existing emails return HTTP 409 (`Conflict`) with safe error messaging.
   - Password reset requests (`/api/v1/auth/forgot-password`) return HTTP 200 with identical success messaging regardless of whether the email exists, preventing user account enumeration.
2. **Account Lockout:**
   - 5 consecutive failed login attempts trigger an automatic 15-minute account lockout (`locked_until`), rejecting further attempts with HTTP 429.
3. **Production Synthetic Login Protection:**
   - In non-production test environments, synthetic testing tokens are permitted for unit tests. In production (`NODE_ENV === 'production'`), synthetic logins are strictly blocked with HTTP 403 (`SYNTHETIC_LOGIN_BLOCKED_IN_PRODUCTION`).

---

## 4. Server-Side Account Records & Tenant Isolation

1. **Identity Derived Server-Side:**
   - Client requests cannot specify or manipulate `client_id`, `account_id`, or `role`.
   - The backend strictly extracts the authenticated user from the validated session:
     ```javascript
     const user = await requireAuth(req, res);
     if (!user) return;
     const userId = user.account_id || user.id;
     ```
2. **PostgreSQL Row-Level Security (RLS) Policies:**
   - Migration `002_row_level_security.sql` activates engine-level policies:
     ```sql
     ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
     
     CREATE POLICY cases_select_policy ON cases
         FOR SELECT
         USING (
             client_id = NULLIF(current_setting('app.current_client_id', true), '')::UUID
             OR current_setting('app.current_user_role', true) IN ('compliance_operator', 'managing_partner')
         );
     ```
   - Automated testing on live PostgreSQL 18 verified that Customer B querying Customer A's case receives HTTP 404 with zero rows returned by the query engine.
