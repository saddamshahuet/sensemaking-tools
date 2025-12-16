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
│   │   ├── api-keys/      # API key management for external access
│   │   ├── collaborators/ # Project collaboration features
│   │   ├── realtime/      # SSE/Redis pub-sub for real-time updates
│   │   ├── export/        # PDF/JSON/HTML export
│   │   └── common/        # Shared services (Prisma, repositories)
│   └── prisma/            # Database schema and migrations
│
├── web/                   # Next.js Frontend Application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   │   ├── ui/       # Base UI components
│   │   │   └── visualizations/  # D3 visualization components
│   │   ├── lib/          # Utilities and API client
│   │   └── hooks/        # React hooks
│
└── worker/               # Background Job Processor
    └── src/
        ├── processors/   # Job processing logic (with sensemaking library integration)
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
3. **Worker** processes background jobs (CSV analysis with sensemaking library)
4. **PostgreSQL** stores all application data
5. **Redis** manages job queues and real-time updates via pub/sub

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

### API Keys
- `GET /api/v1/api-keys` - List API keys
- `POST /api/v1/api-keys` - Create new API key
- `POST /api/v1/api-keys/:id/revoke` - Revoke API key
- `DELETE /api/v1/api-keys/:id` - Delete API key

### Collaborators
- `GET /api/v1/collaborators/projects/:projectId` - List project collaborators
- `POST /api/v1/collaborators/projects/:projectId/invite` - Invite collaborator
- `GET /api/v1/collaborators/invitations` - Get pending invitations
- `POST /api/v1/collaborators/:id/accept` - Accept invitation
- `POST /api/v1/collaborators/:id/decline` - Decline invitation
- `PUT /api/v1/collaborators/:id/role` - Update collaborator role
- `DELETE /api/v1/collaborators/:id` - Remove collaborator

### Export
- `GET /api/v1/export/reports/:id/pdf` - Export report as PDF
- `GET /api/v1/export/reports/:id/json` - Export report as JSON
- `GET /api/v1/export/reports/:id/html` - Export report as HTML

### Real-time Updates
- `GET /api/v1/realtime/jobs/:jobId/progress` - SSE stream for job progress
- `GET /api/v1/realtime/jobs/all` - SSE stream for all job progress

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
- **AuditLog** - Activity tracking

## Features

### Worker Integration with Sensemaking Library
The worker now integrates with the core sensemaking library to:
- Parse CSV files into structured comments
- Learn topics from comments
- Categorize comments into topics
- Generate summaries with citations

### Real-time Updates
- Redis pub/sub for broadcasting job progress
- Server-Sent Events (SSE) for frontend consumption
- Automatic fallback to polling if Redis unavailable

### Collaboration
- Invite users by email
- Role-based access (VIEWER, EDITOR, ADMIN)
- Accept/decline invitations
- Owner can manage all collaborators

### Export
- PDF export with PDFKit
- JSON export for data interchange
- HTML export for web viewing

### Visualizations
- Topics Distribution Chart (D3 bar chart)
- Topics Overview Pie Chart (D3 pie chart)
- Alignment Chart (D3 scatter plot)

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
- API key authentication for external access
- File upload sanitization
- Rate limiting (planned)
- Row-level security in PostgreSQL (planned)

## Related Documentation

- [PLAN_AND_PRD.md](../PLAN_AND_PRD.md) - Full product requirements document
- [API Documentation](http://localhost:4000/api/docs) - Swagger/OpenAPI docs (when running)
