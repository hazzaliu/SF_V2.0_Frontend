# Frontend-Backend Integration Documentation

This document outlines the complete integration between the SurveyForge frontend and backend, based on the API endpoints and user workflow specifications.

## Overview

The SurveyForge application follows a specific workflow:
1. **Landing Page** → Project Dashboard
2. **Project Creation** → Design Brief Upload
3. **Section Selection** → Methodology-based filtering
4. **Question Generation** → AI-powered with reprompting
5. **Export & Completion** → Multiple format support

## User Session Management

- **Primary Identifier**: `user_session_id` stored in localStorage
- **No Authentication**: Anonymous usage only
- **Session Header**: All API calls include `X-User-Session-Id` header
- **Implementation**: Handled automatically by the API client

## API Integration Details

### 1. Project Management

#### Create Project
- **Endpoint**: `POST /api/v1/projects/`
- **Frontend**: `/projects/new`
- **Requirements**: All fields required including design brief file
- **File Upload**: Handled via FormData with multipart/form-data
- **Navigation**: Redirects to sections page on success

#### List Projects
- **Endpoint**: `GET /api/v1/projects/`
- **Frontend**: `/projects`
- **Filtering**: Automatic by user session ID
- **Display**: Shows project cards with status indicators

#### Get Project Details
- **Endpoint**: `GET /api/v1/projects/{id}/`
- **Usage**: Used across all project-specific pages
- **Error Handling**: Redirects to dashboard if project not found

### 2. Section Selection Workflow

#### Load Available Sections
- **Endpoint**: `GET /api/v1/methodology-sections/`
- **Frontend**: `/projects/{id}/sections`
- **Filtering**: Client-side by selected methodology
- **Logic**: 
  - Load all methodology-section relationships
  - Filter by project's methodology
  - Pre-select required sections
  - Allow user to add/remove optional sections

#### Save Section Selection
- **Endpoint**: `POST /api/v1/projects/{id}/sections/`
- **Trigger**: When user clicks "Continue"
- **Data Format**:
  ```json
  {
    "sections": [
      {
        "section_template_id": "uuid",
        "custom_title": "Section Name",
        "position": 1,
        "ai_generated_notes": "",
        "loi": null
      }
    ],
    "replace_existing": true
  }
  ```

### 3. Question Generation & Management

#### Automatic Question Generation
- **Endpoint**: `POST /api/v1/generate-questions/`
- **Trigger**: Automatically when entering questions page
- **Per Section**: Separate API call for each selected section
- **Data Format**:
  ```json
  {
    "section_id": "uuid",
    "project_id": "uuid",
    "industry_context": "Technology",
    "brand_context": "From design brief",
    "additional_context": "Research objectives"
  }
  ```

#### Question Reprompting
- **Endpoint**: `POST /api/v1/reprompt-questions/`
- **Trigger**: User provides feedback and clicks "Generate Better Suggestions"
- **Individual Questions**: Applied to single questions only
- **Data Format**:
  ```json
  {
    "original_questions": [
      {
        "id": "question-id",
        "text": "Original question text",
        "type": "single-choice",
        "options": ["Option 1", "Option 2"]
      }
    ],
    "reprompt_instruction": "User feedback text",
    "section_id": "uuid",
    "project_id": "uuid"
  }
  ```

#### Reprompt Options
- **Endpoint**: `GET /api/v1/question-reprompt-options/`
- **Usage**: Provides preset reprompt suggestions
- **Display**: Shown as quick-select buttons in UI

#### Save Questions
- **Endpoint**: `POST /api/v1/projects/{id}/questions/`
- **Trigger**: When user clicks "Save" or "Continue"
- **Data Format**:
  ```json
  {
    "sections": [
      {
        "id": "section-id",
        "custom_title": "Section Name",
        "questions": [
          {
            "id": "question-id",
            "question_text": "Question text",
            "question_type": "single-choice",
            "position": 1,
            "is_required": true,
            "answer_options": [
              {
                "option_text": "Option 1",
                "position": 1
              }
            ]
          }
        ]
      }
    ]
  }
  ```

### 4. Section Ordering
- **Endpoint**: `POST /api/v1/projects/{id}/section_order/`
- **Trigger**: Immediately after any order change
- **Data Format**: `{ "section_ids": ["uuid1", "uuid2", "uuid3"] }`

