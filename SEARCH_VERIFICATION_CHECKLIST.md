# Search Implementation Verification Checklist

## 🔍 Quick Verification Steps

Follow these steps to verify the search implementation is working correctly.

## ✅ Pre-Verification

### 1. Backend Running

```bash
cd backend
python manage.py runserver
```

-   [ ] Backend is running on `http://127.0.0.1:8000`
-   [ ] No errors in console
-   [ ] Admin accessible at `http://127.0.0.1:8000/admin`

### 2. Frontend Running

```bash
cd frontend
npm run dev
```

-   [ ] Frontend is running on `http://localhost:3000`
-   [ ] No build errors
-   [ ] Page loads successfully

### 3. Environment Variables

Check `frontend/.env`:

-   [ ] `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1/`
-   [ ] Other variables present

## 📋 Feature Verification

### A. Header Search

#### Test 1: Basic Header Search

1. [ ] Navigate to homepage `http://localhost:3000`
2. [ ] Locate search box in header
3. [ ] Type "toys" in search box
4. [ ] Press Enter
5. [ ] **Expected**: Redirects to `/search?q=toys`
6. [ ] **Expected**: Results display on search page

#### Test 2: Header Search with Special Characters

1. [ ] Type "men's shoes" in header
2. [ ] Press Enter
3. [ ] **Expected**: URL shows encoded query
4. [ ] **Expected**: Results display correctly

---

### B. Search Page

#### Test 1: Direct Navigation

1. [ ] Navigate to `http://localhost:3000/search`
2. [ ] **Expected**: Empty state displays
3. [ ] **Expected**: Search input is auto-focused
4. [ ] **Expected**: Recent searches show (if any)
5. [ ] **Expected**: Popular searches show (if any)

#### Test 2: Search Input

1. [ ] Type "laptop" in search box
2. [ ] Press Enter
3. [ ] **Expected**: Loading spinner appears
4. [ ] **Expected**: Results load within 1-2 seconds
5. [ ] **Expected**: Result count displays
6. [ ] **Expected**: Products show in grid

#### Test 3: Clear Search

1. [ ] After searching, click X button
2. [ ] **Expected**: Input clears
3. [ ] **Expected**: Returns to empty state
4. [ ] **Expected**: URL returns to `/search`

---

### C. Fuzzy Matching

#### Test 1: Typo Correction

1. [ ] Search for "tyos" (typo of "toys")
2. [ ] **Expected**: Finds toy products
3. [ ] **Expected**: Shows results despite typo

#### Test 2: Character Transposition

1. [ ] Search for "teh" (typo of "the")
2. [ ] **Expected**: Finds relevant products
3. [ ] **Expected**: May show spelling suggestions

#### Test 3: Character Removal

1. [ ] Search for "shrt" (missing 'i' from "shirt")
2. [ ] **Expected**: Finds shirt products
3. [ ] **Expected**: Shows reasonable results

---

### D. Plural/Singular Handling

#### Test 1: Singular to Plural

1. [ ] Search for "toy"
2. [ ] Note number of results
3. [ ] Search for "toys"
4. [ ] **Expected**: Similar or same results
5. [ ] **Expected**: Both return toy products

#### Test 2: Complex Plurals

1. [ ] Search for "baby"
2. [ ] **Expected**: Finds "baby" and "babies"
3. [ ] Search for "box"
4. [ ] **Expected**: Finds "box" and "boxes"

---

### E. Multi-Category Search

#### Test 1: Product Search

1. [ ] Search for a product name (e.g., "laptop")
2. [ ] **Expected**: Products tab shows results
3. [ ] **Expected**: Product count > 0
4. [ ] **Expected**: Products display in grid

#### Test 2: Merchant Search

1. [ ] Search for "merlin" (merchant name)
2. [ ] **Expected**: Merchants tab shows
3. [ ] **Expected**: Merchant count > 0
4. [ ] **Expected**: Merchant card displays with logo

#### Test 3: Category Search

1. [ ] Search for a category (e.g., "electronics")
2. [ ] **Expected**: Categories tab shows
3. [ ] **Expected**: Category count > 0
4. [ ] **Expected**: Category cards display

---

### F. Results Display

#### Test 1: Stats Badges

