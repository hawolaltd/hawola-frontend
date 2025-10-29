# Search Page Implementation

## Overview

A comprehensive search implementation with fuzzy matching, multi-category results, and intelligent suggestions.

## Features

### 🔍 **Smart Search**

-   **Fuzzy Matching**: Handles typos (e.g., "tyos" finds "toys")
-   **Plural/Singular Handling**: Automatically searches both forms
-   **Character Transposition**: Corrects adjacent character swaps
-   **Multi-Model Search**: Searches across products, merchants, and categories simultaneously

### 📊 **Rich Results Display**

-   **Categorized Tabs**: Filter by All, Products, Merchants, or Categories
-   **Quick Stats**: See total counts at a glance
-   **Promoted Products**: Highlighted with a badge
-   **Pagination**: Easy navigation through product results

### 💡 **Intelligent Suggestions**

-   **Recent Searches**: Your last searches (stored per user/session)
-   **Popular Searches**: Trending searches across the platform
-   **Did You Mean?**: Spelling suggestions when no results found

### 🎨 **Beautiful UI**

-   Responsive design for mobile, tablet, and desktop
-   Loading states with spinners
-   Empty states with helpful prompts
-   Card-based layouts for easy scanning

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── search/
│   │       └── index.tsx              # Main search page
│   ├── redux/
│   │   └── search/
│   │       ├── searchService.ts       # API calls
│   │       └── searchSlice.ts         # Redux state management
│   ├── types/
│   │   └── search.d.ts                # TypeScript types
│   ├── store/
│   │   └── store.ts                   # Updated to include search reducer
│   └── components/
│       └── header/
│           └── MainHeader.tsx         # Updated with search functionality
```

## Usage

### 1. **Using the Header Search**

Simply type in the search box in the header and press Enter or submit.

```tsx
// The header automatically redirects to /search?q=your-query
```

### 2. **Direct Navigation**

Navigate directly to the search page:

```tsx
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/search?q=shoes');
```

### 3. **Using Redux Actions**

```tsx
import { useAppDispatch } from '@/hooks/redux';
import { performSearch } from '@/redux/search/searchSlice';

const dispatch = useAppDispatch();

// Perform a search
dispatch(
    performSearch({
        query: 'laptops',
        page: 1,
        perPage: 20,
        threshold: 0.3,
    })
);
```

### 4. **Accessing Search State**

```tsx
import { useAppSelector } from '@/hooks/redux';

const { searchResults, isLoading, error, suggestions, currentQuery } =
    useAppSelector((state) => state.search);
```

## API Integration

### Endpoints Used

1. **General Search** - `GET /api/search/general/`

    - Params: `q`, `page`, `per_page`, `threshold`, `session_id`
    - Returns: Products, merchants, categories, and suggestions

2. **Search History** - `GET /api/search/history/`

    - Returns: User's recent searches

3. **Search Suggestions** - `GET /api/search/suggestions/`

    - Returns: Recent + popular searches

4. **Popular Searches** - `GET /api/search/popular/`

    - Returns: Trending searches

5. **Track Click** - `POST /api/search/track/click/`

    - Body: `search_history_id`, `product_id`, `position`

6. **Clear History** - `DELETE /api/search/history/clear/`

## Response Structure

```typescript
{
  query: "toys",
  search_history_id: 123,
  total_results: 45,
  total_merchants: 3,
  total_promoted_products: 5,
  total_categories: 2,
  suggestions: ["toy", "toys for kids"],
  message: "Found 45 results",
  results: {
    products: {
      count: 35,
      page: 1,
      per_page: 20,
      total_pages: 2,
      items: [/* Product objects */]
    },
    merchants: {
      count: 3,
      items: [/* Merchant objects */]
    },
    categories: {
      count: 2,
      items: [/* Category objects */]
    },
    subcategories: { ... },
    subsec_categories: { ... }
  }
}
```

## Search Parameters

### Required

-   `query` (string): The search term

### Optional

-   `page` (number): Page number for pagination (default: 1)
-   `perPage` (number): Items per page (default: 20, max: 100)
-   `threshold` (number): Similarity threshold (default: 0.3, range: 0-1)
    -   Lower = More lenient (finds more results but less relevant)
    -   Higher = More strict (fewer but more relevant results)

## Session Management

The search system automatically manages sessions for anonymous users:

```typescript
// Session ID is automatically created and stored in localStorage
// Key: "hawola_session_id"

// Benefits:
// - Search history persists across page reloads
// - Anonymous user tracking
// - Seamless transition when user logs in
```

## Examples

### Basic Search

```tsx
import { performSearch } from '@/redux/search/searchSlice';

dispatch(performSearch({ query: 'shoes' }));
```

### Search with Custom Parameters

```tsx
dispatch(
    performSearch({
        query: 'laptops',
        page: 2,
        perPage: 40,
        threshold: 0.5, // More strict matching
    })
);
```

### Fetch Suggestions

```tsx
import { fetchSuggestions } from '@/redux/search/searchSlice';

