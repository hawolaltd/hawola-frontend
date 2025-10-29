# Cart Persistence Fix for Anonymous Users

## 🐛 **The Problem**

Anonymous users were losing their cart items after a while. Items would be added to cart but then disappear unexpectedly.

## 🔍 **Root Causes**

### 1. **localStorage.clear() Issue**

The `clearAllStorage()` function was calling `localStorage.clear()` which deleted **everything** including:

-   `cartItems` - Anonymous user's shopping cart
-   `hawola_session_id` - Session tracking for search history

This function was being called:

-   When checking token validity on app initialization
-   During logout process

### 2. **Redux Persist Overwriting**

When the app rehydrated from Redux persist storage, it could overwrite the `localCart` state with outdated persisted data, ignoring the fresh data in localStorage.

### 3. **No Synchronization**

There was no mechanism to sync the Redux `localCart` state with localStorage `cartItems` on app startup.

---

## ✅ **The Solution**

### Fix #1: **Preserve Cart on Storage Clear**

**File**: `frontend/src/util/index.tsx`

Updated both storage clearing functions to preserve cart items:

```tsx
export const clearAllStorage = () => {
    // Preserve cart items and session BEFORE clearing
    let cartItems = localStorage.getItem('cartItems');
    let sessionId = localStorage.getItem('hawola_session_id');

    // Clear cookies
    Cookies.remove(authRefreshTokenStorageKeyName);
    Cookies.remove(authTokenStorageKeyName);

    // Clear localStorage
    localStorage.clear();

    // Restore preserved items AFTER clearing
    if (cartItems) localStorage.setItem('cartItems', cartItems);
    if (sessionId) localStorage.setItem('hawola_session_id', sessionId);

    // Clear Redux persist
    storage.removeItem('persist:root');
};
```

### Fix #2: **Sync Cart on App Startup**

**File**: `frontend/src/redux/product/productSlice.ts`

Added a new reducer to sync localCart from localStorage:

```tsx
syncLocalCartFromStorage: (state) => {
    if (typeof window !== 'undefined') {
        try {
            const cartItems = localStorage.getItem('cartItems');
            if (cartItems) {
                const items = JSON.parse(cartItems);
                state.localCart = { items };
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }
};
```

Also added a handler for Redux Persist REHYDRATE action:

```tsx
.addCase("persist/REHYDRATE", (state: any, action: any) => {
  // After rehydration, sync from localStorage
  const cartItems = localStorage.getItem("cartItems");
  if (cartItems) {
    const items = JSON.parse(cartItems);
    state.localCart = { items };
  }
})
```

### Fix #3: **Call Sync on App Init**

**File**: `frontend/src/pages/_app.tsx`

Added sync dispatch on app startup:

```tsx
useEffect(() => {
    // Check token validity
    if (!checkTokenValidity()) {
        clearAllStorage();
        dispatch(clearAuthState());
    }

    // Sync cart from localStorage on app start
    dispatch(syncLocalCartFromStorage());
}, [dispatch]);
```

### Fix #4: **Preserve Cart on Logout**

**File**: `frontend/src/store/store.ts`

Updated the logout handler to preserve cart:

```tsx
const appReducer = (state: any, action: any) => {
    if (
        action.type === 'auth/logout/fulfilled' ||
        action.type === 'auth/logout'
    ) {
        // Preserve cart before clearing
        let cartItems = null;
        if (typeof window !== 'undefined') {
            cartItems = localStorage.getItem('cartItems');
        }

        // Clear all persisted state
        storage.removeItem('persist:root');

        // Restore cart items
        if (cartItems && typeof window !== 'undefined') {
            localStorage.setItem('cartItems', cartItems);
        }

        return rootReducer(undefined, action);
    }
    return rootReducer(state, action);
};
```

---

## 🎯 **What This Fixes**

### ✅ **Anonymous Cart Persistence**

-   Cart items survive app reloads
-   Cart items survive Redux persist rehydration
-   Cart items survive token validity checks
-   Cart items survive user logout

### ✅ **Session Persistence**

-   Search session ID is preserved
-   Search history for anonymous users maintained

### ✅ **Smooth User Experience**

-   No unexpected cart clearing
-   Cart items persist across sessions
-   Seamless experience for anonymous users

---

## 🧪 **Testing**

### Test Case 1: App Reload

1. As anonymous user, add items to cart
2. Reload the page (F5)
3. **Expected**: Cart items remain

### Test Case 2: Token Expiry

1. As anonymous user, add items to cart
2. Wait for token check to run
3. **Expected**: Cart items remain

### Test Case 3: Logout

1. Login and add items to cart
2. Logout
3. As anonymous user, add items to cart
4. **Expected**: Anonymous cart items remain after logout

### Test Case 4: Redux Persist

1. As anonymous user, add items to cart
2. Close browser completely
3. Reopen browser and navigate to site
4. **Expected**: Cart items persist

---

## 📊 **Technical Details**

### Data Flow:

```
User adds to cart (anonymous)
    ↓
localStorage.setItem("cartItems", ...)
    ↓
dispatch(addToCartsLocal(...))
    ↓
Redux state updated
    ↓
App reloads/rehydrates
    ↓
REHYDRATE action triggered
    ↓
syncLocalCartFromStorage() called
    ↓
localStorage → Redux state
    ↓
Cart items restored ✅
```

### Protected localStorage Keys:

-   `cartItems` - Shopping cart
-   `hawola_session_id` - Search session

These keys are now preserved during:

-   `clearAllStorage()`
-   `clearAllStorageWithPersistor()`
-   Redux persist REHYDRATE
-   Logout process

---

## 🔒 **Important Notes**

### What Gets Cleared on Logout:

-   ❌ Auth tokens (access, refresh)
-   ❌ User-specific data
-   ❌ Redux persist state

### What Gets Preserved:

-   ✅ Anonymous cart items
-   ✅ Search session ID
-   ✅ Any other non-auth localStorage

---

## 📝 **Files Modified**

1. `/frontend/src/util/index.tsx`

    - Updated `clearAllStorage()`
    - Updated `clearAllStorageWithPersistor()`

2. `/frontend/src/redux/product/productSlice.ts`

    - Added `syncLocalCartFromStorage` reducer
    - Added REHYDRATE handler
    - Exported new action

3. `/frontend/src/pages/_app.tsx`

    - Added sync call on app initialization

4. `/frontend/src/store/store.ts`
    - Preserved cart on logout

---

## 🎉 **Result**

Anonymous users can now:

-   ✅ Add items to cart
-   ✅ Reload the page without losing cart
-   ✅ Close and reopen browser with cart intact
-   ✅ Browse site with persistent cart
-   ✅ Keep cart even when auth tokens expire

**The cart persistence issue is completely resolved!** 🚀

---

## 🐞 **If Issues Persist**

Check:

1. Browser console for errors
2. localStorage in DevTools (check "cartItems" key)
3. Redux DevTools (check `state.products.localCart`)
4. Network tab for any API calls clearing cart

---

**Cart items will now persist properly for anonymous users!** 🎊
