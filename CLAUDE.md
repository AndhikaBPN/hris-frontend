# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HRIS Frontend is a static HTML/CSS/Vanilla JavaScript web application for Gaming House employee attendance management. It communicates with a REST API backend for authentication, attendance tracking, leave management, and reporting.

**Key Characteristics:**
- No build tools, bundlers, or frameworks (React, Vue, etc.)
- Plain vanilla JavaScript with fetch API
- Served by a simple Node.js HTTP server
- Role-based access control (5 roles: c_level, hrd_manager, technical_manager, team_leader, staff)
- Client-side state managed via localStorage (tokens, user data)

## Running the Application

```bash
# Start the development server on localhost:3000
npm start
# OR
node server.js
```

Then open `http://localhost:3000/` in a browser. You will be redirected to the login page.

**No dependency installation needed** — the application uses CDN-based external libraries (Lucide icons, face-api.js).

## Project Structure

```
.
├── index.html                    # Entry point (redirects to login)
├── server.js                     # Node.js static server
├── .env                          # Configuration (API URL)
├── package.json                  # Minimal (only server.js)
├── assets/
│   ├── css/
│   │   ├── style.css            # Global & shared styles
│   │   ├── dashboard.css        # Dashboard pages
│   │   └── attendance.css       # Attendance pages
│   └── js/
│       ├── config.js            # Loads .env, provides getApiUrl()
│       ├── api.js               # Fetch wrapper with auth & error handling
│       ├── auth.js              # Login/logout logic
│       ├── dashboard-shared.js  # Shared dashboard utilities
│       ├── sidebar.js           # Navigation sidebar
│       ├── fetch/               # API fetch functions (return data only)
│       │   ├── team.js          # Team API calls
│       │   ├── attendance.js    # Attendance API calls
│       │   └── [feature].js     # Feature-specific API calls
│       └── render/              # Data mapping & rendering (return objects, not HTML)
│           ├── team.js          # Team data mapping functions
│           ├── attendance.js    # Attendance data mapping functions
│           └── [feature].js     # Feature-specific mapping functions
├── pages/
│   ├── login.html               # Public login page
│   ├── reset-access.html        # Password reset stub
│   ├── dashboard.html           # Dashboard router (redirects by role)
│   ├── components/
│   │   ├── navbar.html          # Header component
│   │   └── sidebar.html         # Navigation component
│   ├── dashboard/               # Role-specific dashboards
│   │   ├── dashboard-staff.html
│   │   ├── dashboard-teamlead.html
│   │   ├── dashboard-manager.html
│   │   └── dashboard-clevel.html
│   └── attendance/              # Attendance flow pages
│       ├── attendance-staff.html
│       ├── attendance-teamlead.html
│       └── attendance-manager.html
└── docs/
    ├── flow.md                  # Business rules & meeting notes
    ├── hris.md                  # Initial technical spec
    └── hris_architecture_v2.md  # Backend architecture (reference)
```

## Key Architectural Patterns

### Configuration & API Base URL

The `.env` file contains `URL_LOCAL=<backend-api-url>`. This is loaded by `assets/js/config.js`:

```javascript
// config.js fetches /.env and parses it
var config = await getConfigAsync();
```

All API calls use `getApiUrl(path)` to prepend the backend URL:

```javascript
// Usage in any page
var data = await apiRequest('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

**Do not hardcode API URLs** — always use `apiRequest()` and ensure `.env` is configured.

### Authentication & Token Management

- JWT token stored in `localStorage` as `hris_token`
- User data stored in `localStorage` as `hris_user`
- `api.js` automatically includes `Authorization: Bearer <token>` header
- 401 responses trigger logout and redirect to login page
- Each page should check token existence before rendering (guard pages)

### Separation of Concerns: Fetch & Render Pattern

**Standard Practice:** Separate business logic into three layers:

1. **Fetch Layer** (`assets/js/fetch/[feature].js`)
   - Contains all API call functions
   - Returns raw data objects `{ success, data, meta, error }`
   - No HTML generation or DOM manipulation
   - Examples: `fetchTeams()`, `fetchTeamLeaders()`, `createTeam()`

2. **Render Layer** (`assets/js/render/[feature].js`)
   - Contains data mapping & transformation functions
   - Returns data objects (arrays, objects) for rendering
   - No HTML generation — only data structures
   - Examples: `mapTeamData()`, `buildTeamRows()`

3. **Page Layer** (HTML `<script>` tag)
   - Imports both fetch and render modules
   - Calls fetch functions to get data
   - Calls render functions to map data
   - Handles DOM rendering with mapped data
   - Manages page state and event handlers

**Benefits:**
- Debug functions by inspecting data flow, not HTML strings
- Reuse fetch/render logic across multiple pages
- Easier to test data transformation separately
- Cleaner separation of API logic, data mapping, and UI rendering

**Example:**

```javascript
// fetch/team.js
async function fetchTeams(options) {
  var result = await apiRequest('/teams' + params);
  return { success: true, data: result.data || [] };
}

