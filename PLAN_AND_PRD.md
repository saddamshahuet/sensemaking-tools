# Sensemaking Tools - Comprehensive Rearchitecture Plan & PRD

## Executive Summary

Transform the current CLI-based sensemaking-tools project (Google Jigsaw's open-source conversation analysis tool) into a modern, full-stack SaaS application with multi-tenant support, user management, real-time collaboration, and API access, while maintaining the proven core sensemaking functionality.

**Project**: Sensemaker by Jigsaw - AI-powered tool for analyzing large-scale online conversations using Google Gemini LLMs
**Current State**: CLI-based proof-of-concept with static HTML report generation
**Target State**: Production-ready SaaS platform with unified web interface and developer-friendly architecture
**Timeline**: 20-30 weeks (5-7 months) phased implementation

---

## Table of Contents

1. [Product Requirements Document (PRD)](#product-requirements-document-prd)
2. [Feature Comparison: Current vs. Proposed](#feature-comparison-current-vs-proposed)
3. [User Flow & Component Architecture](#user-flow--component-architecture)
4. [Current State Analysis](#current-state-analysis)
5. [Target Architecture](#target-architecture)
6. [Technology Stack](#technology-stack)
7. [Implementation Plan](#implementation-plan)
8. [Critical Implementation Notes](#critical-implementation-notes)
9. [Success Criteria](#success-criteria)

---

# Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Product Vision

**Sensemaker SaaS Platform** transforms community feedback at scale into actionable insights through AI-powered analysis. The platform enables civic organizations, researchers, and businesses to understand what people are talking about in large online conversations, identify areas of agreement/disagreement, and make data-driven decisions.

### 1.2 Problem Statement

**Current Pain Points:**
- Organizations receive thousands of community comments but lack tools to analyze them systematically
- Manual analysis is time-consuming, expensive, and prone to bias
- Existing tools (sentiment analysis, word clouds) provide shallow insights
- No way to identify nuanced topics, sub-topics, and group-level consensus
- Technical barrier: requires command-line expertise and manual CSV processing

**Who This Affects:**
- City governments conducting civic engagement (e.g., Bowling Green, KY case study)
- Academic researchers studying online discourse
- Product teams analyzing user feedback
- Community managers understanding member sentiment
- Policy makers gauging public opinion on complex issues

### 1.3 Product Goals

1. **Democratize Access**: Make advanced conversation analysis accessible to non-technical users through an intuitive web interface
2. **Enable Collaboration**: Allow teams to work together on analyzing conversations, sharing insights
3. **Provide Transparency**: Ground every AI-generated claim in source comments with full citation trails
4. **Scale Analysis**: Process conversations with 10,000+ comments in minutes, not days
5. **Ensure Reproducibility**: Store all analysis sessions, allow re-running with different parameters

### 1.4 Success Metrics

**Primary KPIs:**
- User Adoption: 500+ active users in first 6 months
- Engagement: 70% of users analyze >3 projects per month
- Processing Success Rate: 95% of uploaded CSVs process without errors
- User Satisfaction: NPS score >40

**Secondary KPIs:**
- API Usage: 100+ external integrations via API keys
- Collaboration: 40% of projects have >1 collaborator
- Average Report Views: 50+ views per generated report

## 2. User Personas & Use Cases

### 2.1 Primary Personas

**Persona 1: Civic Engagement Manager (e.g., Sarah)**
- **Background**: Works for city government, runs online forums for community input on urban planning
- **Pain Point**: Receives 2,000+ comments per consultation, can't read them all
- **Goal**: Identify key themes, understand neighborhood-specific concerns, report to city council
- **Technical Skill**: Basic (can use Google Docs, unfamiliar with command line)

**Persona 2: Academic Researcher (e.g., Dr. Patel)**
- **Background**: Sociology professor studying online political discourse
- **Pain Point**: Needs to categorize thousands of social media comments by topic for research paper
- **Goal**: Generate reproducible analysis, export data for statistical software, cite methodology
- **Technical Skill**: Intermediate (comfortable with R, Python, not DevOps)

**Persona 3: Product Manager (e.g., Alex)**
- **Background**: Manages SaaS product, runs beta programs with user feedback forums
- **Pain Point**: User feedback spreadsheet has 5,000 rows, can't manually tag by feature area
- **Goal**: Prioritize feature requests, identify pain points, share insights with engineering team
- **Technical Skill**: Intermediate (uses APIs, knows basic SQL)

**Persona 4: Data Analyst / Integrator (e.g., Jamie)**
- **Background**: Builds internal tools for organization, wants to embed Sensemaker into existing workflows
- **Pain Point**: Current CLI tool requires manual file management, can't automate
- **Goal**: Use API to submit CSVs from other systems, retrieve results programmatically
- **Technical Skill**: Advanced (full-stack developer)

### 2.2 Key Use Cases

**Use Case 1: Civic Consultation Analysis**
```
1. Sarah logs into Sensemaker platform
2. Creates new project: "Main Street Redesign Consultation"
3. Uploads CSV export from community forum (2,500 comments with votes)
4. System processes CSV in background, Sarah sees progress bar
5. 10 minutes later, receives notification: "Report ready"
6. Views interactive report: 8 main topics identified (Safety, Parking, Green Space, etc.)
7. Filters to "High Disagreement" topics to identify contentious issues
8. Shares report link with city council members (view-only access)
9. Exports PDF for inclusion in official report
```

**Use Case 2: Research Paper Data Collection**
```
1. Dr. Patel creates project: "Twitter Climate Change Discourse 2024"
2. Uploads CSV with 10,000 tweets (no vote data, just text)
3. Waits for processing (20 minutes)
4. Reviews auto-generated topics, notices "Renewable Energy" and "Carbon Tax" are merged
5. Re-runs analysis with custom topic seed: ["Mitigation", "Adaptation", "Policy", "Denial"]
6. Exports:
   - JSON with all categorized comments for R analysis
   - CSV with topic assignments for reproducibility
   - Citation-grounded summary for methods section
7. Invites research assistant as collaborator to review findings
```

**Use Case 3: Product Feedback Prioritization**
```
1. Alex creates project: "Q4 Beta Feedback"
2. Uploads CSV from Zendesk export (3,500 support tickets)
3. Reviews topics: "Login Issues", "Mobile App Crashes", "Feature Request: Dark Mode", etc.
4. Sees "Login Issues" has 400 mentions, highest consensus across all user groups
5. Creates Jira ticket, includes link to Sensemaker report as evidence
6. Shares project with engineering team lead (editor access) to add notes
7. Bookmarks project to compare with Q1 feedback next quarter
```

**Use Case 4: Automated Pipeline Integration**
```
1. Jamie generates API key in Sensemaker dashboard
2. Writes Python script that:
   - Fetches comments from internal MySQL database
   - Formats as CSV
   - POSTs to Sensemaker API: POST /api/v1/reports
   - Polls for completion: GET /api/v1/reports/{id}/status
   - Downloads JSON results when complete
3. Integrates into nightly cron job
4. Stores results in data warehouse for BI dashboards
5. Configures webhook to Slack when processing fails
```

## 3. Functional Requirements

### 3.1 Authentication & User Management

**FR-1: User Registration**
- Users can create account with email + password
- Email validation required (confirmation link)
- Password requirements: min 8 chars, 1 uppercase, 1 number
- Terms of Service acceptance required

**FR-2: User Login**
- Login with email + password
- "Remember me" checkbox (30-day session)
- "Forgot password" flow with email reset link
- Account lockout after 5 failed attempts (15min cooldown)

**FR-3: User Profile**
- View/edit: name, email, password
- View usage statistics: projects created, CSVs processed, total comments analyzed
- View API quota usage (requests per month, Vertex spend)

### 3.2 Project Management

**FR-4: Create Project**
- User provides: project name, description (optional), additional context for LLM
- Project is private by default (only creator can access)
- Projects belong to user (multi-tenancy: userId foreign key)

**FR-5: List Projects**
- Dashboard shows all projects user owns or has been invited to
- Sort by: created date, last modified, name
- Filter by: owned by me, shared with me
- Search by project name

**FR-6: View Project Details**
- Show: name, description, creation date, creator, collaborators
- List all CSV uploads and reports for this project
- Show storage usage (total CSV size, report count)

**FR-7: Edit/Delete Project**
- Owner can edit name, description
- Owner can delete project (soft delete with 30-day recovery)
- Deletion cascades to all reports and CSV uploads

### 3.3 CSV Upload & Validation

**FR-8: Upload CSV File**
- Drag-and-drop or file picker
- Max file size: 100MB (configurable)
- Max rows: 50,000 (configurable)
- Supported formats: .csv, .tsv

**FR-9: CSV Validation**
- Required columns: `comment-id`, `comment_text`
- Optional columns: vote tallies (`<group>-agree-count`, etc.), `topic`, `subtopic`
- Validation errors shown immediately (missing columns, wrong data types)
- Preview first 10 rows before upload

**FR-10: CSV Storage**
- Uploaded files stored in S3/GCS with encryption at rest
- Filename sanitization (remove special chars)
- Generate unique S3 key: `{tenantId}/{projectId}/{timestamp}-{filename}`

### 3.4 Processing & Job Queue

**FR-11: Start Processing Job**
- User clicks "Analyze" after upload
- System enqueues job with BullMQ
- Immediately returns job ID to user
- User sees "Processing..." status with estimated time

**FR-12: Job Progress Tracking**
- Real-time progress bar updates via Server-Sent Events
- Stages shown:
  1. Parsing CSV (5%)
  2. Learning topics (30%)
  3. Categorizing comments (60%)
  4. Generating summary (90%)
  5. Complete (100%)
- Token count displayed (e.g., "Processed 150K / 340K tokens")

**FR-13: Job Error Handling**
- Errors displayed with user-friendly messages:
  - "Vertex AI quota exceeded" → "Try again in 1 hour or upgrade plan"
  - "Content safety violation" → "Some comments were flagged by content filter"
  - "Invalid CSV format" → "Column 'comment-id' is missing"
- Failed jobs can be retried (keeps original CSV)
- Error logs stored for admin debugging

**FR-14: Job Cancellation**
- User can cancel in-progress job
- System gracefully stops worker process
- Partial results discarded

### 3.5 Report Viewing & Interaction

**FR-15: View Summary Report**
- Interactive web page with sections:
  - Overview (top-level summary)
  - Topics (accordion view, click to expand subtopics)
  - Alignment filter: Show all / High agreement / High disagreement
  - Full list of comments (paginated, 50 per page)
- Markdown rendering for formatted text
- Citation tooltips: hover over claim to see source comments

**FR-16: Visualizations**
- Topic Distribution Chart (horizontal bar chart showing comment counts per topic)
- Alignment Chart (scatter plot: agreement vs. disagreement by topic)
- Group Comparison (if group vote data present, show per-group breakdowns)
- All charts interactive (click to filter comments)

**FR-17: Search & Filter Comments**
- Full-text search across comment text
- Filter by:
  - Topic (multi-select)
  - Vote sentiment (agree/disagree/pass)
  - Group (if group data present)
  - Date range (if timestamps present)
- Filters persist in URL (shareable links)

**FR-18: Comment Details**
- Click comment to see:
  - Full text
  - Vote tallies (visual breakdown)
  - Assigned topics (linked to topic sections)
  - Metadata (comment ID, author ID if present)

**FR-19: Export Report**
- Export formats:
  - PDF (formatted report with charts)
  - HTML (standalone file, embeds CSS/JS)
  - JSON (raw data: summary + topics + comments)
  - CSV (comments with topic assignments)
- Export includes citation grounding

### 3.6 Collaboration

**FR-20: Invite Collaborators**
- Owner can invite users by email
- Roles:
  - Viewer: Can view reports, cannot edit or upload
  - Editor: Can upload CSVs, run analyses, view reports
  - Admin: Can invite collaborators, delete project
- Invitation sent via email with accept link
- Pending invitations shown in project settings

**FR-21: Activity Feed**
- Project page shows recent activity:
  - "Sarah uploaded feedback.csv"
  - "Alex started processing job"
  - "Jamie added you as a collaborator"
- Filterable by user and date

**FR-22: Comments & Annotations (Future)**
- Users can add notes to specific topics or comments
- Notes visible to all collaborators
- @mention collaborators for notifications

### 3.7 External API Access

**FR-23: Generate API Key**
- User can generate multiple API keys with names (e.g., "Production", "Dev")
- Keys displayed once, then hashed (bcrypt)
- Keys can be revoked individually
- Last-used timestamp shown

**FR-24: API Endpoints**
```
POST /api/v1/reports
  - Upload CSV and start processing
  - Body: multipart/form-data (file + projectId)
  - Returns: { reportId, jobId, status: "queued" }

GET /api/v1/reports/:reportId/status
  - Check processing status
  - Returns: { status: "running", progress: 65, stage: "categorizing" }

GET /api/v1/reports/:reportId/results
  - Fetch completed summary
  - Returns: Summary object (JSON)

GET /api/v1/reports/:reportId/comments
  - Fetch categorized comments
  - Pagination: ?page=1&limit=100
```

**FR-25: API Rate Limiting**
- 100 requests per hour per API key (configurable)
- 429 status code when exceeded
- Header: `X-RateLimit-Remaining: 87`

**FR-26: Webhook Notifications (Future)**
- User configures webhook URL in settings
- System POSTs to URL when:
  - Job completes successfully
  - Job fails with error
- Payload: `{ event: "job.completed", reportId, jobId }`

### 3.8 Admin & Monitoring

**FR-27: Admin Dashboard (Future)**
- View all users, projects, processing jobs
- Search users by email
- View system health: Redis queue length, DB connections
- Manually retry failed jobs

**FR-28: Audit Logging**
- All API actions logged: (userId, action, resource, timestamp, IP address)
- Logs searchable by admin
- Compliance: GDPR data export includes audit logs

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1: Processing Speed**
- 1,000 comments → complete in <10 minutes (p95)
- 10,000 comments → complete in <60 minutes (p95)
- Dashboard page load: <2 seconds (p95)
- Report page load: <3 seconds (p95)

**NFR-2: Concurrent Users**
- Support 100+ concurrent users
- Support 10+ simultaneous processing jobs

**NFR-3: Database Performance**
- Query response time: <200ms (p95)
- Full-text search across 100K comments: <1 second

### 4.2 Scalability

**NFR-4: Horizontal Scaling**
- Worker processes can scale independently (add more workers = faster processing)
- Stateless API server (can run multiple instances behind load balancer)
- Redis queue handles 1000+ jobs/minute

**NFR-5: Data Storage**
- Support projects with 100+ reports each
- Support 10GB+ total CSV storage per user
- PostgreSQL handles 1M+ comment records

### 4.3 Security

**NFR-6: Authentication Security**
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 24 hours
- HTTPS required for all API calls

**NFR-7: Data Isolation**
- Multi-tenant: users cannot access other users' projects
- PostgreSQL Row-Level Security enforces isolation
- S3 bucket permissions: users cannot download other users' CSVs

**NFR-8: API Security**
- API keys hashed (bcrypt)
- Rate limiting per key prevents abuse
- API keys can be revoked instantly

**NFR-9: Input Validation**
- CSV files scanned for malware (ClamAV)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)

### 4.4 Reliability

**NFR-10: Uptime**
- 99.5% uptime SLA (≈3.6 hours downtime/month)
- Database backups daily, retained 30 days
- Point-in-time recovery for last 7 days

**NFR-11: Job Reliability**
- Failed jobs automatically retry 3x with exponential backoff
- Jobs persist across worker restarts (queue in Redis)
- Dead letter queue for jobs that fail >3 times

### 4.5 Usability

**NFR-12: Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- Color contrast ratio >4.5:1

**NFR-13: Responsive Design**
- Mobile-first design (works on 375px width)
- Touch-friendly tap targets (44x44px min)
- Tablet-optimized layout

**NFR-14: Browser Support**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Progressive enhancement (works without JavaScript for core features)

### 4.6 Maintainability

**NFR-15: Code Quality**
- TypeScript throughout (frontend + backend)
- 80%+ test coverage (unit + integration tests)
- ESLint + Prettier for consistent style
- No unused dependencies (depcheck in CI)

**NFR-16: Documentation**
- API documentation (OpenAPI/Swagger)
- Developer setup guide (README.md)
- Architecture docs (this PRD + diagrams)
- Inline code comments for complex logic

---

# Feature Comparison: Current vs. Proposed

## Current System Features (CLI-based)

### ✅ What Exists Today

| Feature | Description | File Location |
|---------|-------------|---------------|
| **Topic Learning** | LLM extracts topics, subtopics, sub-subtopics from comments | `library/src/tasks/topic_modeling.ts` |
| **Comment Categorization** | Assigns topics to each comment (multi-topic support) | `library/src/tasks/categorization.ts` |
| **Vote Analysis** | Calculates aggregate votes, group-informed consensus | `library/src/stats/` |
| **Summary Generation** | Creates narrative report with citations | `library/src/tasks/summarization.ts` |
| **Citation Grounding** | Every claim links to source comments | `library/src/tasks/utils/citation_utils.ts` |
| **Hierarchical Topics** | 3-level depth (topic → subtopic → sub-subtopic) | `library/src/types.ts` |
| **Batch Processing** | Processes comments in batches to manage API quotas | `library/src/tasks/categorization.ts` |
| **Model Abstraction** | Pluggable LLM providers (currently Vertex AI) | `library/src/models/model.ts` |
| **CLI Runners** | Command-line tools for processing CSVs | `library/runner-cli/runner.ts` |
| **Static HTML Output** | Generates standalone HTML reports | `library/runner-cli/runner.ts` |
| **JSON Export** | Outputs structured JSON (topics, summary, comments) | `library/runner-cli/advanced_runner.ts` |
| **D3.js Visualizations** | Topic distribution, alignment charts | `visualization-library/src/` |
| **Web Components** | Reusable visualization components (published to npm) | `visualization-library/` |
| **Angular Report Viewer** | Read-only UI for viewing pre-generated reports | `web-ui/` |
| **Matrix Factorization** | Advanced vote analysis for large datasets | `library/src/stats/matrix_factorization.ts` |
| **Batch API Support** | Integration with Anthropic/Google Batch APIs | Recent commits |

### ❌ What's Missing

| Missing Feature | Impact | Priority |
|-----------------|--------|----------|
| **Web-based UI** | Users need command-line skills | **P0** |
| **User Authentication** | No user accounts, anyone with CLI can run | **P0** |
| **Database Storage** | Results only stored as files, no history | **P0** |
| **Multi-user Support** | One user per local machine | **P0** |
| **Project Management** | No way to organize multiple analyses | **P0** |
| **Session Persistence** | Results disappear if files deleted | **P0** |
| **Progress Tracking** | No visibility during long-running jobs | **P1** |
| **Error Recovery** | Job failures require manual restart | **P1** |
| **Collaboration** | Can't share projects with teammates | **P1** |
| **Access Control** | Can't control who views reports | **P1** |
| **API Access** | No programmatic integration | **P1** |
| **Report Management** | Can't compare reports over time | **P2** |
| **Search & Filtering** | Can't search comments in report | **P2** |
| **Export Options** | Only HTML and JSON, no PDF | **P2** |
| **Webhooks** | No notifications when jobs complete | **P3** |
| **Audit Logging** | No tracking of who did what | **P3** |

---

## Proposed System Features (SaaS Platform)

### 🆕 New Features (Not in Current System)

| Feature | Description | User Value | Implementation Complexity |
|---------|-------------|------------|---------------------------|
| **User Registration/Login** | Email + password auth | Secure access control | Low |
| **Dashboard** | View all projects, reports, recent activity | Central hub for all work | Low |
| **Project Organization** | Group related analyses into projects | Better organization | Low |
| **CSV Upload UI** | Drag-and-drop file upload with validation | No command-line needed | Low |
| **Real-time Progress** | Live updates during processing via SSE | Transparency, reduced anxiety | Medium |
| **Report History** | View all reports for a project over time | Track changes, compare results | Low |
| **Collaborator Invites** | Share projects with teammates | Team workflows | Medium |
| **Role-based Access** | Viewer, Editor, Admin roles | Control permissions | Medium |
| **API Key Management** | Generate/revoke keys for external access | Programmatic integration | Low |
| **REST API** | Upload CSVs, check status, fetch results | Automation, integrations | Medium |
| **Rate Limiting** | Prevent API abuse | Fair usage | Low |
| **Persistent Storage** | All data stored in PostgreSQL | Never lose results | Medium |
| **Search Comments** | Full-text search across all comments | Find specific feedback | Medium |
| **Filter by Topic** | View only comments for selected topics | Focused analysis | Low |
| **Export to PDF** | Professional reports for sharing | Offline distribution | Medium |
| **Activity Feed** | See who did what in a project | Team awareness | Low |
| **Usage Quotas** | Track API calls, Vertex spend per user | Cost management | Medium |
| **Batch Job API** | Process multiple CSVs in parallel | High-throughput workflows | High |
| **Webhook Notifications** | Alert external systems when jobs complete | Event-driven workflows | Medium |
| **Admin Dashboard** | Manage users, view system health | Operations visibility | Medium |
| **Audit Logs** | Track all actions for compliance | Security, compliance | Low |

### ✨ Enhanced Features (Improved from Current System)

| Feature | Current State | Proposed Enhancement |
|---------|---------------|----------------------|
| **Visualizations** | Static D3 charts in Angular | Interactive React charts with filtering |
| **Report Viewing** | Static HTML file | Live web app with search, filters, responsive design |
| **Error Handling** | CLI error messages, manual retry | User-friendly errors, automatic retry logic |
| **CSV Parsing** | Manual file paths | Drag-drop upload, validation, preview |
| **Job Management** | Single-threaded CLI | Background workers, concurrent jobs |
| **Output Formats** | HTML, JSON only | Add PDF, enhanced CSV with metadata |
| **Topic Customization** | Requires code changes | UI for custom topic seeds (future) |
| **Result Sharing** | Send HTML file via email | Shareable links with access control |

---

# User Flow & Component Architecture

## High-Level User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                                    │
└─────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION & LOGIN
   User visits app → Signs up with email/password → Email verification →
   Logs in → Lands on Dashboard

2. PROJECT CREATION
   Dashboard → Click "New Project" → Enter name, description, additional context →
   Project created → Redirected to Project Detail page

3. CSV UPLOAD & PROCESSING
   Project page → Click "Upload CSV" → Drag-drop file → Preview first 10 rows →
   Validation passes → Click "Analyze" → Job queued → Progress bar appears (SSE updates) →
   Notification: "Report ready!"

4. REPORT VIEWING
   Click "View Report" → Interactive summary page loads →
   User explores:
   - Overview section (top-level summary)
   - Topics accordion (expand subtopics)
   - Visualizations (topic distribution, alignment charts)
   - Filter by High Agreement/Disagreement
   - Search comments full-text
   - Hover claims for citation tooltips

5. COLLABORATION
   Project page → Click "Share" → Enter collaborator email → Select role (Viewer/Editor) →
   Invitation sent → Collaborator accepts → Can view reports, add CSVs (if Editor)

6. EXPORTING
   Report page → Click "Export" → Select format (PDF/HTML/JSON/CSV) → Download generated file

7. API INTEGRATION (Advanced users)
   Dashboard → Settings → "API Keys" → Generate key → Copy key →
   Use in external script:
     curl -H "Authorization: Bearer {key}" -F "file=@data.csv" POST /api/v1/reports
   Poll for completion → Fetch results JSON → Process in custom pipeline
```

## Component Architecture & Integration

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              UNIFIED SYSTEM                               │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        FRONTEND LAYER                            │    │
│  │  Next.js App (React + TypeScript)                               │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐    │    │
│  │  │ Auth Pages   │  │ Dashboard     │  │ Report Viewer    │    │    │
│  │  │ - Login      │  │ - Projects    │  │ - Summary        │    │    │
│  │  │ - Register   │  │ - Reports     │  │ - Visualizations │    │    │
│  │  │ - Profile    │  │ - Activity    │  │ - Search/Filter  │    │    │
│  │  └──────────────┘  └───────────────┘  └──────────────────┘    │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────┐     │    │
│  │  │  Visualization Components (D3.js Web Components)     │     │    │
│  │  │  - TopicDistributionChart                            │     │    │
│  │  │  - AlignmentChart                                     │     │    │
│  │  │  - GroupComparisonChart                              │     │    │
│  │  └──────────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                             │                                            │
│                             │ REST API + SSE                             │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        BACKEND LAYER                             │    │
│  │  NestJS API Server (TypeScript)                                 │    │
│  │                                                                  │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐        │    │
│  │  │ Auth       │  │ Projects API │  │ Processing API  │        │    │
│  │  │ - JWT      │  │ - CRUD       │  │ - Job Queue     │        │    │
│  │  │ - Guards   │  │ - Collab     │  │ - SSE Progress  │        │    │
│  │  └────────────┘  └──────────────┘  └─────────────────┘        │    │
│  │                                                                  │    │
│  │  ┌────────────────────────────────────────────────────┐        │    │
│  │  │  File Upload & Storage Service                     │        │    │
│  │  │  - Multer (multipart/form-data)                    │        │    │
│  │  │  - S3/GCS integration                               │        │    │
│  │  │  - CSV validation                                   │        │    │
│  │  └────────────────────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                             │                                            │
│                             │ Job Queue (BullMQ/Redis)                   │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       WORKER LAYER                               │    │
│  │  Background Job Processor (TypeScript)                          │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  SensemakingProcessor                                     │  │    │
│  │  │  1. Download CSV from S3                                 │  │    │
│  │  │  2. Parse CSV → Comment[]                                │  │    │
│  │  │  3. Instantiate Sensemaker (core library)                │  │    │
│  │  │  4. learnTopics()       ─┐                               │  │    │
│  │  │  5. categorizeComments() ├─ Core Library Methods         │  │    │
│  │  │  6. summarize()         ─┘                               │  │    │
│  │  │  7. Store results → PostgreSQL                           │  │    │
│  │  │  8. Emit progress updates → Redis pub/sub → SSE          │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  Core Sensemaking Library (Unchanged)                    │  │    │
│  │  │  - Sensemaker class                                       │  │    │
│  │  │  - Topic modeling, categorization, summarization          │  │    │
│  │  │  - LLM abstraction (Vertex AI)                            │  │    │
│  │  │  - Statistical analysis                                   │  │    │
│  │  │  SOURCE: library/src/                                     │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                             │                                            │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       DATA LAYER                                 │    │
│  │                                                                  │    │
│  │  ┌──────────────────┐           ┌──────────────────┐           │    │
│  │  │  PostgreSQL      │           │  S3/GCS Storage  │           │    │
│  │  │  - users         │           │  - CSV uploads   │           │    │
│  │  │  - projects      │           │  - Exported HTML │           │    │
│  │  │  - reports       │           │  - Generated PDF │           │    │
│  │  │  - processing_jobs│          │                  │           │    │
│  │  │  - summaries     │           │                  │           │    │
│  │  │  - topics        │           │                  │           │    │
│  │  │  - comments      │           │                  │           │    │
│  │  │  - collaborators │           │                  │           │    │
│  │  │  - api_keys      │           │                  │           │    │
│  │  └──────────────────┘           └──────────────────┘           │    │
│  │                                                                  │    │
│  │  ┌──────────────────┐                                          │    │
│  │  │  Redis           │                                          │    │
│  │  │  - Job queue     │                                          │    │
│  │  │  - Pub/sub       │                                          │    │
│  │  │  - Rate limiting │                                          │    │
│  │  └──────────────────┘                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Upload → Process → View

```
┌────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                                    │
└────────────────────────────────────────────────────────────────────────┘

STEP 1: CSV UPLOAD
   User (Browser)
      │
      │ 1. Drag & drop CSV file
      ▼
   Next.js Frontend
      │
      │ 2. Validate file (size, format)
      │ 3. POST /api/v1/projects/:id/csv-uploads
      │    Content-Type: multipart/form-data
      ▼
   NestJS API Server
      │
      │ 4. Authenticate JWT token
      │ 5. Check user owns project (RLS)
      │ 6. Parse CSV headers → validate columns
      │ 7. Upload to S3: {tenantId}/{projectId}/{timestamp}.csv
      │ 8. INSERT INTO csv_uploads (project_id, s3_key, row_count, status)
      │ 9. Return { csvUploadId, status: "validated" }
      ▼
   PostgreSQL
      csv_uploads table updated

STEP 2: START PROCESSING
   User (Browser)
      │
      │ 10. Click "Analyze" button
      ▼
   Next.js Frontend
      │
      │ 11. POST /api/v1/projects/:id/processing-jobs
      │     Body: { csvUploadId }
      ▼
   NestJS API Server
      │
      │ 12. INSERT INTO processing_jobs (project_id, csv_upload_id, status: "queued")
      │ 13. Enqueue BullMQ job:
      │     queue.add('process-csv', { projectId, csvUploadId, jobId })
      │ 14. Return { jobId, status: "queued" }
      ▼
   Redis Queue
      Job added to pending queue

STEP 3: BACKGROUND PROCESSING
   Worker Process (pulls from Redis)
      │
      │ 15. Dequeue job
      │ 16. UPDATE processing_jobs SET status='running', started_at=NOW()
      │ 17. Download CSV from S3
      │ 18. Parse CSV → Comment[] (using library/runner-cli/runner_utils.ts)
      │ 19. Instantiate Sensemaker class
      ▼
   Sensemaker.learnTopics()
      │
      │ 20. LLM calls to Vertex AI (topic modeling)
      │ 21. Emit progress: Redis pub/sub → "job:{jobId}:progress" → {stage: "learning_topics", percent: 30}
      │ 22. Return Topic[]
      ▼
   Sensemaker.categorizeComments()
      │
      │ 23. LLM calls to Vertex AI (categorization, batched)
      │ 24. Emit progress: {stage: "categorizing", percent: 60}
      │ 25. Return Comment[] (with topics assigned)
      ▼
   Sensemaker.summarize()
      │
      │ 26. LLM calls to Vertex AI (summarization)
      │ 27. Emit progress: {stage: "summarizing", percent: 90}
      │ 28. Return Summary object
      ▼
   Worker Process
      │
      │ 29. INSERT INTO summaries (project_id, processing_job_id, summary_data)
      │ 30. INSERT INTO topics (project_id, name, parent_topic_id, ...)  [bulk insert]
      │ 31. INSERT INTO comments (project_id, text, vote_info, topics, ...)  [bulk insert]
      │ 32. UPDATE processing_jobs SET status='completed', completed_at=NOW()
      │ 33. Emit progress: {stage: "complete", percent: 100}
      ▼
   PostgreSQL
      summaries, topics, comments tables populated

STEP 4: REAL-TIME UPDATES (Parallel to Step 3)
   User (Browser)
      │
      │ 34. Open SSE connection: GET /api/v1/processing-jobs/:jobId/progress
      │     (as soon as job starts)
      ▼
   NestJS API Server
      │
      │ 35. Subscribe to Redis pub/sub: "job:{jobId}:progress"
      │ 36. Stream events to client via SSE
      │     data: {"stage": "learning_topics", "percent": 30}
      │     data: {"stage": "categorizing", "percent": 60}
      │     data: {"stage": "complete", "percent": 100}
      ▼
   Next.js Frontend
      │
      │ 37. Update progress bar UI in real-time
      │ 38. When percent=100, show "View Report" button

STEP 5: VIEW REPORT
   User (Browser)
      │
      │ 39. Click "View Report"
      │ 40. Navigate to /projects/:id/reports/:reportId
      ▼
   Next.js Frontend (Server Component)
      │
      │ 41. GET /api/v1/reports/:reportId
      │ 42. GET /api/v1/reports/:reportId/topics
      │ 43. GET /api/v1/reports/:reportId/comments?page=1&limit=50
      ▼
   NestJS API Server
      │
      │ 44. Query PostgreSQL:
      │     - SELECT summary_data FROM summaries WHERE id = :reportId
      │     - SELECT * FROM topics WHERE project_id = :projectId
      │     - SELECT * FROM comments WHERE project_id = :projectId
      │ 45. Transform data for frontend (add citations, format votes)
      │ 46. Return JSON
      ▼
   Next.js Frontend
      │
      │ 47. Render report page:
      │     - Summary sections (intro, overview, topics)
      │     - D3 visualizations (pass data to web components)
      │     - Comment list (paginated)
      │     - Search bar, filters (client-side state)
      ▼
   User (Browser)
      │
      │ 48. Interact with report:
      │     - Expand topic accordion
      │     - Hover for citation tooltips
      │     - Filter by alignment type
      │     - Search comments
      │     - Export to PDF
```

### Component Integration Details

**1. Frontend ↔ Backend Communication**
- **Protocol**: REST API (JSON)
- **Auth**: JWT in Authorization header (`Bearer {token}`)
- **Real-time**: Server-Sent Events (SSE) for job progress
- **Error Handling**: Standardized error responses (`{ statusCode, message, details }`)

**2. Backend ↔ Worker Communication**
- **Protocol**: BullMQ job queue (Redis-backed)
- **Job Payload**: `{ projectId, csvUploadId, jobId }`
- **Progress Updates**: Redis pub/sub (`job:{jobId}:progress`)
- **Retry Logic**: Exponential backoff (1min, 5min, 15min)

**3. Worker ↔ Core Library Integration**
- **Interface**: Import Sensemaker class from `library` package
- **Data In**: Comment[] (from CSV parser)
- **Data Out**: Summary object (with contents, topics, comments)
- **Side Effects**: Console.log interception for progress tracking

**4. Frontend ↔ Visualizations Integration**
- **Technology**: Web Components (D3.js, published to npm)
- **Integration**: React wrapper components
- **Data Flow**: Fetch from API → Transform to chart format → Pass as props → Web component renders
- **Example**:
  ```tsx
  <TopicsDistributionChart data={chartData} view="cluster" />
  ```

**5. Database Access Pattern**
- **ORM**: Prisma (type-safe queries)
- **Multi-tenancy**: Middleware sets session variable, RLS policies enforce
- **Bulk Operations**: Use `createMany()` for inserting 1000s of comments
- **JSONB Queries**: Use `@>` operator for filtering summaries by type

---

## Current State Analysis

### Existing Architecture
- **Monorepo Structure**: workspace-based with library, web-ui, visualization-library
- **Core Library**: TypeScript library using Google Vertex AI/Gemini LLMs
- **CLI-Based**: Processing done via command-line runners
- **Static Output**: Generates HTML/JSON files with no persistence
- **No Backend API**: Referenced in workspaces but not implemented
- **No Database**: File-based operations only
- **No User System**: No authentication, authorization, or multi-user support
- **View-Only Web UI**: Angular app that displays pre-generated reports

### Key Components (Current)
1. **library/** - Core sensemaking logic (TypeScript)
   - Topic learning, categorization, summarization
   - LLM abstraction layer (Vertex AI)
   - Statistical analysis modules
   - Entry: `src/sensemaker.ts`

2. **visualization-library/** - D3.js visualization components
   - Published npm package: `@conversationai/sensemaker-visualizations`
   - Web components for charts (topic alignment, distribution, overview)

3. **web-ui/** - Angular application
   - Displays pre-generated reports
   - No data processing or user interaction
   - Entry: `src/main.ts`

4. **models/** - Python model implementations (parallel to TypeScript)

### Current Data Flow
```
CSV Input → CLI Runner → Sensemaker Library → LLM Processing →
Statistical Analysis → Output (HTML/JSON files) → Web UI (static view)
```

### Identified Gaps
- ❌ No API server
- ❌ No database/persistence layer
- ❌ No user authentication/authorization
- ❌ No multi-tenant support
- ❌ No session management
- ❌ No project/report management
- ❌ No real-time processing feedback
- ❌ No collaboration features
- ❌ No programmatic API access

## Target Architecture

### Deployment Model
- **Type**: SaaS Platform (Multi-tenant)
- **Authentication**: Email/Password
- **Database**: PostgreSQL
- **Hosting**: Cloud-native (AWS/GCP/Azure compatible)

### Core User Workflows
1. ✅ Upload CSV → Process → View Report (async processing)
2. ✅ Manage multiple projects and reports
3. ✅ Real-time collaboration (sharing, commenting)
4. ✅ API access for external integrations

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Modern React/Next.js SPA with real-time updates           │
│  - Dashboard (projects, reports)                            │
│  - Upload & Processing UI                                   │
│  - Report Viewer (enhanced from current Angular UI)        │
│  - User Management                                          │
│  - Collaboration UI                                         │
└────────────────┬────────────────────────────────────────────┘
                 │ REST/GraphQL API + WebSocket
┌────────────────┴────────────────────────────────────────────┐
│                      API SERVER                              │
│  Node.js/Express or NestJS                                  │
│  - Auth middleware                                          │
│  - Multi-tenant isolation                                   │
│  - File upload handling                                     │
│  - Job queue management                                     │
│  - Real-time notifications                                  │
│  - External API endpoints                                   │
└────────┬──────────────────────────┬─────────────────────────┘
         │                          │
         │                          │ Job Queue (Bull/BullMQ)
         │                          │
┌────────┴──────────┐     ┌────────┴──────────────────────────┐
│   POSTGRESQL DB   │     │    WORKER PROCESSES               │
│  - Users/Tenants  │     │  - Process CSV uploads            │
│  - Projects       │     │  - Run sensemaker library         │
│  - Reports        │     │  - Generate visualizations        │
│  - Comments       │     │  - Update job status              │
│  - Collaborators  │     │  - Retry failed jobs              │
│  - API Keys       │     └───────────────────────────────────┘
└───────────────────┘
         │
┌────────┴──────────┐
│  FILE STORAGE     │
│  S3/GCS/Azure     │
│  - CSV uploads    │
│  - Generated HTML │
│  - Export files   │
└───────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React + Next.js 14+ (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS (modern, accessible)
- **Visualizations**: Migrate D3.js components from visualization-library
- **State Management**: React Query + Zustand
- **Real-time**: Socket.io client
- **API Client**: tRPC or Axios

### Backend
- **Framework**: NestJS (TypeScript, modular, scalable)
- **Database ORM**: Prisma (type-safe, migrations)
- **Authentication**: Passport.js + bcrypt
- **Job Queue**: BullMQ + Redis
- **File Upload**: Multer + AWS S3 SDK
- **Real-time**: Socket.io
- **API Documentation**: Swagger/OpenAPI

### Database Schema (PostgreSQL)
```sql
- users (id, email, password_hash, created_at, updated_at)
- tenants (id, name, plan, created_at) [for future multi-org support]
- projects (id, user_id, tenant_id, name, description, created_at)
- reports (id, project_id, name, status, csv_file_url, output_json, created_at)
- processing_jobs (id, report_id, status, progress, error, started_at, completed_at)
- comments (id, report_id, comment_text, votes, topics, created_at) [processed data]
- topics (id, report_id, name, description, parent_id) [hierarchical]
- collaborators (id, project_id, user_id, role, invited_at)
- api_keys (id, user_id, key_hash, name, last_used, created_at)
- audit_logs (id, user_id, action, resource, created_at)
```

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional, for scale)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: Winston + ELK stack (optional)

## Implementation Plan

### Phase 1: Foundation & Backend API (Weeks 1-3)

#### 1.1 Project Setup
- [ ] Initialize NestJS backend project
- [ ] Set up PostgreSQL + Prisma ORM
- [ ] Configure Docker development environment
- [ ] Set up TypeScript configurations
- [ ] Configure ESLint + Prettier

#### 1.2 Database Schema & Models
- [ ] Define Prisma schema with all entities
- [ ] Create initial migrations
- [ ] Seed database with test data
- [ ] Set up multi-tenant isolation middleware

#### 1.3 Authentication System
- [ ] Implement email/password registration
- [ ] Create login endpoint with JWT
- [ ] Add password hashing (bcrypt)
- [ ] Implement auth guards/middleware
- [ ] Create user profile endpoints

#### 1.4 Project & Report Management API
- [ ] CRUD endpoints for projects
- [ ] CRUD endpoints for reports
- [ ] List projects/reports with pagination
- [ ] Implement tenant isolation
- [ ] Add role-based access control

### Phase 2: Core Processing Pipeline (Weeks 3-5)

#### 2.1 File Upload System
- [ ] Configure Multer for CSV uploads
- [ ] Set up S3/GCS storage integration
- [ ] Add file validation (CSV format, size limits)
- [ ] Create upload endpoint
- [ ] Store file metadata in database

#### 2.2 Job Queue Integration
- [ ] Set up Redis + BullMQ
- [ ] Create job processor for sensemaking tasks
- [ ] Implement job status tracking
- [ ] Add retry logic for failed jobs
- [ ] Create job progress updates

#### 2.3 Sensemaker Library Integration
- [ ] Extract core library as internal package
- [ ] Create worker process that uses library
- [ ] Implement CSV → Sensemaker input transformation
- [ ] Store processing results in database
- [ ] Generate output JSON and HTML files

#### 2.4 Real-time Updates
- [ ] Set up Socket.io server
- [ ] Emit job progress events
- [ ] Implement tenant-scoped rooms
- [ ] Create notification system

### Phase 3: Frontend Application (Weeks 5-8)

#### 3.1 Project Setup & Layout
- [ ] Initialize Next.js 14+ project
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Create layout components (header, sidebar, footer)
- [ ] Implement routing structure
- [ ] Set up API client (tRPC or Axios)

#### 3.2 Authentication UI
- [ ] Login page
- [ ] Registration page
- [ ] Protected route wrapper
- [ ] User profile page
- [ ] Password reset flow (basic)

#### 3.3 Dashboard & Project Management
- [ ] Dashboard with project list
- [ ] Create project modal/page
- [ ] Project detail page
- [ ] Delete/archive project
- [ ] Search and filters

#### 3.4 Upload & Processing Flow
- [ ] CSV upload component with drag-drop
- [ ] File validation feedback
- [ ] Processing status indicator
- [ ] Progress bar with real-time updates
- [ ] Error handling and retry UI

#### 3.5 Report Viewer
- [ ] Migrate Angular report viewer to React
- [ ] Integrate D3.js visualizations from visualization-library
- [ ] Display summary sections (intro, overview, topics)
- [ ] Interactive topic navigation
- [ ] Citation tooltips and grounding
- [ ] Export report (PDF, HTML, JSON)

#### 3.6 Collaboration Features
- [ ] Share project/report modal
- [ ] Collaborator management UI
- [ ] View-only vs. edit permissions
- [ ] Activity feed (who did what)
- [ ] Comments on reports (optional phase 1)

### Phase 4: API Access & External Integrations (Weeks 8-9)

#### 4.1 External API
- [ ] API key generation and management
- [ ] Public API endpoints:
  - POST /api/v1/reports (submit CSV for processing)
  - GET /api/v1/reports/:id (get report status)
  - GET /api/v1/reports/:id/results (get results)
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Webhook support for completion notifications

#### 4.2 Batch Processing Support
- [ ] Batch API endpoint (process multiple CSVs)
- [ ] Batch status tracking
- [ ] Implement existing Batch API integration (from commits)

### Phase 5: Polish & Production Readiness (Weeks 9-10)

#### 5.1 Testing
- [ ] Unit tests for critical backend functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for key user flows
- [ ] Load testing for concurrent processing

#### 5.2 DevOps & Deployment
- [ ] Production Docker configuration
- [ ] Environment variable management
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database backup strategy
- [ ] Monitoring and logging setup

#### 5.3 Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer setup guide
- [ ] Architecture documentation
- [ ] Deployment guide

#### 5.4 UI/UX Enhancements
- [ ] Loading states and skeletons
- [ ] Empty states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.1)

### Phase 6: Advanced Features (Future)

- [ ] Advanced analytics dashboard
- [ ] Report comparison tool
- [ ] Custom topic configurations
- [ ] Template library for different use cases
- [ ] Data retention policies
- [ ] Organization management (multi-org tenants)
- [ ] Billing integration (Stripe)
- [ ] SSO/SAML support
- [ ] Advanced collaboration (comments, annotations)
- [ ] Report versioning
- [ ] Scheduled/recurring analysis

## File Structure (New)

```
sensemaking-tools/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/                 # Auth module
│   │   │   ├── users/                # User management
│   │   │   ├── projects/             # Project CRUD
│   │   │   ├── reports/              # Report CRUD
│   │   │   ├── upload/               # File upload
│   │   │   ├── jobs/                 # Job queue
│   │   │   ├── realtime/             # Socket.io
│   │   │   ├── api-keys/             # External API
│   │   │   └── common/               # Shared utilities
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # App router pages
│   │   │   │   ├── (auth)/           # Auth pages
│   │   │   │   ├── (dashboard)/      # Protected pages
│   │   │   │   └── api/              # API routes
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # shadcn components
│   │   │   │   ├── visualizations/   # D3 charts
│   │   │   │   ├── projects/         # Project components
│   │   │   │   └── reports/          # Report components
│   │   │   ├── lib/                  # Utilities
│   │   │   └── hooks/                # React hooks
│   │   └── package.json
│   │
│   └── worker/                       # Background job processor
│       ├── src/
│       │   ├── index.ts
│       │   ├── processors/
│       │   │   └── sensemaking.processor.ts
│       │   └── utils/
│       └── package.json
│
├── packages/
│   ├── core/                         # Core sensemaking library (from library/)
│   │   └── [existing library code]
│   │
│   ├── visualizations/               # Visualization components (from visualization-library/)
│   │   └── [existing viz code, migrated to React]
│   │
│   └── types/                        # Shared TypeScript types
│       └── src/
│           ├── database.ts           # Prisma types
│           ├── api.ts                # API contracts
│           └── sensemaker.ts         # Core types
│
├── docker-compose.yml                # Local development
├── Dockerfile.api                    # API container
├── Dockerfile.web                    # Web container
├── Dockerfile.worker                 # Worker container
└── README.md                         # Updated documentation
```

## Critical Implementation Notes

### 1. Preserve Core Functionality
- **DO NOT** modify the core sensemaking algorithms in `library/src/`
- The `Sensemaker` class API should remain unchanged
- All statistical analysis and LLM logic stays the same
- Only change the input/output handling and orchestration

### 2. Multi-tenant Isolation
- Every database query must filter by tenant_id
- Implement middleware that adds tenant context from JWT
- Files in S3 must use tenant-scoped paths: `{tenant_id}/{project_id}/{file}`
- Socket.io rooms must be tenant-scoped

### 3. Async Processing
- CSV processing can take minutes to hours for large datasets
- NEVER block HTTP requests waiting for processing
- Always return job_id immediately
- Use WebSocket for progress updates
- Store all LLM responses in database for later retrieval

### 4. Cost Management
- Processing costs ~$1 per 1000 comments (LLM costs)
- Implement usage tracking per tenant
- Add warnings for large CSV files
- Consider implementing quotas in the future

### 5. Migration Strategy
- Keep existing CLI tools working for backward compatibility
- Provide migration script for users with existing CSV workflows
- Document how to use new API from existing scripts

## Success Criteria

### Functional Requirements
- ✅ Users can register, login, and manage their profile
- ✅ Users can create projects and upload CSVs
- ✅ System processes CSVs asynchronously with progress updates
- ✅ Users can view interactive reports with visualizations
- ✅ Users can share projects with collaborators
- ✅ External developers can use REST API with API keys
- ✅ All processing produces identical results to CLI version

### Non-Functional Requirements
- ✅ System supports 100+ concurrent users
- ✅ Processes 1000-comment CSV in < 10 minutes
- ✅ 99% uptime SLA
- ✅ Mobile-responsive UI
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ SOC 2 ready (audit logs, encryption)

### Developer Experience
- ✅ Complete API documentation
- ✅ One-command local setup with Docker
- ✅ Clear contribution guidelines
- ✅ Comprehensive test coverage (>80%)
- ✅ TypeScript throughout for type safety

---

## Next Steps

This plan will be executed in phases with regular checkpoints. The architecture maintains the proven sensemaking core while adding a modern, scalable application layer around it.