1. [ ] Perform any search
2. [ ] **Expected**: Total results count shows
3. [ ] **Expected**: Products badge shows (if products found)
4. [ ] **Expected**: Merchants badge shows (if merchants found)
5. [ ] **Expected**: Categories badge shows (if categories found)
6. [ ] **Expected**: Promoted badge shows (if promoted products)

#### Test 2: Tab Navigation

1. [ ] Perform search with multiple result types
2. [ ] Click "Products" tab
3. [ ] **Expected**: Only products show
4. [ ] Click "Merchants" tab
5. [ ] **Expected**: Only merchants show
6. [ ] Click "Categories" tab
7. [ ] **Expected**: Only categories show
8. [ ] Click "All Results" tab
9. [ ] **Expected**: All results show

---

### G. Pagination

#### Test 1: Multiple Pages

1. [ ] Search for "phone" or common term
2. [ ] **Expected**: If > 20 results, pagination shows
3. [ ] **Expected**: Page numbers display at bottom
4. [ ] Click page 2
5. [ ] **Expected**: URL updates to `?page=2`
6. [ ] **Expected**: New products load
7. [ ] **Expected**: Page 2 button is highlighted

#### Test 2: Direct Page Navigation

1. [ ] Navigate to `/search?q=phone&page=2`
2. [ ] **Expected**: Loads page 2 directly
3. [ ] **Expected**: Page 2 is highlighted

---

### H. Suggestions

#### Test 1: Popular Searches

1. [ ] Go to `/search` (empty)
2. [ ] **Expected**: "Popular Searches" section shows
3. [ ] **Expected**: Search terms displayed as chips
4. [ ] Click a popular search
5. [ ] **Expected**: Performs that search
6. [ ] **Expected**: Results display

#### Test 2: Recent Searches

1. [ ] Perform several searches
2. [ ] Return to `/search` (empty)
3. [ ] **Expected**: "Recent Searches" section shows
4. [ ] **Expected**: Your searches listed
5. [ ] Click a recent search
6. [ ] **Expected**: Performs that search again

#### Test 3: Spelling Suggestions

1. [ ] Search for complete nonsense: "xyzabc"
2. [ ] **Expected**: "No results found" displays
3. [ ] **Expected**: "Did you mean:" section shows (if similar exists)
4. [ ] Click a suggestion
5. [ ] **Expected**: Performs suggested search

---

### I. Responsive Design

#### Test 1: Mobile View

1. [ ] Open DevTools (F12)
2. [ ] Toggle device toolbar (mobile view)
3. [ ] Navigate to search page
4. [ ] **Expected**: Layout adjusts for mobile
5. [ ] **Expected**: Search bar is full width
6. [ ] **Expected**: Products stack in 1-2 columns
7. [ ] **Expected**: Tabs scroll horizontally
8. [ ] Perform a search
9. [ ] **Expected**: Everything works on mobile

#### Test 2: Tablet View

1. [ ] Set viewport to tablet (768px)
2. [ ] **Expected**: 2-3 columns for products
3. [ ] **Expected**: Tabs visible without scrolling
4. [ ] **Expected**: Merchant cards in 2 columns

#### Test 3: Desktop View

1. [ ] Return to desktop view (> 1024px)
2. [ ] **Expected**: 4 columns for products
3. [ ] **Expected**: Full layout visible
4. [ ] **Expected**: Proper spacing and alignment

---

### J. Loading States

#### Test 1: Search Loading

1. [ ] Perform a search
2. [ ] **Expected**: Loading spinner appears immediately
3. [ ] **Expected**: "Searching..." or spinner visible
4. [ ] **Expected**: UI doesn't freeze

#### Test 2: Image Loading

1. [ ] After search, scroll through products
2. [ ] **Expected**: Images load progressively
3. [ ] **Expected**: Broken images show placeholder
4. [ ] **Expected**: No infinite loading loops

---

### K. Error Handling

#### Test 1: Network Error

1. [ ] Stop backend server
2. [ ] Perform a search
3. [ ] **Expected**: Error message displays
4. [ ] **Expected**: No crash or blank page

#### Test 2: Empty Search

1. [ ] Try to submit empty search
2. [ ] **Expected**: Nothing happens OR validation message

#### Test 3: Invalid URL

1. [ ] Navigate to `/search?q=`
2. [ ] **Expected**: Shows empty state
3. [ ] **Expected**: No errors in console

