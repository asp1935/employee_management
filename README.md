# Employee Management Application

A standard application setup with separate **frontend** and **backend** folders.

---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router 
- Redux Toolkit
- Tailwind 

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt
- CORS
- Cookie Parser
- Multer
- Dotenv

---


### 1️⃣ Clone the repository

```bash
git clone https://github.com/asp1935/employee_management.git
cd employee-management
```

---

## 🔧 Backend Setup

```bash
cd backend
npm install
```

### Create `.env` file in `server/` as per .env.example

```env
PORT=3000
MONGODB_URI=
DB_NAME=emp_management
CORS_ORIGIN=http://localhost:5173



ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=2m

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=7d

ADMIN_ACCESS_KEY=
```

### Run backend server

```bash
npm run dev   
```

Backend will run on:
```
http://localhost:3000
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
```

### Environment variables 
Create `.env` in `frontend/`

```env
VITE_API_URL=http://localhost:3000/api
VITE_API_IMG_URL=http://localhost:3000
```

### Run frontend

```bash
npm run dev
```

Frontend will run on:
```
http://localhost:5173
```



## 🧪 Scripts

### Backend
```bash
npm run dev
npm start
```

### Frontend
```bash
npm run dev
npm run build
```

## 🔑 Demo Credentials

Use the following demo accounts to log in and test the application:

### 👑 Admin
- **Email:** admin@gmail.com  
- **Password:** 123456  

### 🧑‍💼 Manager
- **Email:** manager@company.com  
- **Password:** 123456  

### 👨‍💻 Employee
- **Email:** employee@gmail.com  
- **Password:** 123456 

## ✨ Author

**Akash Pawar**  


