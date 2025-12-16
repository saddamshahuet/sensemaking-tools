# Sensemaker Application Architecture

This directory contains the unified full-stack application implementation based on the repository pattern layered architecture.

## Directory Structure

```
apps/
├── api/                    # NestJS Backend API Server
│   ├── src/
│   │   ├── auth/          # Authentication module (JWT, Passport)
│   │   ├── users/         # User management module
│   │   ├── projects/      # Project management module
│   │   ├── reports/       # Report management module
│   │   ├── upload/        # CSV upload handling
│   │   ├── jobs/          # Background job management
│   │   └── common/        # Shared services (Prisma, repositories)
│   └── prisma/            # Database schema and migrations
│
├── web/                   # Next.js Frontend Application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── hooks/        # React hooks
│
└── worker/               # Background Job Processor
    └── src/
        ├── processors/   # Job processing logic
        └── utils/        # Utility functions

packages/
├── types/                # Shared TypeScript types
├── core/                 # Core sensemaking library (existing library/)
└── visualizations/       # D3 visualization components
```

## Architecture Pattern

### Repository Pattern

The backend follows a clean repository pattern:

1. **Controllers** - Handle HTTP requests and responses
2. **Services** - Implement business logic
3. **Repositories** - Abstract data access layer

```
Client Request → Controller → Service → Repository → Database
```

### Data Flow

1. **Frontend** (Next.js) makes API calls to the backend
2. **API Server** (NestJS) processes requests and manages data
3. **Worker** processes background jobs (CSV analysis)
4. **PostgreSQL** stores all application data
5. **Redis** manages job queues and real-time updates

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# The services will be available at:
# - API: http://localhost:4000
# - Web: http://localhost:3000
# - API Docs: http://localhost:4000/api/docs
```

### Manual Setup

```bash
# Install dependencies
npm install

# Setup API
cd apps/api
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev

# Setup Web (in another terminal)
cd apps/web
npm run dev

# Setup Worker (in another terminal)
cd apps/worker
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `PUT /api/v1/users/me/password` - Change password

### Projects
- `GET /api/v1/projects` - List user projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Reports
- `GET /api/v1/reports/project/:projectId` - List reports for project
- `POST /api/v1/reports` - Create new report
- `GET /api/v1/reports/:id` - Get report details
- `POST /api/v1/reports/:id/process` - Start processing

### Uploads
- `POST /api/v1/uploads/:projectId` - Upload CSV file
- `GET /api/v1/uploads/project/:projectId` - List uploads

### Jobs
- `GET /api/v1/jobs/:id` - Get job status
- `GET /api/v1/jobs/:id/progress` - SSE progress stream

## Database Schema

The database uses PostgreSQL with Prisma ORM. Key entities:

- **User** - User accounts
- **Project** - Analysis projects
- **Report** - Generated reports
- **ProcessingJob** - Background job tracking
- **CsvUpload** - Uploaded file metadata
- **Topic** - Extracted topics (hierarchical)
- **Comment** - Analyzed comments
- **Collaborator** - Project sharing
- **ApiKey** - External API access

## Environment Variables

### API (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/sensemaker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=4000
```

### Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Testing

```bash
# API tests
cd apps/api
npm test

# Web tests
cd apps/web
npm test
```

## Security

- JWT-based authentication
- bcrypt password hashing (cost factor 12)
- Input validation with class-validator
- CORS configuration
- Rate limiting (planned)
- Row-level security in PostgreSQL (planned)

## Related Documentation

- [PLAN_AND_PRD.md](../PLAN_AND_PRD.md) - Full product requirements document
- [API Documentation](http://localhost:4000/api/docs) - Swagger/OpenAPI docs (when running)