---

### L. Session & History

#### Test 1: Anonymous Session

1. [ ] Open browser in incognito/private mode
2. [ ] Navigate to search page
3. [ ] Perform several searches
4. [ ] Check localStorage
5. [ ] **Expected**: `hawola_session_id` exists
6. [ ] Perform same search twice
7. [ ] **Expected**: Appears in recent searches

#### Test 2: Authenticated Session

1. [ ] Log in to your account
2. [ ] Perform searches
3. [ ] **Expected**: Searches saved to your account
4. [ ] Check `/search` empty state
5. [ ] **Expected**: Your recent searches show

---

### M. Product Interactions

#### Test 1: Product Click

1. [ ] Perform a search
2. [ ] Click on a product
3. [ ] **Expected**: Navigates to product detail page
4. [ ] **Expected**: Click is tracked (check backend logs)

#### Test 2: Merchant Click

1. [ ] Search returns merchants
2. [ ] Click on a merchant
3. [ ] **Expected**: Navigates to merchant page
4. [ ] **Expected**: URL shows merchant slug

---

### N. Performance

#### Test 1: Search Speed

1. [ ] Open DevTools → Network tab
2. [ ] Perform a search
3. [ ] Check API call timing
4. [ ] **Expected**: Response < 1 second
5. [ ] **Expected**: Page renders immediately after

#### Test 2: Page Load

1. [ ] Navigate to `/search?q=laptop`
2. [ ] Check Network tab
3. [ ] **Expected**: Initial load < 2 seconds
4. [ ] **Expected**: Images load progressively

---

### O. URL & Navigation

#### Test 1: URL Updates

1. [ ] Perform search for "shoes"
2. [ ] **Expected**: URL is `/search?q=shoes`
3. [ ] Click page 2
4. [ ] **Expected**: URL is `/search?q=shoes&page=2`
5. [ ] Click browser back button
6. [ ] **Expected**: Returns to page 1
7. [ ] **Expected**: Results still displayed

#### Test 2: Direct URL Access

1. [ ] Navigate directly to `/search?q=phone&page=2`
2. [ ] **Expected**: Loads phone search, page 2
3. [ ] **Expected**: All state is correct

#### Test 3: Bookmark & Share

1. [ ] Perform a search
2. [ ] Copy URL from address bar
3. [ ] Open in new tab
4. [ ] **Expected**: Same search results load

---

## 🎯 Critical Issues Checklist

If any of these fail, it's a blocker:

-   [ ] **Backend API is accessible**
-   [ ] **Search returns results for valid queries**
-   [ ] **Header search redirects to search page**
-   [ ] **Search page loads without errors**
-   [ ] **Products display in grid**
-   [ ] **Pagination works**
-   [ ] **Mobile view is functional**

## 🟢 All Tests Passed?

If all tests pass:

1. ✅ Search implementation is complete
2. ✅ All features are working
3. ✅ Ready for production use

## 🔴 Issues Found?

### Common Issues & Fixes

**Issue**: No results found

-   Check backend is running
-   Check API URL in .env
-   Check console for errors

**Issue**: Images not loading

-   Check product data has image URLs
-   Check image paths are correct
-   Check network tab for 404s

**Issue**: Pagination not working

-   Check total_pages in API response
-   Check URL updates with page param
-   Check Redux state updates

**Issue**: Typo correction not working

-   Check backend has pg_trgm extension
-   Check search variations logic
-   Test with backend API directly

## 📝 Test Results

Date: ******\_******

Tester: ******\_******

### Summary

-   Total Tests: 50+
-   Passed: **\_** / 50+
-   Failed: **\_** / 50+
-   Blocked: **\_** / 50+

### Critical Issues:

```
(List any critical issues here)
```

### Minor Issues:

```
(List any minor issues here)
```

### Notes:

```
(Add any additional notes here)
```

---

## 🚀 Ready for Production?

-   [ ] All critical tests passed
-   [ ] No major issues found
-   [ ] Performance is acceptable
-   [ ] Mobile works perfectly
-   [ ] Error handling is graceful

**Status**: ⬜ Not Ready | ⬜ Ready with Issues | ✅ Production Ready

---

**Verification completed by**: ******\_\_\_******

**Date**: ******\_\_\_******

**Sign-off**: ******\_\_\_******
