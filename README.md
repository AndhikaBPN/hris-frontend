# HRIS Frontend

Static web frontend for HRIS Attendance System for Gaming House operations.
Built with HTML, CSS, and Vanilla JavaScript, communicating with a REST API backend.

## Overview

- Face recognition for biometric verification
- Geo-tagging for attendance location validation
- JWT authentication for login sessions
- Role-Based Access Control according to Gaming House structure
- Session-based attendance flow (no clock-out)

## Tech Stack

- HTML / CSS / Vanilla JavaScript
- Node.js (static file server only)
- Lucide Icons (CDN)
- Flatpickr (CDN, date pickers)
- face-api.js (CDN, face recognition)
- Backend: Native PHP REST API + MySQL

## File Structure

```text
.
├── index.html
├── server.js
├── .env                          # API URL config (not committed)
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   ├── attendance.css
│   │   └── ...
│   └── js/
│       ├── config.js
│       ├── api.js
│       ├── auth.js
│       ├── dashboard-shared.js
│       ├── sidebar.js
│       ├── fetch/               # API call functions
│       └── render/              # Data mapping functions
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── components/
│   ├── dashboard/
│   ├── attendance/
│   ├── employee/
│   ├── leave-request/
│   └── shift-management/
└── docs/
```

## How to Run

```bash
# 1. Clone the project
git clone https://github.com/AndhikaBPN/hris-frontend.git

# 2. Open the project folder
cd hris-frontend

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

Open browser at `http://localhost:3000`. Redirects automatically to login page.

## API Configuration

Create `.env` in the project root (not committed to git):

```env
URL_LOCAL=http://localhost:8000
```

`config.js` reads this file at runtime. Change `URL_LOCAL` if the backend host/port differs.
Do not store secrets in `.env` — it is accessible by the browser.

## Login Flow

1. User opens `index.html` or `pages/login.html`
2. User enters email and password
3. Frontend sends `POST /api/login`
4. On success: token saved to `localStorage` as `hris_token`, user data as `hris_user`
5. Redirected to `pages/dashboard.html` (routes to role-specific dashboard)

Expected response:

```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "role": "staff"
    }
  }
}
```

## System Roles

| Role | Access |
| --- | --- |
| `c_level` | All reports, user management, approves manager leave, attendance not required |
| `hrd_manager` | Manages users, shifts, reports, approves staff/team leader leave |
| `technical_manager` | Fixed shift, dashboard access, leave requires c_level approval |
| `team_leader` | Rotating shift, monitors team attendance |
| `staff` | Rotating shift, personal dashboard, attendance submission |

## Shift Schedule

Shift assignments are managed manually by HRD (input or import via shift management page).

Available shift types for staff and team leaders:

| Shift | Working Hours | Break |
| --- | --- | --- |
| Morning | 06:00 – 14:00 | 09:30 – 10:30 |
| Afternoon | 14:00 – 22:00 | 17:30 – 18:30 |
| Night | 22:00 – 06:00 | 01:30 – 02:30 |

Managers use fixed schedules:

| Role | Working Hours | Days |
| --- | --- | --- |
| HRD Manager | 10:00 – 18:00 | Monday – Friday |
| Technical Manager | 13:00 – 21:00 | Monday – Friday |

## Attendance Flow

No clock-out system. Each shift has two sessions:

1. **Session 1** — initial clock-in at shift start
2. **Session 2** — clock-in at start of second work session (after break)

Validation per session:

- Face recognition via `face-api.js` (Euclidean distance < 0.5)
- GPS geolocation via `navigator.geolocation` (within 50 meters of office)
- Lateness tolerance: 15 minutes per session

Validation failures are still recorded as `invalid` status — used for fraud audit, not submission blocking.

## Leave Flow

- Each employee gets 1 day of leave per month (annual quota)
- Staff and team leader leave requires HRD Manager approval
- HRD Manager and Technical Manager leave requires C-Level approval
- Sick leave must attach a doctor's letter (image or PDF, max 20MB)

Leave types: `annual`, `sick`, `permit`, `leave_of_absence`

## Reference Documents

- `docs/flow.md` — business rules and meeting notes
- `docs/hris.md` — initial technical specification
- `docs/hris_architecture_v2.md` — backend architecture reference
- `docs/leave_request_api_docs.md` — leave request API endpoints
