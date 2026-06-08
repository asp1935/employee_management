# API Curl Documentation

Base URL: `http://localhost:8000` (or the port defined in your `.env`)

## Health Check

### Health Check
```bash
curl -X GET http://localhost:8000/api/healthcheck
```

---

## Authentication APIs

### User Signup
Requires `multipart/form-data`.
- **Note**: 
  - Admin role requires `adminAccessKey`.
  - Manager role requires email ending with `@company.com`.
  - Employee role requires `profilePhoto`.

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "role=employee" \
  -F "profilePhoto=@/path/to/photo.jpg"
```

### User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Refresh Token
Requires `refreshToken` cookie.
```bash
curl -X POST http://localhost:8000/api/auth/refresh-token \
  -b "refreshToken=<YOUR_REFRESH_TOKEN>"
```

### Logout
Requires `refreshToken` cookie.
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b "refreshToken=<YOUR_REFRESH_TOKEN>"
```

---

## User Management APIs (Admin Only)
All these routes require a valid Access Token (JWT) in the Authorization header.

### Get Current User
```bash
curl -X GET http://localhost:8000/api/users/current \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### Get All Users
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### Update User Role
```bash
curl -X PATCH http://localhost:8000/api/users/<USER_ID>/role \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager"
  }'
```

### Update User Status
```bash
curl -X PATCH http://localhost:8000/api/users/<USER_ID>/status \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

### Delete User (Soft Delete)
```bash
curl -X DELETE http://localhost:8000/api/users/<USER_ID> \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## Task Management APIs
All these routes require a valid Access Token (JWT) in the Authorization header.

### Create Task (Manager/Admin Only)
Creates a task and assigns it to an employee.
- **Valid Statuses**: `PENDING`, `INPROGRESS`, `TESTING`, `DONE` (defaults to `PENDING`).

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Q2 Project Report",
    "description": "Analyze Q2 performance data and write the final summary report.",
    "assignedTo": "<EMPLOYEE_USER_ID>"
  }'
```

### Get All Tasks (With optional filters)
- For Managers/Admins: Retrieves all tasks. Filters: `status` (e.g. `INPROGRESS`), `assignedTo` (employee ID).
- For Employees: Retrieves tasks assigned to the caller. Filters: `status`.

```bash
curl -X GET "http://localhost:8000/api/tasks?status=INPROGRESS&assignedTo=<EMPLOYEE_USER_ID>" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### Update Task Status
Updates the task's status. Must be updated by the assigned Employee, Manager, or Admin.
- **Valid Statuses**: `PENDING`, `INPROGRESS`, `TESTING`, `DONE`

```bash
curl -X PATCH http://localhost:8000/api/tasks/<TASK_ID>/status \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INPROGRESS"
  }'
```

### Add Task Comment
Adds a text comment to the task. Accessible to the assigned Employee, the Assigner Manager, or Admin.

```bash
curl -X POST http://localhost:8000/api/tasks/<TASK_ID>/comments \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Started working on the performance charts today."
  }'
```
