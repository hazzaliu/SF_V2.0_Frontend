# Backend Quick Start Guide

## 🚀 Getting Started

### 1. Minimum Viable API (MVP)
To get the frontend working immediately, implement these 3 endpoints first:

```
GET  /api/v1/projects/       → Return [] (empty array)
GET  /api/v1/methodologies/  → Return sample methodologies
GET  /api/v1/industries/     → Return sample industries
```

### 2. Sample Data Responses

**Methodologies** (`GET /api/v1/methodologies/`):
```json
[
  {"id": 1, "name": "In-Market Ad Testing", "description": "Test advertisement effectiveness", "sections_count": 5},
  {"id": 2, "name": "CX (Customer Experience)", "description": "Customer experience measurement", "sections_count": 5},
  {"id": 3, "name": "Choice Modelling", "description": "Discrete choice experiments", "sections_count": 4}
]
```

**Industries** (`GET /api/v1/industries/`):
```json
[
  {"id": 1, "name": "Technology"},
  {"id": 2, "name": "Healthcare"},
  {"id": 3, "name": "Retail"},
  {"id": 4, "name": "Finance"}
]
```

### 3. CORS Setup (CRITICAL!)
Without CORS, the frontend cannot connect. Add these headers:

```python
# Django example
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
```

### 4. Test Your API
1. Start your backend on `http://localhost:8000`
2. Test manually: `curl http://localhost:8000/api/v1/methodologies/`
3. Frontend test: Visit `http://localhost:3000/api-status`

## 📋 Implementation Priority

### Phase 1: Basic Connectivity
- [ ] CORS configuration
- [ ] Methodologies endpoint
- [ ] Industries endpoint  
- [ ] Empty projects list endpoint

### Phase 2: Project Management
- [ ] Create project endpoint
- [ ] Get project details
- [ ] Update project
- [ ] List projects with data

### Phase 3: Advanced Features
- [ ] File upload handling
- [ ] Questions management
- [ ] Authentication
- [ ] Performance optimization

## 🔧 Common Issues & Solutions

### Issue: CORS Errors
**Symptom**: Frontend shows "Network Error" or CORS policy errors
**Solution**: Add proper CORS headers (see CORS section above)

### Issue: 404 Not Found
**Symptom**: API endpoints return 404
**Solution**: Check URL patterns match `/api/v1/` prefix

### Issue: JSON Parsing Errors
**Symptom**: Frontend can't parse responses
**Solution**: Ensure `Content-Type: application/json` header is set

## 📁 Project Structure Example (Django)

```
backend/
├── api/
│   ├── models.py       # Project, Methodology, Industry models
│   ├── serializers.py  # DRF serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── settings.py         # CORS and database config
└── requirements.txt    # Dependencies
```

## 🛠 Essential Dependencies

**Django + DRF**:
```txt
django
djangorestframework
django-cors-headers
```

**FastAPI**:
```txt
fastapi
uvicorn
fastapi-cors
```

## 📞 Testing Commands

```bash
# Test endpoints manually
curl -X GET http://localhost:8000/api/v1/methodologies/
curl -X GET http://localhost:8000/api/v1/industries/
curl -X GET http://localhost:8000/api/v1/projects/

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8000/api/v1/projects/
```

## 🔗 Frontend Integration Points

1. **Environment Switch**: Change `NEXT_PUBLIC_DEV_MODE=false` in frontend `.env.local`
2. **API Status Page**: Visit `http://localhost:3000/api-status` to test integration
3. **Live Testing**: Create projects at `http://localhost:3000/projects/new`

## 📖 Full Documentation

See `BACKEND_INTEGRATION_SPEC.md` for complete API specification including:
- Detailed request/response formats
- Error handling standards  
- Authentication requirements
- File upload specifications
- Performance requirements 