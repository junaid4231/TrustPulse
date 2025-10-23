# 🎯 Behavior Triggers - Setup Guide

## Where Settings Are Configured

### **1. Database (Storage)**
Location: `notifications` table → `behavior_triggers` column (JSONB)

```sql
-- Example notification with behavior triggers
{
  "enabled": true,
  "trigger_mode": "any",
  "triggers": [
    {
      "type": "exit_intent",
      "enabled": true,
      "settings": { "sensitivity": "medium" }
    }
  ]
}
```

---

### **2. API (Data Flow)**
Location: `/app/api/widget/[id]/route.ts`

**Already working!** ✅
- API fetches notifications with `SELECT *`
- Includes `behavior_triggers` column automatically
- Sends to widget.js

---

### **3. Widget (Frontend Detection)**
Location: `/public/widget/widget.js`

**Already working!** ✅
- `behaviorTriggers` object (lines 287-488)
- `checkBehaviorTriggers()` function (lines 1979-2053)
- Automatically initializes triggers based on settings

---

### **4. Dashboard UI (User Configuration)**
Location: `/components/BehaviorTriggersEditor.tsx` ✨ **NEW!**

**How to use in your notification form:**

```tsx
import BehaviorTriggersEditor from '@/components/BehaviorTriggersEditor';

export default function NotificationForm() {
  const [behaviorTriggers, setBehaviorTriggers] = useState(null);

  const handleSubmit = async () => {
    const notificationData = {
      // ... other fields
      behavior_triggers: behaviorTriggers, // Add this!
    };

    await supabase
      .from('notifications')
      .insert(notificationData);
  };

  return (
    <form>
      {/* ... other form fields ... */}

      {/* Add Behavior Triggers Editor */}
      <BehaviorTriggersEditor
        value={behaviorTriggers}
        onChange={setBehaviorTriggers}
      />

      <button onClick={handleSubmit}>Save Notification</button>
    </form>
  );
}
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CONFIGURES TRIGGERS (Dashboard UI)                 │
│    ↓                                                        │
│    BehaviorTriggersEditor Component                        │
│    - Select trigger types                                  │
│    - Configure settings                                    │
│    - Set trigger mode (ANY/ALL)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SAVE TO DATABASE                                         │
│    ↓                                                        │
│    notifications.behavior_triggers (JSONB)                 │
│    {                                                        │
│      "enabled": true,                                      │
│      "trigger_mode": "any",                                │
│      "triggers": [...]                                     │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. API FETCHES DATA                                         │
│    ↓                                                        │
│    GET /api/widget/[id]                                    │
│    SELECT * FROM notifications                             │
│    (includes behavior_triggers column)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. WIDGET RECEIVES DATA                                     │
│    ↓                                                        │
│    widget.js loads notification data                       │
│    checkBehaviorTriggers(notification)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TRIGGERS INITIALIZE                                      │
│    ↓                                                        │
│    behaviorTriggers.exitIntent.init()                      │
│    behaviorTriggers.scrollDepth.init()                     │
│    behaviorTriggers.timeOnPage.init()                      │
│    etc.                                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. USER BEHAVIOR DETECTED                                   │
│    ↓                                                        │
│    - Mouse moves to top (exit intent)                      │
│    - Page scrolls to 50% (scroll depth)                    │
│    - 30 seconds pass (time on page)                        │
│    - User inactive for 20s (inactivity)                    │
│    - Element visible (element visibility)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. NOTIFICATION SHOWS! 🎉                                   │
│    ↓                                                        │
│    showNotification(notification, settings)                │
│    Perfect timing based on user behavior!                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### **Step 1: Run Migration**
```bash
psql -d your_database -f migrations/add_behavior_triggers.sql
```

### **Step 2: Add Editor to Your Form**
Find your notification creation/edit form and add:

```tsx
import BehaviorTriggersEditor from '@/components/BehaviorTriggersEditor';

// In your form component:
<BehaviorTriggersEditor
  value={formData.behavior_triggers}
  onChange={(triggers) => setFormData({ ...formData, behavior_triggers: triggers })}
/>
```

### **Step 3: Save to Database**
The editor returns the correct JSON format. Just save it to the `behavior_triggers` column:

```tsx
await supabase
  .from('notifications')
  .insert({
    // ... other fields
    behavior_triggers: behaviorTriggersValue, // From editor
  });
```

### **Step 4: Test**
Visit `/test-behavior-triggers` to see it in action!

---

## Example Configurations

### **Exit Intent Offer**
```json
{
  "enabled": true,
  "trigger_mode": "any",
  "triggers": [
    {
      "type": "exit_intent",
      "enabled": true,
      "settings": { "sensitivity": "medium" }
    }
  ]
}
```

### **Engaged Reader (Time + Scroll)**
```json
{
  "enabled": true,
  "trigger_mode": "all",
  "triggers": [
    {
      "type": "time_on_page",
      "enabled": true,
      "settings": { "seconds": 60 }
    },
    {
      "type": "scroll_depth",
      "enabled": true,
      "settings": { "percentage": 75, "direction": "down" }
    }
  ]
}
```

### **Pricing Page Offer**
```json
{
  "enabled": true,
  "trigger_mode": "any",
  "triggers": [
    {
      "type": "element_visible",
      "enabled": true,
      "settings": { "selector": "#pricing", "percentage": 50 }
    }
  ]
}
```

---

## Where to Find Each Component

| Component | Location | Purpose |
|-----------|----------|---------|
| **Database Schema** | `/migrations/add_behavior_triggers.sql` | Stores trigger settings |
| **API Endpoint** | `/app/api/widget/[id]/route.ts` | Fetches notifications with triggers |
| **Widget Detection** | `/public/widget/widget.js` | Detects user behavior |
| **UI Editor** | `/components/BehaviorTriggersEditor.tsx` | Configure triggers in dashboard |
| **Test Page** | `/app/test-behavior-triggers/page.tsx` | Test all trigger types |
| **Documentation** | `/BEHAVIOR_TRIGGERS_GUIDE.md` | Complete guide |

---

## Next Steps

1. ✅ **Add editor to your notification form**
2. ✅ **Create a notification with triggers**
3. ✅ **Test on `/test-behavior-triggers`**
4. ✅ **Monitor conversions improve!**

---

## Need Help?

**Common Issues:**

**Q: Triggers not firing?**
- Check `behavior_triggers.enabled` is `true`
- Check individual trigger `enabled` is `true`
- Open browser console for trigger logs

**Q: How to test without waiting?**
- Use short durations (5s for time_on_page)
- Use low scroll percentages (25%)
- Test on `/test-behavior-triggers` page

**Q: Can I use multiple triggers?**
- Yes! Use "ANY" mode for OR logic
- Use "ALL" mode for AND logic

---

**🎉 You're all set! Behavior triggers are ready to use!** 🚀
