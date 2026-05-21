# GigFlow — Smart Leads Dashboard

> Full Stack Internship Assignment — ServiceHive
> Built by Sahil Arate

A production-grade Lead Management Dashboard built with Next.js, Express.js, MongoDB, and Groq AI. Designed to help sales teams track, manage, and analyze their leads pipeline with AI-powered insights.

---

## Live Demo

| | Link |
|--|------|
| 🌐 Frontend | https://gigflow-leads-dashboard-tawny.vercel.app |
| ⚙️ Backend API | https://gigflow-api-wkj8.onrender.com/health |
| 🎥 Demo Video | https://www.loom.com/share/4ab7557aab9844928e2e887c610b4a48 |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gigflow.com | Admin1234 |
| Sales | sales@gigflow.com | Sales1234 |

> Note — Backend is on Render free tier. First request after inactivity may take 30-60 seconds to wake up.

---

## Assignment Requirements Checklist

| Requirement | Status |
|-------------|--------|
| React.js + TypeScript | ✅ Next.js + TypeScript |
| TailwindCSS | ✅ |
| Node.js + Express + TypeScript | ✅ |
| MongoDB + Mongoose | ✅ MongoDB Atlas |
| JWT Authentication | ✅ |
| User Register / Login | ✅ |
| Protected Routes | ✅ |
| bcrypt Password Hashing | ✅ |
| Auth Middleware | ✅ |
| Role-Based Access Control | ✅ Admin / Sales |
| Leads CRUD | ✅ |
| Filter by Status | ✅ |
| Filter by Source | ✅ |
| Search by Name / Email | ✅ |
| Debounced Search | ✅ 500ms debounce |
| Sort Latest / Oldest | ✅ |
| Multiple filters combined | ✅ |
| Backend Pagination | ✅ 10 per page |
| Pagination metadata | ✅ |
| Responsive Design | ✅ |
| Reusable Components | ✅ |
| Loading States | ✅ Skeletons |
| Empty States | ✅ |
| Error Handling UI | ✅ |
| Form Validation | ✅ Zod + React Hook Form |
| RESTful API | ✅ |
| Proper Status Codes | ✅ |
| Centralized Error Handling | ✅ |
| CSV Export | ✅ |
| Docker Setup | ✅ docker-compose.yml |
| README + Docs | ✅ |
| .env.example | ✅ |
| Deployment | ✅ Vercel + Render |

### Bonus Features
| Feature | Status |
|---------|--------|
| Groq AI Lead Analysis | ✅ |
| AI Pipeline Insights | ✅ |
| AI Bulk Analysis | ✅ |
| Lead Activity Timeline | ✅ |
| Visual Analytics Charts | ✅ |
| Dark Mode UI | ✅ |

---

## Features

### Authentication
- JWT-based register and login
- bcrypt password hashing with salt rounds 12
- Auth middleware on all protected routes
- Token stored in localStorage with automatic injection via Axios interceptors
- Auto redirect to login on 401

### Leads Management
- Create, read, update, delete leads
- Fields — Name, Email, Status, Source, Notes, Created At
- Status — New, Contacted, Qualified, Lost
- Source — Website, Instagram, Referral
- Lead detail view with full information

### Advanced Filtering
- Filter by Status
- Filter by Source
- Search by Name or Email (debounced 500ms)
- Sort by Latest or Oldest
- All filters work simultaneously
- Filter state persists during pagination

### Pagination
- Backend pagination using skip and limit
- 10 records per page
- Metadata — total, page, limit, totalPages, hasNextPage, hasPrevPage

### Role-Based Access Control
| Feature | Admin | Sales |
|---------|-------|-------|
| View leads | ✅ | ✅ |
| Create lead | ✅ | ✅ |
| Edit lead | ✅ | ✅ |
| Delete lead | ✅ | ❌ |
| View all users | ✅ | ❌ |
| Export CSV | ✅ | ✅ |
| AI features | ✅ | ✅ |

