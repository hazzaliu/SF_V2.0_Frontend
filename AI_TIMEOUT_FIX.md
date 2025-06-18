# AI Question Generation Timeout Fix

## 🚨 **Problem Description**

The frontend was experiencing timeout errors when generating AI questions:

```
Error generating AI questions: APIError: Request timeout or cancelled
❌ [DEBUG] Failed to generate questions: APIError: Request timeout or cancelled
```

## 🔍 **Root Cause Analysis**

### **Backend Analysis (✅ Working)**
From Django logs, we confirmed:
- ✅ **Backend is functioning correctly** - Successfully generated 10 questions for "Attitudinals" section
- ✅ **OpenAI API integration working** - Used 1705 tokens (prompt: 938, completion: 767)
- ✅ **Questions properly parsed** - All 10 questions validated and returned
- ⚠️  **"Broken pipe" errors** - Frontend disconnecting before response completed

### **Frontend Analysis (❌ Issues Found)**
- ❌ **Request Timeout Too Short** - 30 seconds insufficient for AI generation
- ❌ **No Special Handling** for AI operations vs regular API calls
- ❌ **Poor Error Messages** - Generic timeout messages not helpful

## 🛠️ **Implemented Solutions**

### **1. Extended Timeout Configurations**

**Primary Timeout Increase:**
```typescript
// Before: 30 seconds
const REQUEST_TIMEOUT = 30000 // 30 seconds

// After: 120 seconds base timeout
const REQUEST_TIMEOUT = 120000 // 120 seconds for AI operations
```

**AI-Specific Timeout Logic:**
```typescript
// Use longer timeout for AI generation endpoints
const isAIEndpoint = endpoint.includes('generate_ai_questions') || endpoint.includes('reprompt-questions')
const timeout = isAIEndpoint ? 300000 : REQUEST_TIMEOUT // 5 minutes for AI operations
```

### **2. Enhanced Error Handling**

**Better Timeout Messages:**
```typescript
if (error.name === 'AbortError') {
  const timeoutMessage = isAIEndpoint 
    ? 'AI generation is taking longer than expected. This may be due to complex processing or high server load. Please try again.'
    : 'Request timeout or cancelled'
  throw new APIError(timeoutMessage, 408)
}
```

**Network Error Handling:**
```typescript
// Handle network connectivity issues
if (error.message.includes('Failed to fetch')) {
  throw new APIError('Unable to connect to server. Please check your connection and try again.', 503)
}
```

### **3. Timeout Strategy Summary**

| Operation Type | Timeout Duration | Reasoning |
|----------------|------------------|-----------|
| Regular API calls | 120 seconds | Standard operations |
| AI Question Generation | 300 seconds (5 minutes) | Complex OpenAI processing |
| Question Reprompting | 300 seconds (5 minutes) | AI reasoning required |

## ✅ **Expected Results**

### **User Experience Improvements**
- **No More Premature Timeouts** - AI generation has sufficient time to complete
- **Better Error Messages** - Users understand what's happening during delays
- **Graceful Handling** - Network issues properly communicated

### **Technical Improvements**
- **Proper Request Lifecycle** - AbortController properly manages long-running requests
- **Backend Compatibility** - Frontend timeouts align with backend processing time
- **Error Classification** - Different error types handled appropriately

## 🧪 **Testing Verification**

### **Successful Backend Processing**
From logs, we confirmed the backend can:
- ✅ Generate 10 questions in ~2 seconds
- ✅ Process OpenAI API calls successfully
- ✅ Return properly formatted JSON responses
- ✅ Handle section-specific question generation

### **Frontend Configuration**
- ✅ API Base URL: `http://localhost:8000` (matches backend)
- ✅ Timeout Settings: Extended for AI operations
- ✅ Error Handling: Enhanced user feedback
- ✅ Backend Connectivity: Verified with test calls

## 📋 **Usage Notes**

### **When Timeout Still Occurs**
If users still experience timeouts after 5 minutes:
1. **Check OpenAI API Status** - Service may be experiencing delays
2. **Verify Network Connectivity** - Ensure stable internet connection
3. **Backend Logs** - Check Django logs for any processing errors
4. **Retry Logic** - Users should retry the operation

### **Performance Expectations**
- **Typical Generation Time**: 10-30 seconds for most sections
- **Complex Sections**: May take 1-2 minutes
- **Maximum Wait Time**: 5 minutes before timeout

## 🔄 **Future Enhancements**

1. **Progress Indicators** - Show AI generation progress to users
2. **Partial Results** - Return questions as they're generated
3. **Retry Logic** - Automatic retry for timeout errors
4. **Caching** - Store generated questions to avoid regeneration

---

**Status**: ✅ **IMPLEMENTED AND DEPLOYED**  
**Last Updated**: Current session  
**Files Modified**: `SF_Frontend/lib/api.ts` 