### 5. Export Functionality
- **Endpoint**: `GET /api/v1/projects/{id}/export/?format={format}`
- **Formats**: docx, pdf, csv
- **Limitation**: One download at a time
- **Response**: Binary file download

## Error Handling Strategy

### API Error Types
1. **API_FAILURE**: Server errors, invalid requests
2. **NETWORK_TIMEOUT**: Request timeouts
3. **PARTIAL_DATA_LOSS**: Incomplete data scenarios

### User Experience
- **API Failures**: Show "API Failure" error prompt
- **Network Timeouts**: Show "Network Timeout" message  
- **Partial Data Loss**: Instruct user to start over
- **Retry Options**: Provided where appropriate

### Implementation
```typescript
try {
  const result = await apiCall(endpoint, options)
  return result
} catch (error) {
  if (error instanceof APIError) {
    // Handle specific error types
    switch (error.type) {
      case 'NETWORK_TIMEOUT':
        showError("Network timeout. Please check your connection.")
        break
      case 'API_FAILURE':
        showError("API failure. Please try again.")
        break
      default:
        showError("An error occurred. Please try again.")
    }
  }
  throw error
}
```

## Project Status Management

### Status Flow
1. **Draft**: Initial creation
2. **In Progress**: When questions are generated
3. **Completed**: When user clicks "Submit" before section ordering
4. **Exported**: When export is completed

### Automatic Updates
- Status changes are handled by the backend
- Frontend reflects status in project listings
- No manual status updates required

## Data Synchronization

### Real-time Updates
- **Not Implemented**: No live sync between sessions
- **Refresh Required**: Users must refresh to see changes
- **Local Storage**: Used for temporary data during workflow

### Offline Capability
- **Not Supported**: App requires internet connection
- **No Caching**: All data fetched fresh from API
- **Session Persistence**: Only user session ID persists

## Configuration

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_DEV_MODE=false  # Set to true for mock data
```

### API Client Configuration
- **Base URL**: Configurable via environment
- **Timeout**: 30 seconds for regular requests, 60 seconds for exports
- **Headers**: Automatic session ID injection
- **Error Handling**: Centralized error processing

## Testing Considerations

### API Integration Testing
1. **Health Check**: Verify API connectivity
2. **Session Management**: Test session ID handling
3. **File Uploads**: Test design brief uploads
4. **Question Generation**: Test AI endpoints
5. **Error Scenarios**: Test timeout and failure handling

### User Workflow Testing
1. **Complete Flow**: End-to-end project creation
2. **Section Selection**: Methodology filtering
3. **Question Editing**: Reprompting and manual edits
4. **Export Functions**: All format downloads
5. **Error Recovery**: Graceful error handling

## Performance Considerations

### API Call Optimization
- **Parallel Requests**: Multiple sections generate questions simultaneously
- **Caching**: Methodologies and industries cached in session
- **Debouncing**: User input debounced for API calls
- **Loading States**: Clear feedback during operations

### File Upload Optimization
- **Progress Tracking**: File upload progress indicators
- **Size Limits**: Frontend validation before upload
- **Format Validation**: File type checking
- **Error Recovery**: Clear error messages for upload failures

## Security Considerations

### Session Management
- **Anonymous Sessions**: No personal data stored
- **Session Isolation**: Projects filtered by session ID
- **No Authentication**: Simplified security model
- **Data Cleanup**: Sessions can be cleaned up server-side

### File Upload Security
- **Type Validation**: File type restrictions
- **Size Limits**: Maximum file size enforcement
- **Virus Scanning**: Should be implemented server-side
- **Storage Security**: Secure file storage practices

## Future Enhancements

### Potential Improvements
1. **Real-time Collaboration**: WebSocket integration
2. **Offline Support**: Service worker implementation
3. **Advanced Caching**: Redux/Zustand state management
4. **User Accounts**: Optional authentication system
5. **Advanced Analytics**: Usage tracking and optimization

### API Versioning
- **Current Version**: v1
- **Backward Compatibility**: Maintained for major versions
- **Migration Path**: Clear upgrade procedures
- **Documentation**: Version-specific documentation

---

This integration provides a robust, user-friendly survey creation workflow with comprehensive error handling and clear data flow between frontend and backend systems. 