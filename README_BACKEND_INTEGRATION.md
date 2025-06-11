# SurveyForge Backend Integration Guide

## 🎯 **Project Overview**

SurveyForge is an AI-powered survey creation platform that allows users to create, manage, and export professional survey projects. This repository contains the complete frontend application and comprehensive backend integration documentation.

## 📋 **Current Status**

✅ **Frontend**: Fully functional and running on `http://localhost:3000`  
✅ **Integration Layer**: Complete API client with smart fallback (mock → real API)  
✅ **Documentation**: Comprehensive backend specifications and implementation guide  
⚠️ **Backend**: Ready for development (all specifications provided)

## 📚 **Documentation Overview**

### For Backend Developers

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **`BACKEND_IMPLEMENTATION_CHECKLIST.md`** | ⭐ **START HERE** - Complete checklist | Implementation planning and tracking |
| **`BACKEND_INTEGRATION_SPEC.md`** | Complete API specification | Detailed implementation reference |
| **`BACKEND_QUICK_START.md`** | Quick start guide | Get basic API running quickly |
| **`SurveyForge_API.postman_collection.json`** | API testing collection | Testing and validation |

### For Project Managers

| Resource | Purpose |
|----------|---------|
| **Implementation Checklist** | Track development progress (100+ checkpoints) |
| **Success Criteria** | Validate complete functionality |
| **Phase Structure** | 10 phases from setup to production |

## 🚀 **Quick Start for Backend Team**

### 1. **Get Started (5 minutes)**
```bash
# 1. Read the implementation checklist
open BACKEND_IMPLEMENTATION_CHECKLIST.md

# 2. Test frontend API status page
# Visit: http://localhost:3000/api-status
```

### 2. **Minimum Viable API (30 minutes)**
Implement these 3 endpoints to get immediate integration:
- `GET /api/v1/methodologies/` → Return sample methodologies
- `GET /api/v1/industries/` → Return sample industries  
- `GET /api/v1/projects/` → Return `[]` (empty array)

### 3. **Test Integration (5 minutes)**
- Start your backend on `http://localhost:8000`
- Change frontend `.env.local`: `NEXT_PUBLIC_DEV_MODE=false`
- Visit `http://localhost:3000/api-status` → Should show green

### 4. **Full Implementation**
Follow the 10-phase checklist in `BACKEND_IMPLEMENTATION_CHECKLIST.md`

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    HTTP/JSON     ┌─────────────────┐
│                 │ ◄────────────► │                 │
│  Next.js        │                 │  Backend API    │
│  Frontend       │                 │  (Django/FastAPI) │
│  (Port 3000)    │                 │  (Port 8000)    │
└─────────────────┘                 └─────────────────┘
│                                     │
│ • Project Management UI             │ • RESTful API
│ • Survey Creation Forms             │ • Database Models  
│ • API Status Dashboard             │ • File Upload
│ • Smart API Fallback               │ • Document Export
│ • Real-time Validation             │ • Business Logic
└─────────────────────────────────────┘
```

## 📊 **Implementation Phases**

| Phase | Focus | Duration | Key Deliverables |
|-------|--------|-----------|-----------------|
| **1-2** | Setup & Database | 1-2 days | Environment, schema, models |
| **3-4** | Core API & Security | 2-3 days | CRUD endpoints, validation |
| **5-6** | File Upload & Logic | 1-2 days | File handling, business rules |
| **7** | Testing & QA | 1 day | Comprehensive testing |
| **8-9** | Advanced Features | 2-3 days | Questions, document export |
| **10** | Production Ready | 1 day | Security, monitoring, deployment |

**Total Estimated Time**: 8-12 days for complete implementation

## 🎯 **Success Metrics**

### Technical Requirements
- ✅ All API endpoints respond within 500ms
- ✅ Frontend integration shows 100% green status
- ✅ File uploads work for 10MB files
- ✅ Complete project workflow functions end-to-end

### Business Requirements
- ✅ Users can create and manage survey projects
- ✅ Projects support all required fields and validation
- ✅ Template variables system works correctly
- ✅ File uploads and document generation function

## 🔧 **Development Tools Provided**

### Testing & Validation
- **API Status Dashboard**: Real-time endpoint health monitoring
- **Postman Collection**: Complete API testing suite
- **Sample Data**: Methodologies, industries, test projects
- **Error Scenarios**: Comprehensive error testing

### Documentation
- **Database Schema**: Complete SQL schema with indexes
- **Request/Response Examples**: All endpoints with sample data  
- **Error Handling**: Standard error response formats
- **Security Guidelines**: Input validation and security requirements

## 🚨 **Critical Integration Points**

### 1. CORS Configuration
```python
# CRITICAL: Without proper CORS, frontend cannot connect
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

### 2. Response Format
```json
// ALL responses must include these calculated fields
{
  "methodology_name": "In-Market Ad Testing",  // Auto-populated
  "industry_name": "Technology",               // Auto-populated
  "last_modified": "2024-06-11T10:30:00Z",    // ISO 8601 format
  "question_count": 4,                         // Auto-calculated
  "estimated_duration": "3-4 min"             // Auto-calculated
}
```

### 3. Environment Variables
```env
# Frontend expects these exact variable names
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEV_MODE=false  # Set to false for live API
```

## 📞 **Support & Communication**

### For Development Questions
1. **Check API Status**: `http://localhost:3000/api-status`
2. **Review Request Format**: Check `lib/api.ts` in frontend
3. **Test with Postman**: Use provided collection
4. **Validate Response**: Compare with specification examples

### For Integration Issues
1. **Frontend Logs**: Check browser console for errors
2. **Backend Logs**: Review API server logs
3. **Network Tab**: Inspect actual HTTP requests/responses
4. **CORS Issues**: Most common integration problem

## 🎉 **Definition of Done**

The backend is considered complete when:

✅ **All 100+ checklist items** are verified  
✅ **Frontend `/api-status`** shows all green indicators  
✅ **Complete user workflow** works end-to-end:
   - Create new project ✓
   - Upload design brief ✓  
   - Edit project details ✓
   - View project list ✓
   - Handle errors gracefully ✓

✅ **Performance requirements** met:
   - API responses < 500ms ✓
   - File uploads < 30 seconds ✓
   - Frontend loads < 2 seconds ✓

✅ **Production readiness**:
   - Security headers ✓
   - Error handling ✓
   - Logging ✓
   - Documentation ✓

---

## 🚀 **Ready to Start?**

1. **Read**: `BACKEND_IMPLEMENTATION_CHECKLIST.md` (your roadmap)
2. **Implement**: Start with Phase 1 (Environment Setup)
3. **Test**: Use `http://localhost:3000/api-status` for validation
4. **Deploy**: Follow Phase 10 for production readiness

**The frontend is waiting and ready to integrate! 🎯** 