# 📚 BookShelf — Book Management System

A full-stack Book Management System built with **FastAPI**, **Next.js 14**, **MongoDB**, and **JWT Authentication**.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Motor (async MongoDB) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | MongoDB |
| Auth | JWT (python-jose + bcrypt) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Notifications | react-hot-toast |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & setup environment

```bash
git clone <your-repo-url>
cd book-management-system
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and a strong JWT_SECRET_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

API will be available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL if your backend runs on a different port

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 🐳 Docker Setup (Optional)

```bash
# From project root
docker-compose up --build
```

This starts MongoDB, backend, and frontend together.

---

## 🔐 Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/auth/profile` | GET | Get current user profile |

**JWT Token**: 1 day expiry. Sent as `Authorization: Bearer <token>`.

**Roles**: `admin`, `user`

---

## 📖 Book API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/books` | GET | ✅ | List books (paginated, searchable) |
| `/api/books` | POST | ✅ | Create a book |
| `/api/books/:id` | GET | ✅ | Get book by ID |
| `/api/books/:id` | PUT | ✅ | Update book |
| `/api/books/:id` | DELETE | ✅ | Delete book |
| `/api/books/categories` | GET | ✅ | Get all categories |

### Query Parameters (GET /api/books)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 10 | Items per page (max 100) |
| `search` | string | - | Search by title (case-insensitive) |
| `category` | string | - | Filter by category |
| `sort_by` | string | created_at | `price`, `published_date`, `created_at` |
| `sort_order` | string | desc | `asc` or `desc` |

---

## 📁 Project Structure

```
book-management-system/
├── backend/
│   ├── app/
│   │   ├── core/         # Config & security (JWT, bcrypt)
│   │   ├── db/           # MongoDB connection (Motor async)
│   │   ├── routers/      # Auth & Books API routes
│   │   └── schemas/      # Pydantic validation models
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── auth/     # Login & Register
│   │   │   ├── dashboard/
│   │   │   └── books/    # List, Detail, Add, Edit
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Auth context & hook
│   │   ├── lib/          # API client, auth & books services
│   │   └── types/        # TypeScript interfaces
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ✨ Features

- **JWT Auth**: Register, Login, Protected routes, Auto-redirect on 401
- **CRUD**: Create, Read, Update, Delete books
- **Pagination**: Server-side with page controls
- **Search**: Real-time search by title
- **Filter**: By category
- **Sort**: By price, published date, or creation date
- **Validation**: Pydantic on backend, Zod on frontend
- **Async**: All MongoDB queries use Motor (async driver)
- **Responsive**: Mobile-friendly layout with Tailwind CSS
- **Toast Notifications**: Success/error feedback on all actions
- **Loading States**: Skeleton loaders on all async pages
- **Role System**: `admin` and `user` roles (RBAC ready)

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v
```
