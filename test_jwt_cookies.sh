#!/bin/bash

# JWT Cookie Authentication Test Script
# Tests cookie transmission and JWT validation for ngrok setup

echo "🧪 Testing JWT Cookie Authentication with ngrok"
echo "================================================"

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="https://32c16f1c107c.ngrok-free.app"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo "📋 Test Configuration:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend: $BACKEND_URL"
echo "  Test User: $TEST_EMAIL"
echo ""

# Test 1: Login and capture cookies
echo "🔐 Test 1: Login and capture cookies"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $FRONTEND_URL" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"buyer\"}")

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Test 2: Check if cookies were set
echo "🍪 Test 2: Check cookies file"
echo "-----------------------------"
if [ -f cookies.txt ]; then
  echo "Cookies file created:"
  cat cookies.txt
  echo ""
else
  echo "❌ No cookies file created"
  exit 1
fi

# Test 3: Test guest cart (should work without auth)
echo "🛒 Test 3: Guest cart endpoint"
echo "------------------------------"
GUEST_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/buyer/cart/guest" \
  -H "Origin: $FRONTEND_URL")

echo "Guest Cart Response: $GUEST_RESPONSE"
echo ""

# Test 4: Test authenticated cart with cookies
echo "🔒 Test 4: Authenticated cart with cookies"
echo "------------------------------------------"
AUTH_RESPONSE=$(curl -s -b cookies.txt -X GET "$BACKEND_URL/api/buyer/cart/$TEST_EMAIL" \
  -H "Origin: $FRONTEND_URL")

echo "Authenticated Cart Response: $AUTH_RESPONSE"
echo ""

# Test 5: Test with manual Authorization header (should work)
echo "🔑 Test 5: Manual Authorization header"
echo "---------------------------------------"
# Extract token from cookies file
TOKEN=$(grep -o 'token[[:space:]]*[^[:space:]]*' cookies.txt | cut -f2)
if [ -n "$TOKEN" ]; then
  MANUAL_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/buyer/cart/$TEST_EMAIL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: $FRONTEND_URL")
  echo "Manual Auth Response: $MANUAL_RESPONSE"
else
  echo "❌ No token found in cookies"
fi
echo ""

# Test 6: Test cookie attributes
echo "🍪 Test 6: Cookie attributes analysis"
echo "--------------------------------------"
echo "Checking cookie attributes in cookies.txt:"
grep "token" cookies.txt || echo "No token cookie found"
echo ""

# Cleanup
rm -f cookies.txt

echo "✅ Test completed!"
echo ""
echo "📊 Expected Results:"
echo "  - Login: Should return success with user data"
echo "  - Guest Cart: Should return empty cart or products"
echo "  - Authenticated Cart: Should return user's cart (not 401 error)"
echo "  - Manual Auth: Should work as fallback"
echo ""
echo "🔍 If authenticated cart fails:"
echo "  1. Check backend logs for JWT Guard debug info"
echo "  2. Verify cookie attributes (SameSite=none, Secure=true)"
echo "  3. Check CORS headers in response"
