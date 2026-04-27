# HRIS Frontend

Static web frontend for HRIS Attendance System for Gaming House operations.
This project is built with HTML, CSS, and Vanilla JavaScript, communicating
with a local REST API backend.

## Overview

This HRIS system focuses on employee attendance with identity and
location validation:

- Face recognition for biometric verification.
- Geo-tagging for attendance location validation.
- JWT authentication for login sessions.
- Role-Based Access Control according to the Gaming House structure.
- Session-based attendance flow, instead of conventional clock-out.

The frontend currently provides a login page, a mock reset access flow, and a
simple dashboard page after a successful login. The login and reset access pages
are separated into their respective HTML files.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Desktop browser
- Lucide icon CDN
- Target backend: Native PHP REST API + MySQL

## File Structure

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       └── auth.js
├── pages/
│   ├── login.html
│   ├── reset-access.html
│   └── dashboard.html
├── docs/
│   ├── flow.md
│   ├── hris.md
│   └── hris_architecture_v2.md
└── README.md
```

## How to Run Frontend

As this project is a static frontend, no dependency installation is required.
Run a static server from the project root:

```bash
cd /Users/apple/Documents/kuliah/hris-frontend
python3 -m http.server 5500
```

Open browser:

```text
http://localhost:5500/index.html
```

`index.html` will automatically redirect to:

```text
pages/login.html
```

## API Configuration

Since this frontend is plain HTML/JS without a bundler, the `.env` is read by
`assets/js/config.js` through a request to `/.env` when the application runs on a
static server.

```js
var data = await apiRequest('/login', {
  method: 'POST',
  body: JSON.stringify({ email: email, password: password })
});
```

If the backend port or host changes, simply update the `URL_LOCAL` value in `.env`.
Do not store secrets in the frontend `.env` because this file is accessible by
the browser when the static server is running.

## Login Flow

1. User opens `index.html` or directly `pages/login.html`.
2. User enters email and password.
3. Frontend sends a request to `POST /api/login`.
4. If the response is successful and contains a token:
   - token is saved to `localStorage` as `hris_token`
   - user data is saved to `localStorage` as `hris_user`
   - user is redirected to `pages/dashboard.html`
5. If failed, an error message is displayed on the login page.

Expected response backend:

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

Business roles used in the Gaming House version:

- `c_level`: highest access, viewing reports and approving manager leave, attendance not mandatory.
- `hrd_manager`: managing users, shifts, reports, and approving staff/team leader leave.
- `technical_manager`: technical manager with fixed working hours and summary dashboard access.
- `team_leader`: follows shift rotation and monitors the team.
- `staff`: general role for talents/streamers and operational employees.

## Shift Flow

Staff and team leaders use automatic rotation:

```text
2 days morning shift -> 2 days afternoon shift -> 2 days night shift -> 2 days off
```

Shift details:

| Shift | Working Hours | Break Time |
| --- | --- | --- |
| Morning | 06:00 - 14:00 | 09:30 - 10:30 |
| Afternoon | 14:00 - 22:00 | 17:30 - 18:30 |
| Night | 22:00 - 06:00 | 01:30 - 02:30 |

Managers use a fixed schedule:

| Role | Working Hours | Working Days |
| --- | --- | --- |
| HRD Manager | 10:00 - 18:00 | Monday - Friday |
| Technical Manager | 13:00 - 21:00 | Monday - Friday |

## Attendance Flow

Gaming House attendance does not use clock-out. Each shift uses two sessions:

1. Session 1: initial shift attendance.
2. Session 2: attendance at the start of the second work/stream session.

Attendance validation:

- Face recognition using `face-api.js` on the client-side.
- Face embeddings compared using Euclidean Distance.
- Match if distance is less than `0.5`.
- Location validated with `navigator.geolocation`.
- Distance calculated using the Haversine Formula.
- Maximum valid radius of `50 meters`.
- Maximum lateness tolerance of `15 minutes` for each session.

Face or location failures still need to be recorded in the backend as an audit log
for fraud monitoring purposes.

## Leave Flow

Leave rules:

- Each employee gets 1 day of leave per month.
- Staff and team leaders require HRD Manager approval.
- HRD Manager and Technical Manager require C-Level approval.
- Sick leave must attach a doctor's note.

## Reference Documents

- `docs/flow.md`: meeting notes and Gaming House business rules.
- `docs/hris.md`: initial technical specification for HRIS attendance.
- `docs/hris_architecture_v2.md`: latest backend architecture and flow for Gaming House.

## Development Notes

- Do not use Laravel, React, or Python backends for this version scope.
- Frontend remains lightweight with HTML/CSS/Vanilla JS.
- Backend uses Native PHP, PDO, MySQL, and JWT.
- Face recognition uses pretrained models via `face-api.js`.
- No ML training on the backend.
- Use prepared statements on the backend for database access.
