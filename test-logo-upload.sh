#!/bin/bash

# Logo Upload API Test Script
# Usage: ./test-logo-upload.sh [access_token] [image_path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
TOKEN="${1:-}"
IMAGE_PATH="${2:-}"

echo "================================"
echo "Logo Upload API Test"
echo "================================"
echo ""

# Check if token is provided
if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: Access token is required${NC}"
    echo "Usage: $0 <access_token> [image_path]"
    echo ""
    echo "To get your token:"
    echo "1. Login at http://localhost:3000/es/dashboard"
    echo "2. Open Browser DevTools > Console"
    echo "3. Run: localStorage.getItem('access_token')"
    exit 1
fi

# If no image path provided, create a test image
if [ -z "$IMAGE_PATH" ]; then
    echo -e "${YELLOW}No image provided, creating test image...${NC}"
    # Create a simple 100x100 red PNG using ImageMagick or base64 encoded pixel
    TEST_IMG="test-logo.png"
    
    # Try to use ImageMagick if available
    if command -v convert &> /dev/null; then
        convert -size 100x100 xc:red "$TEST_IMG"
        echo -e "${GREEN}✓ Created test image: $TEST_IMG${NC}"
    else
        echo -e "${RED}ImageMagick not found. Please provide an image path.${NC}"
        echo "Install: sudo apt-get install imagemagick"
        exit 1
    fi
    IMAGE_PATH="$TEST_IMG"
fi

# Check if image exists
if [ ! -f "$IMAGE_PATH" ]; then
    echo -e "${RED}Error: Image file not found: $IMAGE_PATH${NC}"
    exit 1
fi

echo "Configuration:"
echo "  API URL: $API_URL"
echo "  Token: ${TOKEN:0:20}..."
echo "  Image: $IMAGE_PATH"
echo ""

# Test 1: List existing branding assets
echo "================================"
echo "Test 1: List Existing Assets"
echo "================================"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/branding/assets")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ GET /api/branding/assets - Success${NC}"
    echo "Response:"
    echo "$body" | jq '.' || echo "$body"
    
    # Extract existing logo asset ID if any
    EXISTING_LOGO_ID=$(echo "$body" | jq -r '.assets[] | select(.asset_type == "logo") | .id' 2>/dev/null || echo "")
    if [ -n "$EXISTING_LOGO_ID" ]; then
        echo -e "${YELLOW}! Found existing logo asset: $EXISTING_LOGO_ID${NC}"
    fi
else
    echo -e "${RED}✗ Failed with status $http_code${NC}"
    echo "$body"
fi
echo ""

# Test 2: Upload new logo
echo "================================"
echo "Test 2: Upload Logo"
echo "================================"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -F "asset_type=logo" \
    -F "file=@$IMAGE_PATH" \
    "$API_URL/api/branding/upload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ POST /api/branding/upload - Success${NC}"
    echo "Response:"
    echo "$body" | jq '.' || echo "$body"
    
    # Extract asset details
    ASSET_ID=$(echo "$body" | jq -r '.id' 2>/dev/null || echo "")
    ASSET_URL=$(echo "$body" | jq -r '.url' 2>/dev/null || echo "")
    FILE_SIZE=$(echo "$body" | jq -r '.file_size' 2>/dev/null || echo "")
    
    echo ""
    echo "Asset Details:"
    echo "  ID: $ASSET_ID"
    echo "  URL: $ASSET_URL"
    echo "  Size: $FILE_SIZE bytes"
else
    echo -e "${RED}✗ Upload failed with status $http_code${NC}"
    echo "$body"
    exit 1
fi
echo ""

# Test 3: Apply branding
echo "================================"
echo "Test 3: Apply Branding"
echo "================================"
response=$(curl -s -w "\n%{http_code}" \
    -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"apply_logo": true}' \
    "$API_URL/api/branding/apply")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PUT /api/branding/apply - Success${NC}"
    echo "Response:"
    echo "$body" | jq '.' || echo "$body"
else
    echo -e "${RED}✗ Failed with status $http_code${NC}"
    echo "$body"
fi
echo ""

# Test 4: Verify logo is accessible
if [ -n "$ASSET_URL" ]; then
    echo "================================"
    echo "Test 4: Verify Logo URL"
    echo "================================"
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$ASSET_URL")
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Logo URL is accessible${NC}"
        echo "  URL: $ASSET_URL"
        echo "  Status: $http_code"
    else
        echo -e "${RED}✗ Logo URL returned status $http_code${NC}"
        echo "  URL: $ASSET_URL"
    fi
    echo ""
fi

# Test 5: Check theme includes logo
echo "================================"
echo "Test 5: Verify Theme Has Logo"
echo "================================"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/user/theme")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ GET /api/user/theme - Success${NC}"
    LOGO_URL=$(echo "$body" | jq -r '.logo_url' 2>/dev/null || echo "")
    
    if [ -n "$LOGO_URL" ] && [ "$LOGO_URL" != "null" ]; then
        echo -e "${GREEN}✓ Theme includes logo_url${NC}"
        echo "  logo_url: $LOGO_URL"
    else
        echo -e "${YELLOW}! Theme does not have logo_url set${NC}"
    fi
else
    echo -e "${RED}✗ Failed with status $http_code${NC}"
    echo "$body"
fi
echo ""

# Optional: Cleanup test image if we created it
if [ "$IMAGE_PATH" = "test-logo.png" ] && [ -f "test-logo.png" ]; then
    echo -e "${YELLOW}Cleaning up test image...${NC}"
    rm test-logo.png
fi

# Test 6: Optional - Delete logo (commented out by default)
# Uncomment to test deletion
# if [ -n "$ASSET_ID" ]; then
#     echo "================================"
#     echo "Test 6: Delete Logo (OPTIONAL)"
#     echo "================================"
#     read -p "Delete the uploaded logo? (y/N) " -n 1 -r
#     echo
#     if [[ $REPLY =~ ^[Yy]$ ]]; then
#         response=$(curl -s -w "\n%{http_code}" \
#             -X DELETE \
#             -H "Authorization: Bearer $TOKEN" \
#             "$API_URL/api/branding/assets/$ASSET_ID")
#         
#         http_code=$(echo "$response" | tail -n1)
#         body=$(echo "$response" | sed '$d')
#         
#         if [ "$http_code" -eq 200 ]; then
#             echo -e "${GREEN}✓ DELETE /api/branding/assets/$ASSET_ID - Success${NC}"
#         else
#             echo -e "${RED}✗ Failed with status $http_code${NC}"
#             echo "$body"
#         fi
#     fi
#     echo ""
# fi

echo "================================"
echo "Test Summary"
echo "================================"
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Check the dashboard at http://localhost:3000/es/dashboard"
echo "2. Navigate to Theme Studio"
echo "3. Verify the logo appears in the Branding section"
echo "4. Check the chat preview to see if logo is displayed"
echo ""