### AI Features (Groq API — llama-3.3-70b-versatile)
- **Lead Analysis** — Score out of 10, 2-sentence summary, suggested next action
- **Pipeline Insights** — Dashboard level AI recommendation based on stats
- **Bulk Analysis** — Select up to 5 leads and analyze all at once

### Advanced Features
- **Lead Activity Timeline** — Every status change and field update is automatically logged with timestamp and user name
- **Visual Analytics** — Pie chart by status, Bar chart by source using Recharts
- **CSV Export** — Downloads leads with active filters applied
- **Loading Skeletons** — Professional skeleton loaders instead of spinners
- **Empty States** — Meaningful empty state messages throughout

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | React framework with App Router |
| TypeScript | 5 | Type safety |
| TailwindCSS | 4 | Styling |
| TanStack Query | 5 | Server state management |
| React Hook Form | 7 | Form handling |
| Zod | 3 | Validation |
| Recharts | 2 | Data visualization |
| Axios | 1 | HTTP client |
| Lucide React | — | Icons |
| React Hot Toast | — | Notifications |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20 | Runtime |
| Express.js | 4 | Web framework |
| TypeScript | 5 | Type safety |
| MongoDB | — | Database |
| Mongoose | 8 | ODM |
| JWT | — | Authentication |
| bcryptjs | — | Password hashing |
| Zod | 3 | Request validation |
| Groq SDK | — | AI integration |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Containerization |
| MongoDB Atlas | Cloud database |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## Project Structure

gigflow-leads-dashboard/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Register page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Main dashboard
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── globals.css          # Global styles
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Modal, Badge, Select, Skeleton
│   │   │   ├── dashboard/           # StatsCards, FilterBar, Charts
│   │   │   ├── leads/               # LeadsTable, LeadForm, LeadDetail, Pagination
│   │   │   ├── ai/                  # AIInsightCard, AILeadAnalysis
│   │   │   ├── layout/              # Navbar
│   │   │   └── Providers.tsx        # QueryClient + Auth + Toast providers
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── hooks/
│   │   │   ├── useLeads.ts          # Leads queries and mutations
│   │   │   └── useDebounce.ts       # Debounce hook
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance with interceptors
│   │   │   ├── auth.service.ts      # Auth API calls
│   │   │   ├── leads.service.ts     # Leads API calls
│   │   │   └── ai.service.ts        # AI API calls
│   │   ├── types/
│   │   │   └── index.ts             # All TypeScript interfaces and enums
│   │   └── lib/
│   │       ├── utils.ts             # Helper functions
│   │       └── queryClient.ts       # TanStack Query client config
│   ├── .env.example
│   └── next.config.ts
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.model.ts    # User mongoose model
│   │   │   │   ├── auth.schema.ts   # Zod validation schemas
│   │   │   │   ├── auth.service.ts  # Business logic
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── leads/
│   │   │   │   ├── leads.model.ts   # Lead mongoose model
│   │   │   │   ├── activity.model.ts # Activity timeline model
│   │   │   │   ├── leads.schema.ts  # Zod validation schemas
│   │   │   │   ├── leads.service.ts # Business logic
│   │   │   │   ├── leads.controller.ts
│   │   │   │   └── leads.routes.ts
│   │   │   └── ai/
│   │   │       ├── ai.service.ts    # Groq AI integration
│   │   │       ├── ai.controller.ts
│   │   │       └── ai.routes.ts
│   │   ├── config/
│   │   │   ├── db.ts                # MongoDB connection
│   │   │   └── env.ts               # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── role.middleware.ts   # Role-based access
│   │   │   ├── validate.middleware.ts # Request validation
│   │   │   ├── error.middleware.ts  # Centralized error handling
│   │   │   └── index.ts             # Barrel export
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   └── utils/
│   │       ├── response.ts          # Standardized API responses
│   │       ├── asyncHandler.ts      # Async error wrapper
│   │       └── seed.ts              # Database seeder
│   ├── .env.example
│   ├── Dockerfile
│   └── tsconfig.json
│
├── docker-compose.yml
├── .gitignore
└── README.md


