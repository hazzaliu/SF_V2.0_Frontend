# Frontend-Backend Connection Guide

## 🏗️ Current Frontend Setup Overview

### Project Structure
```
SF_V2.0_Frontend-main/
├── app/                          # Next.js 15 App Router
│   ├── api-status/              # API Health Monitoring Dashboard
│   ├── projects/                # Project management pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── api.ts                   # Main API client (SMART SWITCHING)
│   ├── api-config.ts           # Centralized API configuration
│   └── utils.ts
├── components/                  # Reusable UI components
├── types/                      # TypeScript definitions
├── public/                     # Static assets
└── [config files]
```

## 🔧 Environment Configuration

### Required .env.local File
Create this file in the frontend root directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEV_MODE=false

# Optional: CORS and Development Settings
NEXT_PUBLIC_ENABLE_API_LOGS=true
```

### Environment Variable Explanation:
- `NEXT_PUBLIC_API_BASE_URL`: Your Django backend URL
- `NEXT_PUBLIC_API_VERSION`: API version (currently v1)
- `NEXT_PUBLIC_DEV_MODE`: 
  - `true` = Uses mock data only
  - `false` = Uses real backend API with mock fallback

## 🔌 API Client Configuration

### Main API Client: `lib/api.ts`

The frontend uses a **SMART API CLIENT** that:
1. **Tries real backend first** when `NEXT_PUBLIC_DEV_MODE=false`
2. **Falls back to mock data** if backend is unavailable
3. **Uses only mock data** when `NEXT_PUBLIC_DEV_MODE=true`

Key features:
- Automatic error handling and fallback
- CORS-ready configuration
- Consistent TypeScript interfaces
- Built-in retry logic

### API Configuration: `lib/api-config.ts`

Centralized configuration with:
- Dynamic endpoint generation
- Environment-based URL construction
- Mock mode toggling
- Helper utilities

## 📡 API Endpoints Expected

### Base URL Structure:
```
http://localhost:8000/api/v1/
```

### Required Endpoints:

#### 1. Projects
```
GET    /api/v1/projects/              # List all projects
POST   /api/v1/projects/              # Create project
GET    /api/v1/projects/{id}/         # Get project details
PUT    /api/v1/projects/{id}/         # Update project
DELETE /api/v1/projects/{id}/         # Delete project
```

#### 2. Reference Data
```
GET    /api/v1/methodologies/         # List methodologies
GET    /api/v1/industries/            # List industries
```

#### 3. Questions & Sections
```
GET    /api/v1/projects/{id}/questions/    # Get project questions
POST   /api/v1/projects/{id}/questions/    # Add questions
```

#### 4. Document Generation
```
POST   /api/v1/projects/{id}/generate-document/   # Generate survey docs
```

## 📋 Expected Data Models

### Project Model
```typescript
interface Project {
  id: string
  project_name: string
  client_name: string
  project_number: string
  methodology_id: number
  methodology_name: string
  industry_id: number
  industry_name: string
  status: "Draft" | "In Progress" | "Completed"
  last_modified: string  // ISO date
  research_objectives: string
  sample_size: string
  question_count: number
  estimated_duration: string
  loi: number
  target_country: string
  survey_sections?: SurveySection[]
}
```

### Methodology Model
```typescript
interface Methodology {
  id: number
  name: string
  description: string
  sections_count: number
}
```

### Industry Model
```typescript
interface Industry {
  id: number
  name: string
}
```

## 🔄 API Response Format

### Expected JSON Response Format for List Endpoints:
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "...",
      "name": "...",
      // ... other fields
    }
  ]
}
```

### Expected JSON Response Format for Single Item Endpoints:
```json
{
  "id": "...",
  "name": "...",
  // ... other fields
}
```

### Error Response Format:
```json
{
  "error": "Error message",
  "status": "error",
  "code": 400
}
```

**Note**: The frontend automatically extracts the `results` array from paginated responses, so Django REST Framework's default pagination format is fully supported.

## 🛠️ CORS Configuration Needed

Your Django backend needs these CORS settings:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # Frontend development server
    "http://127.0.0.1:3000",   
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

## 🎯 Connection Steps

### Step 1: Backend Setup
1. Ensure Django server runs on `http://localhost:8000`
2. Configure CORS settings above
3. Implement the required API endpoints
4. Test endpoints with Postman (collection provided)

### Step 2: Frontend Setup
1. Create `.env.local` file with configuration above
2. Set `NEXT_PUBLIC_DEV_MODE=false` to use real API
3. Start frontend: `npm run dev`
4. Visit `http://localhost:3000/api-status` to monitor connection

### Step 3: Testing
1. **API Status Dashboard**: `http://localhost:3000/api-status`
   - Shows real-time API health
   - Tests all endpoints
   - Displays response times
2. **Main Application**: `http://localhost:3000`
   - Create/view projects
   - Test full workflows

## 🔍 Monitoring & Debugging

### API Status Dashboard
Visit `/api-status` to see:
- ✅ Backend connectivity status
- ⏱️ Response times for all endpoints
- 🔄 Real-time health checks
- 📊 API performance metrics

### Debug Mode
Set `NEXT_PUBLIC_ENABLE_API_LOGS=true` for detailed console logs.

### Fallback Behavior
- If backend is down → automatically uses mock data
- If specific endpoint fails → falls back for that endpoint only
- User sees toast notifications for API status changes

## 📁 Key Files to Review

1. **`lib/api.ts`** - Main API client with smart switching
2. **`lib/api-config.ts`** - Centralized configuration
3. **`app/api-status/page.tsx`** - API monitoring dashboard
4. **`types/index.ts`** - TypeScript interfaces
5. **`BACKEND_INTEGRATION_SPEC.md`** - Complete API specification

## 🚀 Quick Start Commands

```bash
# Frontend setup
cd SF_V2.0_Frontend-main
npm install
cp .env.example .env.local  # Create environment file
# Edit .env.local with your backend URL
npm run dev

# Test connection
open http://localhost:3000/api-status
```

## ⚡ Smart Features

1. **Automatic Fallback**: Never breaks, always shows data
2. **Environment Switching**: Easy dev/prod mode toggling
3. **Real-time Monitoring**: Built-in API health dashboard
4. **Error Handling**: Graceful degradation and user feedback
5. **TypeScript Safety**: Full type checking for API responses

## 📞 Next Steps

1. **Start your Django backend** on port 8000
2. **Create the .env.local file** with the settings above
3. **Test the API endpoints** using our Postman collection
4. **Check the API status dashboard** at `/api-status`
5. **Verify full integration** by creating a project

The frontend is **fully ready** for backend integration with smart fallback capabilities! 