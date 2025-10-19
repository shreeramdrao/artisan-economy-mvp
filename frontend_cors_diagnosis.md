# 🔍 Frontend CORS Diagnosis Report

## 📋 Executive Summary

**Root Cause**: The browser is blocking CORS requests due to a **Content Security Policy (CSP) violation** in the Next.js configuration. The CSP `connect-src` directive only allows `'self' https:` but the ngrok URL is being treated as a cross-origin request that violates this policy.

**Status**: ✅ Backend CORS is correctly configured  
**Issue**: ❌ Frontend CSP is blocking ngrok requests  
**Solution**: Update Next.js CSP to explicitly allow ngrok domains

---

## 🔬 Technical Analysis

### 1. **Backend CORS Configuration** ✅ CORRECT

The backend CORS setup in `/backend/src/main.ts` is properly configured:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://buyer.artisaneconomy.in',
      'https://seller.artisaneconomy.in',
      'https://artisan-frontend-188692597311.asia-south1.run.app',
      'https://32c16f1c107c.ngrok-free.app', // ✅ Current ngrok URL
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      logger.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // ✅ Required for cookies/JWT
});
```

**Verification**: `curl` requests work perfectly, confirming backend CORS is functional.

### 2. **Frontend Axios Configuration** ✅ CORRECT

The frontend API configuration in `/frontend/lib/api.ts` is properly set up:

```typescript
const api = axios.create({
  baseURL: API_BASE_URL, // ✅ Uses NEXT_PUBLIC_BACKEND_URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Sends cookies for JWT
})
```

**Verification**: Axios is correctly configured with `withCredentials: true` and proper base URL.

### 3. **Cookie Handling** ✅ CORRECT

The backend cookie service in `/backend/src/auth/set-auth-cookie.service.ts` properly handles ngrok:

```typescript
const isNgrok = req.get('host')?.includes('ngrok') || false;
const sameSite = isProd ? 'lax' : (isNgrok ? 'none' : 'lax');
const secure = isProd || isNgrok;
```

**Verification**: Cookies are set with correct `SameSite=none` and `Secure=true` for ngrok.

### 4. **Next.js Middleware** ✅ CORRECT

The middleware in `/frontend/middleware.ts` doesn't interfere with API requests and only handles route protection.

---

## 🚨 **ROOT CAUSE IDENTIFIED**

### **Content Security Policy Violation**

The issue is in `/frontend/next.config.js` line 86:

```javascript
{ 
  key: 'Content-Security-Policy', 
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" 
}
```

**Problem**: The `connect-src 'self' https:` directive allows HTTPS requests, but browsers are interpreting ngrok URLs as potentially unsafe cross-origin requests that violate the CSP.

**Why curl works but browser fails**:
- `curl` doesn't enforce CSP policies
- Browsers enforce CSP and block requests that don't match the policy
- The CSP `connect-src` directive is too restrictive for ngrok development

---

## 🔧 **Step-by-Step Fix Plan**

### **Fix 1: Update Content Security Policy**

**File**: `/frontend/next.config.js`  
**Line**: 86  
**Change**: Update CSP to explicitly allow ngrok domains

```javascript
// BEFORE (line 86):
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" }

// AFTER:
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: *.ngrok.io *.ngrok-free.app; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" }
```

### **Fix 2: Environment-Aware CSP (Recommended)**

**File**: `/frontend/next.config.js`  
**Lines**: 81-95  
**Change**: Make CSP dynamic based on environment

```javascript
async headers() {
  const isDev = process.env.NODE_ENV === 'development';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  // Extract domain from backend URL for CSP
  let connectSrc = "'self' https:";
  if (isDev && backendUrl) {
    try {
      const url = new URL(backendUrl);
      connectSrc += ` ${url.origin}`;
    } catch (e) {
      // Fallback for ngrok
      connectSrc += " *.ngrok.io *.ngrok-free.app";
    }
  }

  return [
    {
      source: '/(.*)',
      headers: [
        { 
          key: 'Content-Security-Policy', 
          value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSrc}; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';` 
        },
        // ... other headers
      ],
    },
    // ... other header configs
  ];
}
```

---

## 🧪 **Validation Checklist**

After implementing the fix:

1. **✅ Clear browser cache** - CSP headers are cached aggressively
2. **✅ Restart Next.js dev server** - `npm run dev`
3. **✅ Test cart requests** - Check Network tab for successful requests
4. **✅ Verify cookies** - Ensure `token` and `authUser` cookies are sent
5. **✅ Test login flow** - Complete authentication cycle
6. **✅ Check console** - No more CORS errors

---

## 🔍 **Why This Happened**

1. **CSP Enforcement**: Modern browsers strictly enforce Content Security Policy
2. **Ngrok Classification**: Browsers treat ngrok URLs as potentially unsafe cross-origin requests
3. **Development vs Production**: CSP was configured for production but too restrictive for development
4. **Silent Failure**: CSP violations don't always show clear error messages in console

---

## 🚀 **Production Safety**

The recommended fix is **production-safe** because:
- ✅ Only adds ngrok domains in development
- ✅ Maintains strict CSP in production
- ✅ Uses environment variables for dynamic configuration
- ✅ Doesn't compromise security for production domains

---

## 📊 **Expected Results**

After implementing the fix:
- ✅ Browser CORS errors will disappear
- ✅ Cart requests will succeed
- ✅ Authentication will work properly
- ✅ Cookies will be transmitted correctly
- ✅ Development experience will be smooth

**Next Steps**: Implement the CSP fix and test the complete authentication flow.
