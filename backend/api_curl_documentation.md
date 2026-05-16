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
