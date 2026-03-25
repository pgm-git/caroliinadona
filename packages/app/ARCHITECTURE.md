# Carolina Architecture Guide

## System Overview

Carolina is a full-stack microSaaS for automating bank execution proceedings. The architecture follows a layered approach with clear separation of concerns.

## Technology Stack

- **Frontend**: Next.js 16.2.1, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui v4
- **Backend**: tRPC 11, Node.js
- **Database**: PostgreSQL via Supabase, Drizzle ORM
- **Messaging**: BullMQ with Redis
- **AI**: GPT-4o (OpenAI), Google Document AI
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

## Folder Structure

```
packages/app/src/
├── app/                          # Next.js app router
│   ├── (auth)/                  # Auth routes (public)
│   ├── (dashboard)/             # Protected routes
│   │   ├── cases/
│   │   ├── documents/
│   │   ├── exceptions/
│   │   ├── dashboard/
│   │   ├── queue/
│   │   └── settings/
│   ├── api/                     # API routes
│   └── layout.tsx               # Root layout
├── server/
│   ├── db/                      # Database layer
│   │   ├── client.ts           # Drizzle client
│   │   ├── schema.ts           # 15 tables
│   │   ├── enums.ts            # 13 enums
│   │   └── relations.ts        # Relations
│   ├── services/               # Business logic (10+)
│   │   ├── cases.service.ts
│   │   ├── documents.service.ts
│   │   ├── extraction.service.ts
│   │   ├── validation.service.ts
│   │   ├── calculation.service.ts
│   │   ├── petition.service.ts
│   │   ├── notifications.service.ts
│   │   └── ... (more services)
│   └── trpc/                   # tRPC API layer
│       ├── routers/            # 12+ routers
│       └── trpc.ts             # tRPC setup
├── components/                  # React components
│   ├── ui/                     # shadcn/ui
│   ├── layout/                 # Header, Sidebar
│   ├── notifications/          # Notification bell
│   ├── reports/               # Export buttons
│   └── ... (domain-specific)
├── lib/                         # Utilities
│   ├── trpc/                   # tRPC client setup
│   ├── auth/                   # Auth utilities
│   ├── navigation.ts           # Nav items
│   └── petition/               # Petition utilities
└── styles/                      # Global styles
```

## Data Flow Architecture

### Request Flow
```
Client Browser
    ↓
React Component
    ↓
tRPC Client Hook (useQuery/useMutation)
    ↓
tRPC Server Procedure (protectedProcedure)
    ↓
Service Layer (business logic)
    ↓
Drizzle ORM Query
    ↓
PostgreSQL / Supabase
```

### Database Schema (15 Tables)

**Core Entities**:
- organizations
- users
- cases

**Documents & Content**:
- documents
- document_reviews

**Business Logic**:
- parties
- calculations
- validations
- classifications

**Workflow**:
- petitions
- petition_templates
- notifications
- exceptions
- audit_log

## Key Patterns

### Service Layer
All business logic in `/server/services/`:
```typescript
// Pattern: service.ts
export const serviceService = {
  async create(input) { /* ... */ },
  async getById(id, orgId) { /* ... */ },
  async update(id, orgId, data) { /* ... */ },
  async list(filters) { /* ... */ },
};
```

### tRPC Router
```typescript
// Pattern: routers/example.ts
export const exampleRouter = router({
  create: protectedProcedure
    .input(z.object({...}))
    .mutation(async ({ input, ctx }) => {
      return service.create({...});
    }),
});
```

### React Hooks
```typescript
// Pattern: component usage
const mutation = trpc.service.create.useMutation({
  onSuccess: () => {
    toast.success("Created");
    refetch();
  },
  onError: (error) => {
    toast.error(`Error: ${error.message}`);
  },
});
```

## Authentication & Authorization

- **Method**: Supabase Auth (JWT tokens)
- **Context**: tRPC context includes `{ user: { id, email }, role, orgId }`
- **Levels**: Admin, Coordinator, Lawyer, Intern
- **Protection**: `protectedProcedure` requires auth
- **Row-Level Security**: Enforced via `orgId` checks

## Enums & Constants

