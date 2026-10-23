# MOOLA — Developer Setup & Operational Guide

**Document Version**: 1.0.0  
**Last Updated**: October 22, 2026  
**Workspace**: `MOOLA`  

---

## 1. Prerequisites

Ensure your development workstation has the following installed:

- **Node.js**: `v20.0.0` or higher (`node -v`)
- **npm**: `v10.0.0` or higher (`npm -v`)
- **Git**: For version control
- **Expo Go App** (optional): Installed on an iOS or Android physical device for live wireless testing, or Android Studio / Xcode for simulators.
- **MongoDB Atlas Cluster**: Free M0 tier or dedicated cluster on MongoDB Atlas with an active database user and IP access rule (whitelist `0.0.0.0/0` for development).

---

## 2. Environment Configuration

### 2.1 Backend Environment (`apps/server/.env`)
Copy `apps/server/.env.example` to `apps/server/.env`:

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` with your actual development values:

```env
# ── Server ──────────────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_VERSION=v1

# ── MongoDB Atlas ───────────────────────────────────────────
# Replace <username> and <password> with your MongoDB Atlas database user credentials.
# Note: URL-encode any special characters in the password.
MONGODB_URI=mongodb+srv://<username>:<password>@moolacluster.xxxx.mongodb.net/moola?retryWrites=true&w=majority

# ── JWT Secrets ─────────────────────────────────────────────
# Minimum 20 characters required by Zod schema
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min_20_chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_20_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Push Notifications (Expo Push Notification Service) ─────
# Expo push notifications are free and do not require credentials for standard volume.
# Optional Expo Access Token for high-volume accounts:
EXPO_ACCESS_TOKEN=

# ── CORS ────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000,http://10.0.2.2:5000
```

> [!CAUTION]
> **NEVER commit `.env` or paste real credentials into source code, issue trackers, or chat prompts.** Ensure `.env` is listed in your root `.gitignore`.

### 2.2 Mobile Environment (`apps/mobile`)
By default, the mobile app dynamically detects the correct backend endpoint:
- **Android Emulator**: `http://10.0.2.2:5000/api/v1`
- **iOS Simulator / Web**: `http://localhost:5000/api/v1`

To override the backend URL for physical device testing on your local Wi-Fi, set:
```bash
# In apps/mobile or root terminal:
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api/v1
```

---

## 3. Installation & Build Commands

### Step 1: Install All Dependencies
Install monorepo dependencies from the workspace root:

```bash
npm install
```

### Step 2: Build the Shared Package
Compile TypeScript contracts in `packages/shared`:

```bash
npm run shared:build
```

### Step 3: Seed Initial Data (Optional)
To populate sample organic products (jackfruit chips, raw honey, pickles, pepper) and test accounts:

```bash
npm run seed --workspace=apps/server
```

---

## 4. Running the Development Servers

### Start the Backend API Server
In a dedicated terminal:

```bash
npm run server
# Equivalent to: npm run dev --workspace=apps/server
```

- Server URL: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`
- Versioned Health: `http://localhost:5000/api/v1/health`

### Start the Mobile Application (Expo)
In a second terminal:

```bash
npm run mobile
# Equivalent to: npm run start --workspace=apps/mobile
```

- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.
- Press `w` to open in Web Browser.
- Scan the QR code with the Expo Go app on a physical Android or iOS device.

---

## 5. Verification & Testing

### Run All Workspace Tests
Execute test suites across all packages:

```bash
npm test
```

Expected output:
```
> moola-app@1.0.0 test
> npm run test --workspaces

> @moola/mobile@1.0.0 test
> tsc --noEmit

> @moola/server@1.0.0 test
> jest --forceExit --detectOpenHandles
PASS src/tests/workflow.test.ts
PASS src/tests/notifications.test.ts
PASS src/tests/health.test.ts
Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total

> @moola/shared@1.0.0 test
> tsc --noEmit
```

### Compile Backend TypeScript
```bash
npm run build --workspace=apps/server
```

### Verify MongoDB Atlas Connection
Check server logs on startup:
```
✅ MongoDB connected: moolacluster-shard-00-00.xxxx.mongodb.net
```
Or check the health endpoint:
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "success": true,
  "data": {
    "service": "MOOLA API",
    "version": "1.0.0",
    "database": {
      "connected": true,
      "host": "moolacluster-shard-00-00.xxxx.mongodb.net",
      "name": "moola"
    }
  }
}
```

---

## 6. Common Troubleshooting & Solutions

### 1. `MongooseServerSelectionError: connection timed out`
- **Cause**: MongoDB Atlas Network Access whitelist does not allow your current IP address.
- **Solution**: Log into MongoDB Atlas ➔ Security ➔ Network Access ➔ Click **Add IP Address** ➔ Choose **Allow Access from Anywhere (`0.0.0.0/0`)** for development, or add your current public IP.

### 2. `Network request failed` on Android Emulator
- **Cause**: Android emulators treat `localhost` as the emulator device itself.
- **Solution**: The mobile app automatically handles this via `apps/mobile/src/config/api.ts` by using `http://10.0.2.2:5000/api/v1`. Verify that the backend server is running on port 5000.

### 3. `JWT_ACCESS_SECRET must be at least 20 chars`
- **Cause**: Zod environment variable validation requires at least 20 characters for JWT secrets.
- **Solution**: Generate a 32+ character random string in `apps/server/.env`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 4. `Expo push token rejected`
- **Cause**: Expo push tokens must begin with `ExponentPushToken[` or `ExpoPushToken[`.
- **Solution**: On physical devices, Expo generates a valid token automatically. In unit tests and mock environments, `MockPushNotificationProvider` records tokens in memory without making external requests.
