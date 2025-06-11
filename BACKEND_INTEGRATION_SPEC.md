# SurveyForge Backend Integration Specification v2.0

## Overview

This document provides complete specifications for building a backend API that integrates seamlessly with the SurveyForge frontend. The frontend is built with Next.js 15 and expects a RESTful API with JSON responses.

**📋 For Implementation Checklist**: See `BACKEND_IMPLEMENTATION_CHECKLIST.md`

**🎯 Success Criteria**: When complete, users should be able to create, manage, and generate survey projects through a fully functional web application.

## Base Configuration

### API Base URL
- **Development**: `http://localhost:8000`
- **Production**: To be configured via environment variables
- **API Version**: `v1`
- **Base Path**: `/api/v1/`

### CORS Configuration
The backend must configure CORS to allow requests from:
- **Development**: `http://localhost:3000`
- **Production**: Your production domain

```python
# Django CORS settings example
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## Data Models

### Project Model
```typescript
interface Project {
  id: string
  project_name: string
  client_name: string
  project_number: string
  methodology_id: number | string
  methodology_name: string           // Auto-populated from methodology
  industry_id: number | string
  industry_name: string             // Auto-populated from industry
  status: "Draft" | "In Progress" | "Completed" | "Archived"
  last_modified: string             // ISO 8601 format
  research_objectives: string
  sample_size: string
  loi?: number                      // Length of Interview in minutes
  target_country: string
  sample_type?: string
  sample_profile?: string
  language_preference?: string
  addressable_market?: string
  streams?: string
  template_variables?: ProjectVariable[]
  design_brief_file_name?: string
  question_count: number            // Auto-calculated
  estimated_duration: string       // Auto-calculated (e.g., "3-4 min")
  survey_sections?: SurveySection[] // Optional, for detailed views
}

interface ProjectVariable {
  name: string
  value: string
}

interface SurveySection {
  id: string
  name: string
  order: number
  questions?: Question[]
}