---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account — [cloud.mongodb.com](https://cloud.mongodb.com)
- Groq API key — [console.groq.com](https://console.groq.com)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/SahilArate/gigflow-leads-dashboard.git
cd gigflow-leads-dashboard
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
npm run seed
```

Creates the following test data:
- Admin — `admin@gigflow.com` / `Admin1234`
- 12 sample leads across all statuses and sources

### 4. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

Verify at `http://localhost:5000/health`

### 5. Setup Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create `.env.local` inside `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Docker Setup

Run the entire application with a single command:

### 1. Create root `.env` file

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`

### 3. Stop

```bash
docker-compose down
```

---

## API Documentation

### Base URL

http://localhost:5000/api

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user profile | Required |
| GET | `/auth/users` | Get all users | Admin only |

#### POST /auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "sales"
}
```

#### POST /auth/login
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Auth Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "sales",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Leads Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leads` | Get leads with filters | Required |
| POST | `/leads` | Create lead | Required |
| GET | `/leads/stats` | Get pipeline stats | Required |
| GET | `/leads/charts` | Get chart data | Required |
| GET | `/leads/export` | Export CSV | Required |
| GET | `/leads/:id` | Get single lead | Required |
| PATCH | `/leads/:id` | Update lead | Required |
| DELETE | `/leads/:id` | Delete lead | Admin only |
| GET | `/leads/:id/activity` | Get lead activity | Required |

#### GET /leads — Query Parameters

| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| status | string | New, Contacted, Qualified, Lost | — |
| source | string | Website, Instagram, Referral | — |
| search | string | any string | — |
| sort | string | latest, oldest | latest |
| page | number | 1+ | 1 |
| limit | number | 1-100 | 10 |

#### Leads Response
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": {
    "leads": [
      {
        "_id": "64abc...",
        "name": "Rahul Sharma",
        "email": "rahul@example.com",
        "status": "New",
        "source": "Instagram",
        "notes": "Interested in premium plan",
        "createdBy": {
          "_id": "64xyz...",
          "name": "Admin User",
          "email": "admin@gigflow.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST /leads
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in premium plan"
}
```

### AI Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ai/lead/:id` | Analyze single lead | Required |
| GET | `/ai/insights` | Get pipeline insights | Required |
| POST | `/ai/bulk` | Bulk analyze leads | Required |

#### POST /ai/bulk
```json
{
  "leadIds": ["64abc...", "64def...", "64ghi..."]
}
```

#### AI Analysis Response
```json
{
  "success": true,
  "message": "AI analysis complete",
  "data": {
    "analysis": {
      "summary": "Rahul came from Instagram and shows strong buying intent based on his notes.",
      "score": 8,
      "suggestion": "Send a personalized follow-up within 24 hours with pricing details."
    }
  }
}
```

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 5000 |
| MONGODB_URI | MongoDB Atlas connection string | Yes | — |
| JWT_SECRET | Secret key for JWT signing | Yes | — |
| JWT_EXPIRES_IN | Token expiry duration | No | 7d |
| GROQ_API_KEY | Groq API key for AI features | Yes | — |
| CLIENT_URL | Frontend URL for CORS | No | http://localhost:3000 |

### Frontend (`client/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API base URL | Yes |

---

## Lead Status Flow
New → Contacted → Qualified → Lost
↘ (deal closed)

Every status change is automatically logged in the activity timeline with timestamp and the name of the user who made the change.

---

## Deployment

### Backend — Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. New → Web Service → Connect repository
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
4. Add all environment variables
5. Deploy

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Import repository
3. Configure:
   - Root Directory: `client`
4. Add environment variable:
NEXT_PUBLIC_API_URL=https://gigflow-api-wkj8.onrender.com/api
1. Deploy

---

## Git Commit Convention

This project follows conventional commits:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Configuration or setup |
| `refactor:` | Code restructure |
| `docs:` | Documentation update |

---

## Author

**Sahil Arate**
- GitHub: [@SahilArate](https://github.com/SahilArate)
- Email: sahilarate5@gmail.com

---

*Built for the ServiceHive Full Stack Development Internship Assignment — May 2026*