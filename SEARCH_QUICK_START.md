# Search Implementation - Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### 1. Navigate to Search Page
```
http://localhost:3000/search
```

### 2. Or Use the Header Search
Type in the search box in the header and press Enter!

## 📝 Basic Usage Examples

### Search from Any Component

```tsx
import { useRouter } from 'next/router';

const MyComponent = () => {
  const router = useRouter();
  
  const handleSearch = (query: string) => {
    router.push(`/search?q=${query}`);
  };
  
  return (
    <button onClick={() => handleSearch('shoes')}>
      Search for Shoes
    </button>
  );
};
```

### Using Redux (Advanced)

```tsx
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { performSearch } from '@/redux/search/searchSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { searchResults, isLoading } = useAppSelector(state => state.search);
  
  const search = () => {
    dispatch(performSearch({ query: 'laptops' }));
  };
  
  return (
    <div>
      <button onClick={search}>Search</button>
      {isLoading && <p>Loading...</p>}
      {searchResults && <p>Found {searchResults.total_results} results</p>}
    </div>
  );
};
```

## 🎯 Key Features

### Fuzzy Matching
- **Typos**: "tyos" → finds "toys"
- **Plurals**: "toy" and "toys" give same results
- **Transpositions**: "teh" → finds "the"

### Multi-Category Search
Searches across:
- ✅ Products (name, brand, description)
- ✅ Merchants (store name, about, address)
- ✅ Categories (all levels)

### Smart Suggestions
- Recent searches (your history)
- Popular searches (trending)
- Spelling corrections (when no results)

## 📦 What's Included

### Files Created
```
frontend/
├── src/
│   ├── pages/search/index.tsx         ← Main search page
│   ├── redux/search/
│   │   ├── searchService.ts           ← API calls
│   │   └── searchSlice.ts             ← State management
│   ├── types/search.d.ts              ← TypeScript types
│   └── store/store.ts                 ← Updated with search
```

### Updated Files
- `components/header/MainHeader.tsx` - Added search functionality

## 🔧 Configuration

### Environment Variables
Already configured in your `.env`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1/
```

### Session Management
Automatic! Creates a session ID in localStorage:
- Key: `hawola_session_id`
- Used for: Search history tracking

## 📱 URL Structure

```
/search                           # Empty search page
/search?q=shoes                   # Search for "shoes"
/search?q=laptops&page=2          # Page 2 of results
/search?q=phones&page=1           # Explicit page 1
```

## 🎨 UI Elements

### Search Page Sections
1. **Search Bar** - Large, auto-focused input
2. **Stats Bar** - Shows total results and counts
3. **Tab Navigation** - Filter by All/Products/Merchants/Categories
4. **Results Grid** - Responsive card layout
5. **Pagination** - Navigate through products

### Empty States
- **Before Search**: Shows recent & popular searches
- **No Results**: Shows spelling suggestions

## 🔍 Search Parameters

```typescript
{
  query: string;      // Required: what to search for
  page?: number;      // Optional: page number (default: 1)
  perPage?: number;   // Optional: results per page (default: 20)
  threshold?: number; // Optional: match threshold (default: 0.3)
}
```

### Threshold Guide
- `0.1-0.3`: Very lenient (more results, less relevant)
- `0.3-0.5`: Balanced (recommended)
- `0.5-0.7`: Strict (fewer results, more relevant)

## 📊 Response Data

```typescript
searchResults = {
  query: "toys",
  total_results: 45,
  total_merchants: 3,
  total_promoted_products: 5,
  total_categories: 2,
  results: {
    products: { count, items, page, total_pages },
    merchants: { count, items },
    categories: { count, items }
  }
}
```

## ⚡ Quick Tips

### 1. Search is Automatic from Header
Users can search from any page using the header search box.

### 2. History is Tracked
Both logged-in and anonymous users get search history.

### 3. Mobile Friendly
The search page is fully responsive.

### 4. No Setup Required
Everything is already wired up and ready to use!

## 🧪 Testing

### Try These Searches
1. `toy` - Should find toys and related products
2. `tyos` - Should still find toys (typo correction)
3. `merlin` - Should find the Merlin merchant
4. `baby` - Should find both "baby" and "babies"
5. `shoe` - Should find both "shoe" and "shoes"

### Expected Results
- Products display in a grid
- Merchants show with store info
- Categories show with images
- Pagination appears if > 20 products

## 🐛 Debugging

### Check Redux State
Install Redux DevTools browser extension and inspect:
```
state.search.searchResults
state.search.isLoading
state.search.error
```

### Check API Calls
Open browser DevTools → Network tab:
- Look for: `GET /api/v1/search/general/`
- Status should be: `200 OK`
- Response should have: `total_results`, `results`, etc.

### Common Issues

**Issue**: "No results" for valid queries
- **Fix**: Check backend is running on port 8000
- **Fix**: Check `NEXT_PUBLIC_API_URL` in `.env`

**Issue**: Search history not saving
- **Fix**: Check localStorage for `hawola_session_id`
- **Fix**: Ensure Redux persist is working

**Issue**: Pagination not working
- **Fix**: Check URL updates with `page` param
- **Fix**: Check `total_pages` in response

## 📚 Learn More

For detailed documentation, see:
- `SEARCH_IMPLEMENTATION.md` - Full documentation
- `backend/searchfilter/GENERAL_SEARCH_API.md` - API docs
- `backend/searchfilter/SEARCH_IMPROVEMENTS.md` - Search features

## 🎉 You're Done!

The search is now fully functional:
1. ✅ Header search works
2. ✅ Search page exists at `/search`
3. ✅ Redux state management ready
4. ✅ API integration complete
5. ✅ Fuzzy matching enabled
6. ✅ History tracking active

### Next Steps
1. Visit `/search` to see it in action
2. Try some searches from the header
3. Test with typos and plurals
4. Enjoy the smart search! 🚀

---

**Need Help?** Check the main documentation or test the API endpoints directly!