interface Question {
  id: string
  question_number: string
  text: string
  type: "single-choice" | "multiple-choice" | "open-text" | "likert-scale" | "rating" | "ranking"
  options?: string[]
  is_required: boolean
  order: number
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

## API Endpoints

### 1. Projects Endpoints

#### GET `/api/v1/projects/`
**Purpose**: List all projects

**Response**: `200 OK`
```json
[
  {
    "id": "1",
    "project_name": "Brand Awareness Study Q4 2024",
    "client_name": "Acme Corp",
    "project_number": "PRJ-2024-001",
    "methodology_id": 1,
    "methodology_name": "In-Market Ad Testing",
    "industry_id": 1,
    "industry_name": "Technology",
    "status": "Completed",
    "last_modified": "2024-05-15T10:00:00Z",
    "research_objectives": "To measure brand awareness for the new product line.",
    "sample_size": "N=1000",
    "question_count": 4,
    "estimated_duration": "3-4 min",
    "loi": 4,
    "target_country": "US"
  }
]
```

#### GET `/api/v1/projects/{id}/`
**Purpose**: Get specific project details

**Response**: `200 OK`
```json
{
  "id": "1",
  "project_name": "Brand Awareness Study Q4 2024",
  "client_name": "Acme Corp",
  "project_number": "PRJ-2024-001",
  "methodology_id": 1,
  "methodology_name": "In-Market Ad Testing",
  "industry_id": 1,
  "industry_name": "Technology",
  "status": "Completed",
  "last_modified": "2024-05-15T10:00:00Z",
  "research_objectives": "To measure brand awareness for the new product line.",
  "sample_size": "N=1000",
  "question_count": 4,
  "estimated_duration": "3-4 min",
  "loi": 4,
  "target_country": "US",
  "template_variables": [
    {
      "name": "Product",
      "value": "Smart Watch Pro"
    }
  ],
  "survey_sections": [
    {
      "id": "s1",
      "name": "Brand Awareness & Recognition",
      "order": 1,
      "questions": [
        {
          "id": "q1",
          "question_number": "Q1",
          "text": "Which brands have you heard of?",
          "type": "multiple-choice",
          "options": ["Brand A", "Brand B", "Brand C"],
          "is_required": true,
          "order": 1
        }
      ]
    }
  ]
}
```

**Error Response**: `404 Not Found`
```json
{
  "detail": "Project not found"
}
```

#### POST `/api/v1/projects/`
**Purpose**: Create a new project

**Request Body**:
```json
{
  "project_name": "New Project Name",
  "client_name": "Client Corp",
  "project_number": "PRJ-2024-005",
  "methodology_id": 1,
  "industry_id": 2,
  "research_objectives": "Study objectives here",
  "sample_size": "N=500",
  "loi": 5,
  "target_country": "AU",
  "sample_type": "General Population",
  "sample_profile": "Adults 18-65",
  "language_preference": "en",
  "addressable_market": "Consumer Electronics",
  "streams": "Mobile, Desktop",
  "template_variables": [
    {
      "name": "Product",
      "value": "New Product"
    }
  ],
  "design_brief_file_name": "brief.pdf"
}
```

**Response**: `201 Created`
```json
{
  "id": "generated-id",
  "project_name": "New Project Name",
  "client_name": "Client Corp",
  "project_number": "PRJ-2024-005",
  "methodology_id": 1,
  "methodology_name": "In-Market Ad Testing",
  "industry_id": 2,
  "industry_name": "Healthcare",
  "status": "Draft",
  "last_modified": "2024-06-11T10:30:00Z",
  "research_objectives": "Study objectives here",
  "sample_size": "N=500",
  "question_count": 0,
  "estimated_duration": "TBD",
  "loi": 5,
  "target_country": "AU",
  "template_variables": [
    {
      "name": "Product",
      "value": "New Product"
    }
  ]
}
```

**Error Response**: `400 Bad Request`
```json
{
  "project_name": ["This field is required."],
  "client_name": ["This field is required."]
}
```

#### PUT `/api/v1/projects/{id}/`
**Purpose**: Update an existing project

**Request Body**: Same as POST (partial updates allowed)

**Response**: `200 OK` (same format as GET project)

**Error Responses**: 
- `404 Not Found` if project doesn't exist
- `400 Bad Request` for validation errors

#### DELETE `/api/v1/projects/{id}/`
**Purpose**: Delete a project

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

### 2. Methodologies Endpoints

#### GET `/api/v1/methodologies/`
**Purpose**: List all available methodologies

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "In-Market Ad Testing",
    "description": "Test advertisement effectiveness in real market conditions",
    "sections_count": 5
  },
  {
    "id": 2,
    "name": "CX (Customer Experience)",
    "description": "Comprehensive customer experience measurement and satisfaction modeling",
    "sections_count": 5
  }
]
```

### 3. Industries Endpoints

#### GET `/api/v1/industries/`
**Purpose**: List all available industries

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Technology"
  },
  {
    "id": 2,
    "name": "Healthcare"
  },
  {
    "id": 3,
    "name": "Retail"
  }
]
```

### 4. Questions Endpoints (Future Enhancement)

#### GET `/api/v1/projects/{id}/questions/`
**Purpose**: Get questions for a specific project

#### POST `/api/v1/projects/{id}/questions/`
**Purpose**: Add questions to a project

#### PUT `/api/v1/projects/{id}/questions/{question_id}/`
**Purpose**: Update a specific question

#### DELETE `/api/v1/projects/{id}/questions/{question_id}/`
**Purpose**: Delete a specific question

## File Upload Requirements

### Design Brief Upload
The frontend may send design brief files with project creation. Handle this via:

1. **Multipart Form Data**: Accept `multipart/form-data` requests
2. **File Field**: Look for `design_brief` file field
3. **Metadata**: The `design_brief_file_name` field contains the original filename
4. **Storage**: Store files securely and return accessible URLs if needed

Example handling in Django:
```python
def create_project(request):
    # Handle JSON data
    project_data = json.loads(request.POST.get('project_data'))
    
    # Handle file upload
    design_brief = request.FILES.get('design_brief')
    if design_brief:
        # Save file and update project_data
        file_path = save_uploaded_file(design_brief)
        project_data['design_brief_file_name'] = design_brief.name
        project_data['design_brief_url'] = file_path
```

## Error Handling Standards

### HTTP Status Codes
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

