# ⚠️ PAYSTACK CONFIGURATION ISSUE - IMPORTANT!

## 🔴 The Problem

You're using a **SECRET KEY** in your `.env` file:

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=sk_test_418c333a35f6e11ba5811959f2dc5b208e169549
```

**This is WRONG and DANGEROUS!**

### Why is this wrong?

1. **`sk_test_`** = Secret Key (for backend only)
2. **`pk_test_`** = Public Key (for frontend)

**Secret keys should NEVER be exposed in the frontend!** They can be used to perform unauthorized transactions.

---

## ✅ The Solution

### Step 1: Get Your Public Key

1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Find your **PUBLIC KEY** (starts with `pk_test_...` or `pk_live_...`)
3. Copy it

### Step 2: Update Your `.env` File

Update your `/Users/hawola/Envn/hawola/frontend/.env` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Token Keys
NEXT_PUBLIC_ACCESS_TOKEN=access_token
NEXT_PUBLIC_REFRESH_TOKEN=refresh_token

# Paystack Configuration
# Replace with YOUR actual public key from Paystack dashboard
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_ACTUAL_PUBLIC_KEY_HERE

# Google Maps API Key (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### Step 3: Restart Your Dev Server

```bash
cd frontend
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🔐 Security Reminder

### ✅ SAFE for Frontend:

-   Public keys: `pk_test_...` or `pk_live_...`
-   Public API URLs
-   Public configuration values

### ❌ NEVER in Frontend:

-   Secret keys: `sk_test_...` or `sk_live_...`
-   Database credentials
-   Private API keys

---

## 📝 Where to Find Your Keys

**Paystack Dashboard:**

-   Login: https://dashboard.paystack.com
-   Navigate: Settings → Developer
-   Look for: **Public Key** (not Secret Key)

---

## 🧪 Test vs Live Mode

-   **Test Mode**: `pk_test_...` (for development/testing)
-   **Live Mode**: `pk_live_...` (for production)

Use **test mode** during development!

---

## 🚨 URGENT: Revoke Your Secret Key!

Since you may have accidentally exposed your secret key:

1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Click **"Roll secret key"** to generate a new one
3. Update your backend with the new secret key
4. Keep secret keys ONLY on the backend/server

---

## ✅ After Setup

Once you've updated the `.env` file with the correct public key:

1. Restart the dev server
2. Try the checkout flow again
3. Paystack should initialize properly

---

**Need Help?**

Check Paystack documentation: https://paystack.com/docs/payments/accept-payments
