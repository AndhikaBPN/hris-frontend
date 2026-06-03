1. Add Leave Request
* request
```bash
postman request POST 'http://localhost:8000/api/leave' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA' \
  --form 'leave_date_from=2026-06-09' \
  --form 'leave_date_to=2026-06-10' \
  --form 'leave_type=annual' \
  --form 'reason=acara keluarga' \
  --form 'doctor_letter=@/path/to/file' \
  --auth-bearer-token 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA'
```

* response
```bash
{
    "success": true,
    "message": "Leave request submitted successfully",
    "data": {
        "id": 1
    }
}
```

2. Get List Leave History
* request
```bash
postman request 'http://localhost:8000/api/leave?leave_type=annual&status=pending&date_from=2025-01-01&date_to=2025-12-31&search=budi' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUsImVtYWlsIjoiZGhpa2FudXNhbnRhcmEwMEBnbWFpbC5jb20iLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE3ODA0MDU4NTYsImV4cCI6MTc4MDQwOTQ1Nn0.obygmDNfkBG4DhPwFw8MFk4kYJXMBzoqRYkC65ogX8Y' \
  --auth-bearer-token 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA'
```

* response
```bash
{
    "success": true,
    "message": "OK",
    "data": [
        {
            "id": 1,
            "user_id": 15,
            "leave_date_from": "2026-06-09",
            "leave_date_to": "2026-06-10",
            "leave_type": "annual",
            "reason": "acara keluarga",
            "doctor_letter": "",
            "status": "pending",
            "approved_by": null,
            "approved_at": null,
            "created_at": "2026-06-02 20:12:50",
            "updated_at": "2026-06-02 20:12:50",
            "user_name": "Dika",
            "team_id": 1,
            "team_name": "Alpha"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 10,
        "total_records": 1
    }
}
```

3. Get Leave Quota
* request
```bash
postman request 'http://localhost:8000/api/leave/quota' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUsImVtYWlsIjoiZGhpa2FudXNhbnRhcmEwMEBnbWFpbC5jb20iLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE3ODA0MDU4NTYsImV4cCI6MTc4MDQwOTQ1Nn0.obygmDNfkBG4DhPwFw8MFk4kYJXMBzoqRYkC65ogX8Y' \
  --auth-bearer-token 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA'
```

* response
```bash
{
    "success": true,
    "message": "User leave quota fetched successfully",
    "data": {
        "total_quota": 12,
        "total_used": 1,
        "remaining_quota": 11
    }
}
```

4. Approval Request
* request
```bash
postman request PUT 'http://localhost:8000/api/leave/1/approve' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUsImVtYWlsIjoiZGhpa2FudXNhbnRhcmEwMEBnbWFpbC5jb20iLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE3ODA0MDU4NTYsImV4cCI6MTc4MDQwOTQ1Nn0.obygmDNfkBG4DhPwFw8MFk4kYJXMBzoqRYkC65ogX8Y' \
  --auth-bearer-token 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA'
```

* response
```bash
{
    "success": true,
    "message": "Leave request approved successfully",
    "data": null
}
```

5. Reject Request
* request
```bash
postman request PUT 'http://localhost:8000/api/leave/1/reject' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUsImVtYWlsIjoiZGhpa2FudXNhbnRhcmEwMEBnbWFpbC5jb20iLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE3ODA0MDU4NTYsImV4cCI6MTc4MDQwOTQ1Nn0.obygmDNfkBG4DhPwFw8MFk4kYJXMBzoqRYkC65ogX8Y' \
  --auth-bearer-token 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NCwiZW1haWwiOiJockBocmlzLmNvbSIsInJvbGUiOiJocmRfbWFuYWdlciIsImlhdCI6MTc4MDQwNzQ1NCwiZXhwIjoxNzgwNDExMDU0fQ.wH_rSyhbNKgQtiS5pckyepSZwcIqB3YJVzPQBAAPCMA'
```

* response
```bash
{
    "success": true,
    "message": "Leave request rejected successfully",
    "data": null
}
```