// render/team.js
function mapTeamData(teams) {
  return teams.map(t => ({ id: t.id, name: t.name, ... }));
}

function buildTeamRows(teamsData, canManage) {
  return teamsData.map(t => ({ id, href, name, ... })); // Returns object
}

// page HTML
<script src="../../assets/js/fetch/team.js"></script>
<script src="../../assets/js/render/team.js"></script>
<script>
async function loadTeams() {
  var res = await fetchTeams({ page: 1 });
  var mapped = mapTeamData(res.data);
  var rows = buildTeamRows(mapped, CAN_MANAGE);
  renderList(rows); // renderList loops through rows and generates HTML
}
</script>
```

### Page Structure

Each page follows this pattern:

1. **HTML structure** — navbar, sidebar (if authenticated), main content
2. **Script imports** — `config.js`, `api.js`, `fetch/[feature].js`, `render/[feature].js`
3. **Page logic** — initialization, event handlers, data fetching (in HTML `<script>` tag)
4. **localStorage checks** — verify token/user data exist before loading content

Example guard:

```javascript
// In page script
var user = JSON.parse(localStorage.getItem('hris_user'));
var token = localStorage.getItem('hris_token');
if (!token || !user) {
  window.location.replace('login.html');
}
```

### Role-Based Routing

The `pages/dashboard.html` router checks user role and redirects:

```javascript
var user = JSON.parse(localStorage.getItem('hris_user'));
var role = user?.role;
// Redirect to role-specific dashboard
// dashboard-staff.html, dashboard-teamlead.html, etc.
```

**Do not create generic dashboard pages** — always provide role-specific variants to match the backend RBAC structure.

### Styling Conventions

- Global styles in `assets/css/style.css`
- Page-specific styles in separate files (e.g., `dashboard.css`, `attendance.css`)
- No CSS preprocessor (plain CSS)
- Use standard CSS Grid/Flexbox for layout
- Lucide icons used via CDN (`<i class="lucide lucide-[icon-name]"></i>`)

## System Roles & Features

Reference `README.md` for complete role definitions. Key roles:

- **c_level** — All reports, user management, leave approval, no attendance requirement
- **hrd_manager** — Shift management, user management, leave approval for staff/team leaders
- **technical_manager** — Fixed shift, dashboard access, requires c_level approval for leave
- **team_leader** — Rotating shift, team attendance monitoring dashboard
- **staff** — Rotating shift, personal dashboard, attendance submission

## Shift & Attendance System

### Shift Rotation (Staff & Team Leaders)

Pattern: 2 days morning → 2 days afternoon → 2 days night → 2 days off (repeating)

Shift hours:
- **Morning:** 06:00 - 14:00 (break 09:30 - 10:30)
- **Afternoon:** 14:00 - 22:00 (break 17:30 - 18:30)
- **Night:** 22:00 - 06:00 (break 01:30 - 02:30)

Managers have fixed hours (HRD: 10:00 - 18:00, Technical: 13:00 - 21:00, Mon-Fri).

### Attendance Sessions

No clock-out system. Each shift has **two sessions**:

1. **Session 1:** Initial shift clock-in (must be within 15 min of shift start)
2. **Session 2:** Second work session clock-in (e.g., after break)

Validation:
- Face recognition using face-api.js (Euclidean distance < 0.5)
- GPS geolocation (within 50 meters of office)
- Late threshold: 15 minutes

**Failures do not block submission** — system logs them as `invalid` status in backend for fraud audit.

## Fetch/Render Module Pattern

All feature logic is organized into three layers:

### 1. Fetch Layer (`assets/js/fetch/[feature].js`)
Returns data objects from API calls.

```javascript
// fetch/attendance.js
async function fetchAttendance(filters) {
  var result = await apiRequest('/attendance?date_from=' + filters.date_from);
  return {
    success: result.success,
    data: extractListData(result),
    error: result.error
  };
}
```

### 2. Render Layer (`assets/js/render/[feature].js`)
Transforms raw data into render-ready objects. NO HTML generation.

```javascript
// render/attendance.js
function buildCalendarCells(year, month, recordsByDate) {
  return [...Array(daysInMonth).keys()].map(d => ({
    day: d + 1,
    dateStr: formatDate(year, month, d + 1),
    dotClass: getShiftDotClass(recordsByDate[...])
  }));
}
```

### 3. Page Layer (HTML `<script>` tag)
Orchestrates fetch + render. Handles DOM updates and user interaction.

```html
<script src="../../assets/js/fetch/attendance.js"></script>
<script src="../../assets/js/render/attendance.js"></script>
<script>
async function loadAttendance() {
  var res = await fetchAttendance({ date_from: '2026-05-01' });
  var cells = buildCalendarCells(year, month, res.data);
  
  // DOM rendering happens HERE
  var html = cells.map(cell => 
    '<div class="cal-cell ' + cell.dotClass + '">' + cell.day + '</div>'
  ).join('');
  document.getElementById('cal-body').innerHTML = html;
}
</script>
```

### Key Rules
1. **Fetch functions:** Return `{ success, data, error }` objects only
2. **Render functions:** Return data objects/arrays. Never generate HTML
3. **Page layer:** Imports fetch + render modules. Handles all DOM manipulation
4. **No HTML strings in JS:** All HTML generation happens in the page layer

### Benefits
- **Debuggable:** Inspect data flow separate from HTML generation
- **Testable:** Functions operate on data, not DOM
- **Reusable:** Share fetch/render logic across pages
- **Maintainable:** Clear separation of concerns

## Common Development Tasks

### Adding a New Page

1. Create HTML in `pages/` or `pages/[feature]/`
2. Create a corresponding `.js` file in `assets/js/` if complex logic needed
3. Import config, api, auth helpers at the top
4. Check authentication & role in JS before showing content
5. Add link in sidebar/navbar (update `pages/components/sidebar.html`)

### Fetching Data from API

**Standard Pattern:** Use `apiRequest()` with async/await. ALL API calls must follow this pattern.

```javascript
var result = await apiRequest('/api/dashboard/staff');
if (result.success) {
  var data = result.data;
  console.log('Data:', data);
} else {
  console.error('Error:', result.error);
  // Show user-friendly error message
}
```

**Return Structure:** `apiRequest()` always returns:
```javascript
{
  success: boolean,
  data: any,         // Response data from API (null if failed)
  error: string      // Error message (null if success)
}
```

**API call options (all optional):**
```javascript
var result = await apiRequest('/path', {
  method: 'POST',                    // Default: GET
  body: JSON.stringify({ key: val }), // Stringify before sending
  headers: { 'X-Custom': 'value' }    // Extra headers (merged with defaults)
});
```

**The function automatically handles:**
- Authorization header with JWT token
- Content-Type JSON
- 401 logout redirects
- Response parsing (JSON)
- Error extraction from response

**Never use `.then()` or callbacks** — always async/await for consistency.

### Submitting Forms

```javascript
// e.g., Leave request form
var form = document.querySelector('#leave-form');
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  var data = {
    leave_date: document.querySelector('#date').value,
    type: document.querySelector('#type').value,
    reason: document.querySelector('#reason').value
  };
  
  try {
    var result = await apiRequest('/api/leave', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    alert('Leave request submitted!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

### Styling a New Component

Create a new `.css` file in `assets/css/` and link it in the HTML:

```html
<link rel="stylesheet" href="../../assets/css/new-feature.css">
```

Avoid inline styles. Use CSS classes and follow existing naming conventions.

## Important Notes

### API Configuration

- Backend URL is configured in `.env`: `URL_LOCAL=http://localhost:3000`
- Never hardcode backend URLs in code
- `config.js` reads `.env` from the server's filesystem; this file **is publicly accessible** at `/.env`
- **Do not store secrets in `.env`** (API keys, passwords, etc.)

### External Libraries

- **Lucide Icons:** CDN-based, loaded in HTML via `<i class="lucide lucide-[icon-name]"></i>`
- **face-api.js:** For face recognition (referenced in attendance flow but implementation delegated to backend in current scope)
- No npm dependencies for frontend code

### localStorage Usage

Pages rely on `hris_token` and `hris_user` (JSON) for session state. If removing items for logout, ensure consistency:

```javascript
localStorage.removeItem('hris_token');
localStorage.removeItem('hris_user');
window.location.replace('login.html');
```

### Debugging

- No build step to debug — open browser DevTools directly
- Network tab shows API requests and responses
- Console logs are safe and visible immediately
- Check localStorage values in DevTools > Application > Local Storage

## References

- **Business Rules:** `docs/flow.md`
- **Initial Spec:** `docs/hris.md`
- **Backend Architecture:** `docs/hris_architecture_v2.md` (reference for understanding API contract)
- **API Endpoints:** Listed in backend architecture doc (Section 6)

## Common Pitfalls

1. **Forgetting role checks** — Always verify user role before showing role-specific pages or features
2. **Hardcoding URLs** — Use `getApiUrl()` function from config.js
3. **Ignoring 401s** — api.js handles this, but page-level guards are still needed at load time
4. **Mixing async/await** — Ensure promises are awaited in event handlers
5. **localStorage assumptions** — Always check if token/user exist before using; guard with redirects