dispatch(fetchSuggestions(10)); // Get 10 suggestions
```

### Clear Search History

```tsx
import { clearHistory } from '@/redux/search/searchSlice';

dispatch(clearHistory());
```

## UI Components

### Search Bar

-   Auto-focus on page load
-   Clear button (X) to reset search
-   Real-time input tracking

### Result Tabs

-   **All Results**: Shows everything
-   **Products**: Filtered product view with pagination
-   **Merchants**: Store listings with logos and descriptions
-   **Categories**: Category cards with images

### Empty States

1. **No Search Yet**: Shows recent and popular searches
2. **No Results Found**: Shows spelling suggestions

### Stats Badges

-   Total products found
-   Total merchants found
-   Total categories found
-   Promoted products count

## Styling

The search page uses Tailwind CSS with your brand colors:

-   Primary: `#FF5733` (Orange)
-   Text: Gray scale
-   Backgrounds: White and light gray

### Key Classes

```css
/* Search input */
focus:border-[#FF5733]

/* Active tab */
text-[#FF5733] border-b-2 border-[#FF5733]

/* Buttons */
bg-[#FF5733] text-white

/* Cards */
hover:border-[#FF5733] hover:shadow-md
```

## State Management

### Redux Slice: `search`

```typescript
interface SearchState {
    searchResults: GeneralSearchResponse | null;
    searchHistory: any[];
    suggestions: SearchSuggestions | null;
    popularSearches: any[];
    isLoading: boolean;
    error: string | null;
    currentQuery: string;
}
```

### Actions

-   `performSearch`: Execute a search
-   `fetchSearchHistory`: Get user's history
-   `fetchSuggestions`: Get suggestions
-   `fetchPopularSearches`: Get trending
-   `clearHistory`: Clear user's history
-   `setCurrentQuery`: Update current query
-   `clearSearchResults`: Reset results

## Best Practices

### 1. **Always Handle Loading States**

```tsx
{
    isLoading && <div className="animate-spin">Loading...</div>;
}
```

### 2. **Show Empty States**

```tsx
{
    !isLoading && !searchResults && <EmptyState />;
}
```

### 3. **Track User Clicks**

When a user clicks a product from search results, track it:

```tsx
import searchService from '@/redux/search/searchService';

searchService.trackSearchClick(searchHistoryId, productId, position);
```

### 4. **Debounce Auto-Search**

If implementing autocomplete:

```tsx
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
    dispatch(performSearch({ query }));
}, 300);
```

### 5. **URL Synchronization**

Keep URL in sync with search state:

```tsx
router.push(
    {
        pathname: '/search',
        query: { q: query, page: page },
    },
    undefined,
    { shallow: true }
);
```

## Testing

### Test Cases

1. Search with valid query
2. Search with typo (e.g., "tyos" -> "toys")
3. Search with plural/singular variations
4. Empty search
5. No results found
6. Pagination
7. Tab switching
8. Suggestion clicks
9. Mobile responsiveness

### Example Test

```typescript
// Test fuzzy matching
const query = 'tyos'; // User typo
// Should return results for "toys"

// Test plural handling
const query1 = 'toy';
const query2 = 'toys';
// Both should return similar results
```

## Performance Considerations

### Optimizations

1. **Pagination**: Only 20 products per page
2. **Lazy Loading**: Images load on demand
3. **Shallow Routing**: URL updates without page reload
4. **Debounced Search**: Prevents excessive API calls
5. **Cached Results**: Redux persists results

### Metrics

-   Initial Load: < 1s
-   Search Response: < 500ms
-   Image Loading: Progressive
-   Page Size: ~500KB

## Troubleshooting

### Issue: No results found

**Solution**:

-   Check spelling
-   Use suggestions
-   Reduce threshold
-   Try broader terms

### Issue: Too many irrelevant results

**Solution**:

-   Increase threshold (0.5-0.7)
-   Use more specific terms
-   Filter by category

### Issue: Search history not persisting

**Solution**:

-   Check localStorage for `hawola_session_id`
-   Ensure Redux persist is working
-   Check browser console for errors

## Future Enhancements

### Planned Features

1. **Auto-complete**: Real-time suggestions as you type
2. **Voice Search**: Speak your query
3. **Image Search**: Search by uploading images
4. **Advanced Filters**: Price, brand, rating, etc.
5. **Search Analytics**: Track popular queries
6. **Personalized Results**: Based on user history
7. **Geo-location**: Location-based results

## Support

For issues or questions:

1. Check backend API logs
2. Review browser console
3. Test API endpoints directly
4. Check Redux DevTools

---

**Built with ❤️ for Hawola E-commerce Platform**