### Error Response Format
```json
{
  "detail": "Human readable error message",
  "field_errors": {
    "field_name": ["Field-specific error message"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

## Authentication (Future)

Currently, the frontend doesn't implement authentication, but prepare for:

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

### Token-based Authentication
- JWT tokens recommended
- Include user information in token payload
- Implement token refresh mechanism

## Performance Requirements

### Response Times
- List endpoints: < 500ms
- Detail endpoints: < 300ms
- Create/Update operations: < 1000ms

### Pagination
For large datasets, implement pagination:
```json
{
  "count": 150,
  "next": "http://api.example.com/projects/?page=2",
  "previous": null,
  "results": [...]
}
```

### Caching
Consider implementing caching for:
- Methodologies list (rarely changes)
- Industries list (rarely changes)
- Project lists (cache with appropriate TTL)

## Database Considerations

### Required Fields
- All `string` fields should have appropriate max_length
- `id` fields should be unique and indexed
- `last_modified` should auto-update on changes
- Foreign key relationships for methodology_id and industry_id

### Calculated Fields
- `question_count`: Count of questions in project
- `estimated_duration`: Based on question count and types
- `methodology_name`: Join with methodology table
- `industry_name`: Join with industry table

## Testing Requirements

### API Testing
Provide test endpoints or test data for:
- Empty states (no projects, etc.)
- Error conditions (invalid IDs, validation failures)
- Large datasets (performance testing)

### CORS Testing
Ensure CORS is properly configured by testing from:
- `http://localhost:3000` (development)
- Your production domain

## Deployment Considerations

### Environment Variables
Provide configuration for:
```
API_BASE_URL=http://localhost:8000
API_VERSION=v1
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://production-domain.com
```

### Health Check Endpoint
Implement a health check endpoint:
```
GET /api/health/
Response: {"status": "ok", "version": "1.0.0"}
```

## Frontend Integration Testing

The frontend includes an API status page at `/api-status` that will:
1. Test all endpoints for connectivity
2. Measure response times
3. Display sample responses
4. Show current configuration

Use this page to verify your API implementation.

## Sample Implementation (Django)

```python
# models.py
class Project(models.Model):
    project_name = models.CharField(max_length=200)
    client_name = models.CharField(max_length=200)
    project_number = models.CharField(max_length=50, unique=True)
    methodology = models.ForeignKey(Methodology, on_delete=models.CASCADE)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='Draft')
    last_modified = models.DateTimeField(auto_now=True)
    # ... other fields

    @property
    def methodology_name(self):
        return self.methodology.name

    @property
    def industry_name(self):
        return self.industry.name

# views.py
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

# urls.py
urlpatterns = [
    path('api/v1/projects/', ProjectListCreateView.as_view()),
    path('api/v1/projects/<str:pk>/', ProjectDetailView.as_view()),
    path('api/v1/methodologies/', MethodologyListView.as_view()),
    path('api/v1/industries/', IndustryListView.as_view()),
]
```

## Questions & Support

For questions about this specification or integration issues:
1. Check the frontend API status page at `/api-status`
2. Review the frontend code in `lib/api.ts` for exact request formats
3. Test with mock data first by setting `NEXT_PUBLIC_DEV_MODE=true`

## Advanced Features & Business Logic

### Survey Question Generation
The frontend expects AI-powered question generation. Implement endpoints for:
- **Methodology-based questions**: Generate questions based on selected methodology
- **Template variable substitution**: Replace placeholders like `[PRODUCT]` with actual values
- **Question validation**: Ensure question logic and flow is correct

### Document Generation
Users expect to export surveys in multiple formats:
- **DOCX**: Survey questionnaire document
- **PDF**: Professional survey document
- **CSV**: Question list for data processing

### Project Status Management
Projects should have proper status workflow:
- **Draft** → **In Progress** → **Completed** → **Archived**
- Auto-update `last_modified` timestamp
- Auto-calculate `question_count` and `estimated_duration`

### Data Validation Rules
- **Project numbers**: Must be unique across the system
- **LOI (Length of Interview)**: Should be reasonable (1-60 minutes)
- **Required fields**: Enforce business rules for project completion
- **Template variables**: Validate variable names and values

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate file uploads (type, size, content)
- Prevent SQL injection and XSS attacks

### File Upload Security
- Limit file types to: PDF, DOC, DOCX
- Maximum file size: 10MB
- Scan uploaded files for malware
- Store files securely outside web root

### Rate Limiting
- Implement rate limiting for API endpoints
- Prevent abuse of expensive operations (document generation)

## Database Schema Recommendations

