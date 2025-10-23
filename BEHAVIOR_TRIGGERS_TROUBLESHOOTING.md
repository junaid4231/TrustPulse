# 🔧 Behavior Triggers - Complete Fix & Troubleshooting

## ❌ **THE CRITICAL BUG**

### **Problem:**
Behavior triggers were **NOT working at all** - all notifications showing normally regardless of trigger settings.

### **Root Cause:**
**The API was not sending `behavior_triggers` data to the widget!**

---

## ✅ **THE FIX**

### **What Was Missing:**

The API route (`/api/widget/[id]/route.ts`) was fetching notifications from the database but **NOT including** the `behavior_triggers` field in the response.

### **Before (BROKEN):**
```typescript
// API Response
notifications: filtered.map((notification) => ({
  id: notification.id,
  type: notification.type,
  message: notification.message,
  // ... other fields ...
  reward_claimed_count: notification.reward_claimed_count || 0,
  // ❌ behavior_triggers MISSING!
}))
```

### **After (FIXED):**
```typescript
// API Response
notifications: filtered.map((notification) => ({
  id: notification.id,
  type: notification.type,
  message: notification.message,
  // ... other fields ...
  reward_claimed_count: notification.reward_claimed_count || 0,
  // ✅ behavior_triggers ADDED!
  behavior_triggers: notification.behavior_triggers || null,
}))
```

---

## 🔍 **Complete Checklist**

### **Step 1: Database Migration** ✅

**Run this SQL:**
```sql
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS behavior_triggers JSONB DEFAULT NULL;
```

**Verify:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'behavior_triggers';
```

**Expected output:**
```
column_name        | data_type
-------------------+-----------
behavior_triggers  | jsonb
```

---

### **Step 2: API Route Fixed** ✅

**File:** `e:\proofpulse\app\api\widget\[id]\route.ts`

**Line 318 added:**
```typescript
behavior_triggers: notification.behavior_triggers || null,
```

**Verify by checking API response:**
```bash
# Open browser console on your website
# Check Network tab for /api/widget/[id] request
# Response should include behavior_triggers field
```

---

### **Step 3: Widget Logic Fixed** ✅

**File:** `e:\proofpulse\public\widget\widget.js`

**Changes made:**
1. Renamed `checkBehaviorTriggers` → `initializeBehaviorTriggers`
2. Initialize triggers on widget load
3. Skip triggered notifications in normal loop
4. Triggers show notifications directly

---

### **Step 4: UI Component** ✅

**File:** `e:\proofpulse\components\BehaviorTriggersEditor.tsx`

- Complete UI for configuring triggers
- Help section with guidelines
- Trigger descriptions
- Inline tooltips

---

### **Step 5: Form Integration** ✅

**File:** `e:\proofpulse\app\dashboard\widgets\[id]\notifications\new\page.tsx`

- Import BehaviorTriggersEditor
- Add state management
- Save to database
- UI component added

---

## 🧪 **Testing Steps**

### **Test 1: Verify Database Column**

```sql
-- Check if column exists
SELECT behavior_triggers 
FROM notifications 
LIMIT 1;
```

**Expected:** Should not error (column exists)

---

### **Test 2: Create Notification with Trigger**

1. Go to Dashboard → Widgets → Your Widget
2. Click "Create Notification"
3. Fill in notification details
4. Scroll to "Behavior Triggers" section
5. Toggle ON
6. Click "+ Exit Intent"
7. Keep default settings
8. Click "Create Notification"

**Verify in database:**
```sql
SELECT id, type, message, behavior_triggers 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected output:**
```json
{
  "enabled": true,
  "trigger_mode": "any",
  "triggers": [
    {
      "type": "exit_intent",
      "enabled": true,
      "settings": {
        "sensitivity": "medium",
        "cooldown": 30
      }
    }
  ]
}
```

---

### **Test 3: Verify API Response**

1. Open your website in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Find request to `/api/widget/[your-widget-id]`
6. Check Response

**Expected in response:**
```json
{
  "notifications": [
    {
      "id": "...",
      "type": "purchase",
      "message": "...",
      "behavior_triggers": {
        "enabled": true,
        "trigger_mode": "any",
        "triggers": [...]
      }
    }
  ]
}
```

**If `behavior_triggers` is missing → API not fixed!**

---

### **Test 4: Verify Widget Initialization**

1. Open your website
2. Open browser console (F12)
3. Look for these logs:

**Expected logs:**
```
[ProofPulse] Widget loaded successfully
[ProofPulse] Initializing behavior triggers...
[ProofPulse] Initializing 1 behavior trigger(s) for notification 123
[ProofPulse] Behavior triggers initialized for notification 1/1
[ProofPulse] startNotificationLoop called
[ProofPulse] Preparing notification: 0, purchase
[ProofPulse] Notification has behavior triggers, skipping normal display
```

**If you see "Showing notification" immediately → Widget logic not working!**

---

### **Test 5: Verify Trigger Fires**

1. Website loaded (notification should NOT show)
2. Move cursor to top of browser
3. Check console

**Expected logs:**
```
[ProofPulse] Exit intent triggered (cooldown: 30s)
[ProofPulse] Trigger exit_intent fired, showing rotated notification: 123
[ProofPulse] Showing notification: purchase
```

**Notification should appear!** ✅

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Notification Shows Immediately**

