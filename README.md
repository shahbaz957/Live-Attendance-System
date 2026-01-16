# 📚 Live Attendance System

A real-time classroom attendance management system built with Node.js, Express, MongoDB, and WebSockets. This system enables teachers to conduct live attendance sessions where students can view their status in real-time, with all data persisted to a database.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

## 🎯 Features

### Authentication & Authorization
- **JWT-based authentication** with role-based access control (Teacher/Student)
- Secure password hashing using bcrypt
- Protected routes with middleware authentication

### Class Management
- Teachers can create and manage classes
- Add/remove students from classes
- View class details with populated student information

### Real-Time Attendance
- **WebSocket-powered live attendance sessions**
- Instant updates across all connected clients
- Teachers can mark attendance in real-time
- Students can check their status live
- Live summary statistics (present/absent/total)

### Data Persistence
- All attendance records saved to MongoDB
- Historical attendance queries
- Automatic absent marking for unmarked students

---

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Teacher   │         │   Student   │         │   Student   │
│   Client    │         │   Client    │         │   Client    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │   WebSocket           │   WebSocket           │   WebSocket
       │   Connection          │   Connection          │   Connection
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   WebSocket Server  │
                    │   (Event Handlers)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Express Server    │
                    │   (REST API)        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MongoDB Database  │
                    │   (Users, Classes,  │
                    │    Attendance)      │
                    └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **TypeScript** | Type-safe development |
| **Express.js** | RESTful API framework |
| **MongoDB** | NoSQL database for data persistence |
| **Mongoose** | MongoDB object modeling |
| **WebSocket (ws)** | Real-time bidirectional communication |
| **JWT** | Secure authentication tokens |
| **bcrypt** | Password hashing |
| **Zod** | Runtime schema validation |

---

## 📁 Project Structure

```
src/
├── config/
│   └── db.ts                 # MongoDB connection configuration
├── middleware/
│   └── auth.ts               # JWT authentication middleware
├── models/
│   ├── User.ts               # User schema (Teacher/Student)
│   ├── Class.ts              # Class schema
│   └── Attendance.ts         # Attendance record schema
├── routes/
│   ├── auth.ts               # Authentication endpoints
│   ├── class.ts              # Class management endpoints
│   ├── student.ts            # Student listing endpoint
│   └── attendance.ts         # Attendance-related endpoints
├── types/
│   ├── index.ts              # Common type definitions
│   └── websocket.ts          # WebSocket event types
├── utils/
│   └── response.ts           # Standardized API response helpers
├── websocket/
│   └── handler.ts            # WebSocket connection & event handlers
└── server.ts                 # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shahbaz957/Live-Attendance-System.git
   cd live-attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/attendance
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string
   ```

5. **Run the application**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

The server will start on `http://localhost:3000`

---

## 📡 API Documentation

### Authentication

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: <JWT_TOKEN>
```

### Class Management

#### Create Class
```http
POST /class
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "className": "Mathematics 101"
}
```

#### Add Student to Class
```http
POST /class/:classId/add-student
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439011"
}
```

#### Get Class Details
```http
GET /class/:classId
Authorization: <JWT_TOKEN>
```

### Attendance

#### Start Attendance Session
```http
POST /attendance/start
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "classId": "507f1f77bcf86cd799439011"
}
```

#### Get Student's Attendance
```http
GET /class/:classId/my-attendance
Authorization: <JWT_TOKEN>
```

---

## 🔌 WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=<JWT_TOKEN>');
```

### Events

#### 1. Mark Attendance (Teacher only)
**Client → Server:**
```json
{
  "event": "ATTENDANCE_MARKED",
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "status": "present"
  }
}
```

**Server → All Clients (Broadcast):**
```json
{
  "event": "ATTENDANCE_MARKED",
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "status": "present"
  }
}
```

#### 2. Get Today's Summary (Teacher only)
**Client → Server:**
```json
{
  "event": "TODAY_SUMMARY"
}
```

**Server → All Clients (Broadcast):**
```json
{
  "event": "TODAY_SUMMARY",
  "data": {
    "present": 18,
    "absent": 4,
    "total": 22
  }
}
```

#### 3. Check My Attendance (Student only)
**Client → Server:**
```json
{
  "event": "MY_ATTENDANCE"
}
```

**Server → Requesting Client:**
```json
{
  "event": "MY_ATTENDANCE",
  "data": {
    "status": "present"
  }
}
```

#### 4. End Session & Persist (Teacher only)
**Client → Server:**
```json
{
  "event": "DONE"
}
```

**Server → All Clients (Broadcast):**
```json
{
  "event": "DONE",
  "data": {
    "message": "Attendance persisted",
    "present": 18,
    "absent": 4,
    "total": 22
  }
}
```

---

## 🧪 Testing

### Using Postman/Hoppscotch

1. **Import the API collection** (if provided)
2. **Test authentication flow:**
   - Create teacher account
   - Create student accounts
   - Login and save JWT tokens

3. **Test class management:**
   - Create class
   - Add students
   - Verify class details

### WebSocket Testing

**Browser Console:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    event: 'MY_ATTENDANCE'
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

**Using websocat (CLI):**
```bash
websocat "ws://localhost:3000/ws?token=YOUR_JWT_TOKEN"
```

---

## 🔐 Security Features

- **Password Hashing:** All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication:** Stateless authentication with secure token verification
- **Role-Based Access Control:** Separate permissions for teachers and students
- **Request Validation:** Input validation using Zod schemas
- **WebSocket Authentication:** Token-based WS connection authorization

---

## 📊 Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string,  // bcrypt hashed
  role: "teacher" | "student"
}
```

### Class Collection
```typescript
{
  _id: ObjectId,
  className: string,
  teacherId: ObjectId,
  studentIds: ObjectId[]
}
```

### Attendance Collection
```typescript
{
  _id: ObjectId,
  classId: ObjectId,
  studentId: ObjectId,
  status: "present" | "absent"
}
```

---

## 👨‍💻 Author

**Mirza Shahbaz Ali Baig**
- GitHub: [shahbaz957](https://github.com/shahbaz957)
- LinkedIn: [Mirza Shahbaz Ali Baig](https://www.linkedin.com/in/mirza-shahbaz-ali-baig-3391b3248/)
- Email: mirzashahbazbaig724@gmail.com

---

## 🙏 Acknowledgments

- Inspired by real-world classroom management needs
- Built as a learning project to demonstrate full-stack development skills
- Thanks to the open-source community for excellent libraries and tools

---

**⭐ If you found this project helpful, please consider giving it a star!**