### Core Tables
```sql
-- Projects table
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    project_number VARCHAR(50) UNIQUE NOT NULL,
    methodology_id INT NOT NULL,
    industry_id INT NOT NULL,
    status ENUM('Draft', 'In Progress', 'Completed', 'Archived') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    research_objectives TEXT,
    sample_size VARCHAR(100),
    loi INT,
    target_country VARCHAR(5),
    sample_type VARCHAR(100),
    sample_profile TEXT,
    language_preference VARCHAR(5) DEFAULT 'en',
    addressable_market TEXT,
    streams TEXT,
    design_brief_file_name VARCHAR(255),
    design_brief_url VARCHAR(500),
    question_count INT DEFAULT 0,
    estimated_duration VARCHAR(20) DEFAULT 'TBD',
    FOREIGN KEY (methodology_id) REFERENCES methodologies(id),
    FOREIGN KEY (industry_id) REFERENCES industries(id)
);

-- Template Variables (JSON or separate table)
CREATE TABLE project_variables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    variable_name VARCHAR(100) NOT NULL,
    variable_value TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Survey Sections
CREATE TABLE survey_sections (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    section_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Questions
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    question_number VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    type ENUM('single-choice', 'multiple-choice', 'open-text', 'likert-scale', 'rating', 'ranking') NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    question_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES survey_sections(id) ON DELETE CASCADE
);

-- Question Options
CREATE TABLE question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    option_order INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### Indexes for Performance
```sql
-- Essential indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_name);
CREATE INDEX idx_projects_modified ON projects(last_modified);
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_sections_project ON survey_sections(project_id);
```

## Integration Testing Scenarios

### Test Data Setup
Provide sample data for testing:
1. **3+ Methodologies** with different section counts
2. **10+ Industries** covering various sectors
3. **Sample projects** in different statuses
4. **Mock questions** for each question type

### Frontend Testing Flow
1. **API Status Check**: `/api-status` shows all green
2. **List Projects**: Empty and populated states
3. **Create Project**: With and without file upload
4. **Project Details**: Full project with questions
5. **Update Project**: Partial and full updates
6. **Error Handling**: Invalid data, missing resources

## Deployment Architecture

### Recommended Stack
- **Framework**: Django REST Framework or FastAPI
- **Database**: PostgreSQL (recommended) or MySQL
- **File Storage**: AWS S3 or local storage with CDN
- **Cache**: Redis for session and API caching
- **Queue**: Celery for background tasks (document generation)

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/surveyforge
REDIS_URL=redis://localhost:6379/0

# File Storage
MEDIA_ROOT=/app/media
MEDIA_URL=/media/
AWS_S3_BUCKET_NAME=surveyforge-files (if using S3)

# API Configuration
API_BASE_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Security
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,yourdomain.com

# Optional: AI Integration
OPENAI_API_KEY=your-openai-key (for question generation)
```

### Production Considerations
- **Load Balancing**: Use nginx or similar
- **SSL/TLS**: HTTPS certificates
- **Database Backups**: Automated daily backups
- **Monitoring**: Application and database monitoring
- **Logging**: Centralized logging system

## Error Handling & Logging

### Logging Requirements
```python
# Example logging configuration
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'surveyforge.log',
            'formatter': 'detailed',
        },
    },
    'formatters': {
        'detailed': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
    },
    'loggers': {
        'surveyforge': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

### Error Response Standards
All errors should include:
- **HTTP status code**
- **Error message** (user-friendly)
- **Error code** (for frontend handling)
- **Field-specific errors** (for forms)
- **Request ID** (for debugging)

## Performance Optimization

### Database Optimization
- Use connection pooling
- Implement query optimization
- Add appropriate indexes
- Use database-level constraints

### Caching Strategy
- **List endpoints**: Cache for 5-10 minutes
- **Static data**: Cache methodologies/industries for 1 hour
- **User sessions**: Use Redis for session storage

### API Response Optimization
- Implement pagination for large datasets
- Use compression (gzip)
- Optimize JSON serialization
- Consider GraphQL for complex queries

## Monitoring & Maintenance

### Health Checks
Implement comprehensive health checks:
- Database connectivity
- External service availability
- Disk space and memory usage
- API response times

### Backup Strategy
- **Database**: Daily automated backups
- **Files**: Incremental backup of uploaded files
- **Configuration**: Version control all config files

## Changelog

- **v2.0** (Current): Complete specification with database schema, security, deployment
- **v1.0**: Initial specification
- Future versions will be documented here as requirements evolve 