```typescript
// src/server/db/enums.ts
- caseStatusEnum (12 states)
- caseTypeEnum (execution, collection)
- exceptionTypeEnum (12 types)
- exceptionSeverityEnum (4 levels)
- notificationTypeEnum (9 types)
- petitionStatusEnum (6 states)
- ... (13 total)
```

## Calculation Engine

**Components**:
1. **BCB Client**: Fetches 6 government indices (IGPM, IPCA, INPC, SELIC, CDI, TR)
2. **Monetary Correction**: Month-by-month index application
3. **Interest Engine**: Simple + compound interest
4. **Fee Calculator**: Penalty (max 2%), Attorney fees (10-20%)
5. **Versioning**: isCurrent flag for audit trail

**Result**: Monthly breakdown with principal → corrected amount → interest → fees

## AI Integration

### OpenAI (GPT-4o)
- **Document Extraction**: Extract text, party info, dates
- **Petition Refinement**: Add legal citations, improve coherence
- **Timeout**: 15 seconds with graceful fallback

### Google Document AI
- **OCR**: Optical character recognition on uploaded PDFs
- **Entity Extraction**: Detect parties, dates, amounts
- **Structured Output**: JSON format for processing

## Async Processing

**BullMQ Queues**:
1. `document-processing`: OCR + extraction
2. `calculation`: Index fetch + calculation
3. `notification`: Send notifications
4. `report-generation`: CSV/PDF creation

**Example**:
```typescript
await documentQueue.add('process', { documentId, caseId });
```

## Error Handling

**tRPC Errors**:
```typescript
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Caso não encontrado.',
});
```

**Service Layer**:
- Validation with Zod
- Logging via audit table
- Graceful degradation (e.g., GPT timeout)

## Real-Time Features

### Notifications
- WebSocket-ready via tRPC subscriptions
- In-app bell with unread count
- Toast feedback for actions
- Persistent storage

### Dashboard Metrics
- Real-time queries (< 500ms)
- Status breakdown by count
- Pipeline visualization
- Open exceptions display

## Performance Optimizations

1. **Caching**: BCB indices cached 4 hours
2. **Pagination**: 20 items/page default
3. **Indexes**: Database indexes on frequently queried columns
4. **Query optimization**: Only fetch required fields
5. **Code splitting**: Next.js automatic
6. **Image optimization**: Next.js Image component

## Deployment Architecture

```
[Browser Client]
      ↓
[Vercel/Next.js Server]
      ↓
[Supabase Database]
[Supabase Storage]
[Supabase Auth]
      ↓
[OpenAI API]
[Google Cloud API]
[Redis (BullMQ)]
```

## Scaling Considerations

1. **Database**: Supabase auto-scales
2. **Storage**: Supabase Storage unlimited
3. **API**: Vercel functions scale automatically
4. **Queue**: Redis can be clustered
5. **File Processing**: BullMQ distributes across workers

## Security Measures

1. **Row-Level Security**: orgId validation
2. **API Keys**: Environment variables only
3. **CORS**: Configured per Supabase
4. **Rate Limiting**: Can be added via middleware
5. **Audit Logging**: All mutations logged
6. **Data Retention**: Configurable (e.g., 30 days for notifications)

## Development Workflow

1. **Feature Branch**: `git checkout -b feature/name`
2. **Implementation**: Code following patterns above
3. **Testing**: Manual testing + E2E scenarios
4. **Type Safety**: `npm run typecheck` must pass
5. **Linting**: `npm run lint` must pass
6. **Commit**: Conventional commit with EPIC/Story reference
7. **PR**: Code review via GitHub

## Monitoring & Logs

- **Server Logs**: Vercel dashboard
- **Database Logs**: Supabase dashboard
- **API Monitoring**: tRPC calls visible in DevTools
- **Error Tracking**: Can integrate Sentry
- **Performance**: Can integrate DataDog

## Future Enhancements

1. **WebSockets**: Real-time collaboration
2. **GraphQL**: Alternative to tRPC
3. **Mobile App**: React Native
4. **Webhooks**: External integrations
5. **PDF Generation**: Server-side Puppeteer
6. **DOCX Generation**: Proper ZIP format
7. **Machine Learning**: ML model integration
8. **Multi-language**: i18n support
9. **Dark Mode**: Complete theme system
10. **Analytics**: User behavior tracking
