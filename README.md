# HillResQ 🏔️🚨
> **Tagline:** Report. Respond. Rescue.

A full-stack MERN application engineered specifically for emergency and disaster incident reporting, verification, and dispatch management in rugged, high-altitude hilly terrains (landslides, flash floods, fallen trees, road blockages, bridge collapses).

---

## 📋 Features & Incident Lifecycle

HillResQ implements a strict 5-stage lifecycle for emergency incidents:

```
[ REPORTED ] ──► [ VERIFIED ] ──► [ ASSIGNED ] ──► [ IN_PROGRESS ] ──► [ RESOLVED ]
      ▲                 │
      │                 ▼
(Citizen submits)  [ REJECTED ] (Spam / duplicate)
```

1. **Citizens**:
   - Register and authenticate securely with salted bcrypt passwords and JWT tokens.
   - Report emergencies with title, description, category, severity, and landmark description.
   - Pick precise geographic coordinates using an interactive **Leaflet + OpenStreetMap** coordinate selector or GPS device location.
   - Upload photographic evidence (validated for image MIME types and 5MB size limit).
   - Track reports live through personal dashboard and visual lifecycle timelines.

2. **Emergency Responders (Mountain Rescue / SDRF / Quick Response Teams)**:
   - Dedicated responder command hub displaying assigned operations and critical hotspots.
   - Update on-ground operational status (`in_progress` -> `resolved`).
   - Log clearance notes, heavy machinery deployed (e.g., JCB excavators, hydraulic splitters), and road opening timings.

3. **Disaster Control Administrators**:
   - Global disaster command dashboard displaying real-time aggregation metrics.
   - Verify incoming citizen reports and adjust hazard severity (`low`, `medium`, `high`, `critical`).
   - Assign/reassign certified responder units to incidents.
   - Manage user roles and promote field personnel.
   - Reject unverified or spam submissions.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React 18
  - Vite
  - JavaScript (ES Modules)
  - Tailwind CSS (Custom emergency severity palette)
  - React Router v6
  - Axios (with Bearer token request and 401 response interceptors)
  - Leaflet & React-Leaflet
  - OpenStreetMap Tiles
  - Lucide React (Icons)
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB & Mongoose
  - JWT (JSON Web Tokens)
  - bcryptjs
  - Helmet (HTTP security headers)
  - CORS
  - express-rate-limit (Brute-force and DDoS protection)
  - express-validator (Input validation)
  - Multer (Modular storage service with local disk serving & S3 pluggable interface)
  - Jest & Supertest (Automated test suites)

---

## 📂 Project Structure

```
hillresq/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute guard
│   │   │   ├── common/         # Button, Input, Select, Modal, Card, Badge, Alert, Loading
│   │   │   ├── incident/       # IncidentCard, IncidentTable
│   │   │   ├── layout/         # Navbar, Sidebar, Footer
│   │   │   └── map/            # IncidentMap, LocationPicker
│   │   ├── context/            # AuthContext & useAuth
│   │   ├── pages/              # Home, Login, Register, Dashboard, Report, Incidents, Map, etc.
│   │   ├── services/           # api, authService, incidentService, userService
│   │   └── utils/
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # auth, incident, user, upload controllers
│   │   ├── middleware/         # auth (protect, authorize), error, rateLimiter, validator, upload
│   │   ├── models/             # User, Incident schemas
│   │   ├── routes/             # authRoutes, incidentRoutes, userRoutes, uploadRoutes
│   │   ├── services/           # Modular storageService (local / S3 pluggable)
│   │   ├── utils/              # jwt helper, database seed script (seed.js)
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server entrypoint
│   ├── tests/                  # auth.test.js, incidents.test.js
│   ├── .env                    # Local environment configuration
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on port `27017` or via Docker:
  ```bash
  docker run -d --name hillresq-mongo -p 27017:27017 mongo:7.0
  ```

### 2. Environment Setup
Copy the example environment configuration into the backend directory:
```bash
cp .env.example backend/.env
```

Ensure `backend/.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hillresq
JWT_SECRET=hillresq_super_secure_jwt_token_secret_key_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_STORAGE_TYPE=local
UPLOAD_DIR=src/uploads
MAX_FILE_SIZE_BYTES=5242880
```

### 3. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Seed Demo Data
Populate the database with realistic hilly emergency incidents and demo accounts:
```bash
cd backend
npm run seed
```

#### Demo Test Accounts:
- **Admin:** `admin@hillresq.org` | Password: `admin123`
- **Responder:** `responder@hillresq.org` | Password: `responder123`
- **Citizen:** `citizen@hillresq.org` | Password: `citizen123`

*(You can also use the one-click demo login buttons directly on the `/login` screen).*

### 5. Running the Application
In separate terminal tabs:

**Start Backend:**
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
# Health check at http://localhost:5000/api/health
```

**Start Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🧪 Automated Testing

Execute the comprehensive backend test suite covering authentication, authorization middleware, input validation, and full incident lifecycle transitions:

```bash
cd backend
npm test
```

All 16 unit and integration test assertions pass covering:
- Citizen registration & duplicate prevention
- Password hashing & login with JWT signing
- Token verification & 401 unauthorized handling
- Citizen emergency report dispatch
- Filter by status, severity, and incident type
- Role authorization (Responder updates assigned incidents only; Admin verification & deletion)

---

## 🔒 Security Highlights

- **Passwords:** Hashed with `bcryptjs` salt rounds before database persistence.
- **Authorization:** Multi-tier role verification (`citizen`, `responder`, `admin`) enforced strictly on backend controllers.
- **Rate Limiting:** `express-rate-limit` guards against brute-force logins (30 req / 15m) and DDoS.
- **Headers:** `helmet` sets secure HTTP headers.
- **Validation:** `express-validator` validates coordinates range, text lengths, and required fields.
- **Image Upload:** Validated for MIME types (`image/jpeg`, `image/png`, `image/webp`) and capped at 5MB.
