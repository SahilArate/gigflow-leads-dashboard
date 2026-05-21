# GigFlow — Smart Leads Dashboard

A full-stack Lead Management Dashboard built with Next.js, Express.js, MongoDB, and Groq AI. Designed to help sales teams track, manage, and analyze their leads pipeline with AI-powered insights.

![GigFlow Dashboard](https://img.shields.io/badge/GigFlow-Smart%20Leads%20Dashboard-white?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

---

## Features

### Core
- JWT-based authentication with secure token handling
- Role-based access control — Admin and Sales User roles
- Full leads CRUD — Create, Read, Update, Delete
- Advanced filtering — Status, Source, Search, Sort
- Debounced search by name or email
- Backend pagination with metadata
- CSV export with active filters applied
- Responsive black and white UI

### AI-Powered (Groq API)
- AI lead analysis — Score, Summary, and Suggested Action per lead
- AI pipeline insights — Dashboard level recommendations
- AI bulk analysis — Analyze up to 5 leads simultaneously

### Advanced
- Lead activity timeline — Every status and field change logged
- Visual analytics — Pie chart by status, Bar chart by source
- Real-time stats cards — Total, New, Qualified, Lost counts
- Loading skeletons and empty states throughout
- Docker setup for containerized deployment

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 + TypeScript | React framework with App Router |
| TailwindCSS | Utility-first styling |
| TanStack Query | Server state management and caching |
| React Hook Form + Zod | Form handling and validation |
| Recharts | Data visualization |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express + TypeScript | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT + bcrypt | Authentication and password hashing |
| Zod | Request validation |
| Groq SDK | AI integration |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Containerization |
| MongoDB Atlas | Cloud database |
| Render | Backend deployment |
| Vercel | Frontend deployment |

---

## Project Structure