**Symptoms:**
- Notification appears right away
- Doesn't wait for trigger

**Causes:**
1. `behavior_triggers` not in API response
2. Widget logic not updated
3. Triggers not initialized

**Solution:**
```bash
# 1. Check API response includes behavior_triggers
# 2. Clear browser cache
# 3. Hard refresh (Ctrl+Shift+R)
# 4. Check console for initialization logs
```

---

### **Issue 2: No Console Logs**

**Symptoms:**
- No ProofPulse logs in console
- Widget not loading

**Causes:**
1. Widget script not loaded
2. Invalid widget ID
3. CORS issues

**Solution:**
```html
<!-- Verify script tag -->
<script src="/widget/widget.js" data-widget="YOUR-WIDGET-ID"></script>

<!-- Check widget ID is correct -->
<!-- Check browser console for errors -->
```

---

### **Issue 3: Trigger Not Firing**

**Symptoms:**
- Notification doesn't show when trigger should fire
- No "Exit intent triggered" log

**Causes:**
1. Trigger not initialized
2. Settings incorrect
3. Cooldown blocking

**Solution:**
```javascript
// Check console for:
[ProofPulse] Initializing 1 behavior trigger(s)...

// If missing, triggers not initialized
// Check API response has behavior_triggers
```

---

### **Issue 4: Database Column Missing**

**Symptoms:**
- Error when saving notification
- "column behavior_triggers does not exist"

**Solution:**
```sql
-- Run migration
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS behavior_triggers JSONB DEFAULT NULL;

-- Verify
\d notifications
```

---

### **Issue 5: API Not Returning behavior_triggers**

**Symptoms:**
- API response doesn't include behavior_triggers
- Widget can't read trigger settings

**Solution:**
```typescript
// Check file: app/api/widget/[id]/route.ts
// Line ~318 should have:
behavior_triggers: notification.behavior_triggers || null,

// If missing, add it and restart dev server
```

---

## 📊 **Debugging Commands**

### **Check Database:**
```sql
-- See all notifications with triggers
SELECT id, type, message, behavior_triggers 
FROM notifications 
WHERE behavior_triggers IS NOT NULL;

-- Count notifications with triggers
SELECT COUNT(*) 
FROM notifications 
WHERE behavior_triggers IS NOT NULL;
```

### **Check API Response:**
```bash
# Using curl
curl http://localhost:3000/api/widget/YOUR-WIDGET-ID

# Check if response includes behavior_triggers
```

### **Check Browser Console:**
```javascript
// In browser console, check widget data
console.log(window.proofPulseData);

// Should show notifications with behavior_triggers
```

---

## ✅ **Final Verification**

### **All Systems Check:**

- [ ] Database column exists (`behavior_triggers JSONB`)
- [ ] Migration ran successfully
- [ ] API includes `behavior_triggers` in response
- [ ] Widget initializes triggers on load
- [ ] Notifications with triggers don't show immediately
- [ ] Exit intent fires when cursor moves to top
- [ ] Console logs show correct behavior
- [ ] Multiple triggers rotate correctly

---

## 🎉 **Expected Behavior**

### **When Everything Works:**

```
1. Page loads
   ↓
   [ProofPulse] Widget loaded successfully
   [ProofPulse] Initializing behavior triggers...
   [ProofPulse] Behavior triggers initialized for notification 1/1
   [ProofPulse] Notification has behavior triggers, skipping normal display
   
2. User moves cursor to top
   ↓
   [ProofPulse] Exit intent triggered (cooldown: 30s)
   [ProofPulse] Trigger exit_intent fired
   [ProofPulse] Showing notification
   
3. Notification appears! ✅
   
4. User moves cursor to top again (after 30s)
   ↓
   [ProofPulse] Exit intent triggered
   [ProofPulse] Showing notification (different one if rotation)
   
5. Different notification appears! ✅
```

---

## 🚀 **Quick Fix Summary**

### **3 Critical Fixes:**

**1. API Route (MOST IMPORTANT)**
```typescript
// File: app/api/widget/[id]/route.ts
// Line 318: Add this
behavior_triggers: notification.behavior_triggers || null,
```

**2. Widget Logic**
```javascript
// File: public/widget/widget.js
// Already fixed - initializes triggers, skips in loop
```

**3. Database**
```sql
-- Run migration
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS behavior_triggers JSONB;
```

---

## 📞 **Still Not Working?**

### **Debug Checklist:**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Check console** for errors
4. **Verify API response** includes behavior_triggers
5. **Check database** has behavior_triggers column
6. **Restart dev server** (npm run dev)
7. **Check widget ID** is correct

### **Get Logs:**

```bash
# Browser console
F12 → Console tab → Look for [ProofPulse] logs

# Network tab
F12 → Network tab → Find /api/widget/[id] → Check Response

# Database
psql → SELECT * FROM notifications WHERE behavior_triggers IS NOT NULL;
```

---

## 🎊 **Success Indicators**

### **You'll know it's working when:**

✅ API response includes `behavior_triggers` field  
✅ Console shows "Initializing behavior triggers"  
✅ Console shows "skipping normal display"  
✅ Notification does NOT show immediately  
✅ Moving cursor to top triggers notification  
✅ Console shows "Exit intent triggered"  
✅ Notification appears at perfect moment  
✅ Multiple notifications rotate correctly  

---

**The fix is complete! Restart your dev server and test!** 🚀✨
