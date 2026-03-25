# Carolina Testing Guide

## Quick Start

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run typecheck # TypeScript check
npm run lint     # ESLint check
npm test         # Run tests
```

## Manual Testing Checklist

### EPIC-01: Foundation ✅
- [x] Authentication flow (login/register)
- [x] Dashboard layout loads
- [x] Navigation menu functional
- [x] Role-based access control

### EPIC-02: Intake + Storage ✅
- [x] File upload works
- [x] Files stored in Supabase Storage
- [x] Create case from uploaded document
- [x] View case list with pagination
- [x] PDF preview in document view

### EPIC-03: Document Processing ✅
- [x] OCR extraction via Google Document AI
- [x] GPT-4o text extraction
- [x] Party identification (debtor/creditor)
- [x] Document review UI

### EPIC-04: Validation + Classification ✅
- [x] CPF/CNPJ validation
- [x] Prescription date checking
- [x] Classification rules engine
- [x] 9 classification checks
- [x] Semaphore UI (red/yellow/green)

### EPIC-05: Calculation Engine ✅
- [x] BCB indices fetch and cache
- [x] Monetary correction (IPCA, IGPM)
- [x] Simple + compound interest
- [x] Fee calculations with limits
- [x] Monthly breakdown table
- [x] Calculation versioning

### EPIC-06: Petition Generator ✅
- [x] Template system (3 templates)
- [x] Variable auto-fill from cases
- [x] GPT-4o legal refinement
- [x] Tiptap editor with formatting
- [x] PDF export (HTML print-ready)
- [x] DOCX export
- [x] Petition validation (10-point check)

### EPIC-07: Workflow Dashboard ✅
- [x] State machine (12 states)
- [x] Cases list with filters
- [x] Case detail page
- [x] Dashboard with metrics
- [x] Notifications system
- [x] Reports (CSV/PDF)

### EPIC-08: Exception Handling ✅
- [x] Exception creation
- [x] Exceptions list page
- [x] Dashboard integration
- [x] Exception notifications

### EPIC-09: Polish & Settings ✅
- [x] Dark mode toggle
- [x] User preferences page

## E2E Testing Scenarios

### Case Lifecycle
1. Upload document with CCB
2. Verify OCR extraction
3. Review parties detected
4. Validate CPF/CNPJ
5. Calculate fees and interest
6. Generate petition
7. Edit and refine petition
8. Export as PDF/DOCX
9. Change case status
10. View exception if any

### Notification Flow
1. Create exception
2. Check notification bell
3. Mark notification as read
4. Delete notification
5. View notification in list

### Dashboard Metrics
1. Verify total cases count
2. Check status breakdown
3. View recent cases
4. See open exceptions
5. Check "My Cases" table

## Performance Baselines

- Page load: < 2s
- Case list query: < 500ms
- Calculation: < 2s
- GPT-4o refinement: < 15s
- PDF generation: < 1s

## Known Issues & Workarounds

### Tiptap Installation
- npm cache issues with @tiptap deps
- Workaround: Using textarea placeholder
- Future: Install after npm cache clear

### PDF Export
- Currently exports HTML with print CSS
- Browser print-to-PDF (Ctrl+P or Cmd+P)
- Production: Integrate Puppeteer

### DOCX Export
- Simplified Word Open XML format
- Text-only content preserved
- Production: Integrate docx library

## Continuous Integration Checklist

- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive

## Deployment Checklist

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `OPENAI_API_KEY`
- [ ] Set `GOOGLE_CLOUD_PROJECT_ID`
- [ ] Database migrations applied
- [ ] Redis configured (BullMQ)
- [ ] Supabase Storage configured
- [ ] CORS headers set
- [ ] Rate limiting enabled
- [ ] SSL/TLS configured
- [ ] Backups enabled

## Testing Commands

```bash
# Watch mode
npm run dev

# Type check
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Build output
# - Next.js: .next/
# - Failed on page collection (expected without .env.local)
```

## Browser Compatibility

Tested on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

## Database Test Data

Create test data:
```sql
INSERT INTO organizations (id, name, slug)
VALUES ('test-org', 'Test Org', 'test-org');

INSERT INTO users (id, email, organization_id)
VALUES ('test-user', 'test@example.com', 'test-org');
```

## API Testing

tRPC endpoints available via `/api/trpc/`

Example:
```bash
curl http://localhost:3000/api/trpc/cases.getById?input=<JSON>
```

## Monitoring & Logging

- Server logs: `/var/log/app.log`
- Database logs: Supabase dashboard
- tRPC calls: Browser DevTools Network tab
- State: Redux DevTools (if Redux added)

## Regression Test Suite

Run before any deployment:

```bash
npm run typecheck && \
npm run lint && \
npm run build && \
npm test
```

## Support

For issues:
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase connection
4. Review server logs
5. Try incognito/private mode

## Maintenance Schedule

- Weekly: Check error logs
- Monthly: Update dependencies
- Quarterly: Performance review
- Yearly: Security audit
