# 🎯 How to Add Behavior Triggers UI to Your Notification Form

## ✅ YES! Each notification has its OWN triggers

Every notification can have different behavior triggers:
- Notification 1: Exit intent only
- Notification 2: Scroll depth + time on page
- Notification 3: No triggers (shows immediately)

---

## 📍 Where to Add the UI

### **File to Edit:**
`e:\proofpulse\app\dashboard\widgets\[id]\notifications\new\page.tsx`

---

## 🔧 Step-by-Step Instructions

### **Step 1: Import the Editor** (Line ~22)

Add this import at the top with the other imports:

```tsx
import BehaviorTriggersEditor from '@/components/BehaviorTriggersEditor';
```

**Full imports section should look like:**
```tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  // ... other icons
} from "lucide-react";
import BehaviorTriggersEditor from '@/components/BehaviorTriggersEditor'; // ← ADD THIS
```

---

### **Step 2: Add State** (Line ~160, after formData)

Add this state variable:

```tsx
const [behaviorTriggers, setBehaviorTriggers] = useState(null);
```

**Should be placed here:**
```tsx
export default function NewNotificationPage() {
  // ... existing code ...
  
  const [formData, setFormData] = useState({
    // ... all the form fields ...
  });

  // ← ADD THIS HERE
  const [behaviorTriggers, setBehaviorTriggers] = useState(null);

  const updateField = (field: string, value: any) => {
    // ... existing code ...
  };
```

---

### **Step 3: Add to Save Function** (Line ~258, before supabase.insert)

Add `behavior_triggers` to the notification data:

```tsx
console.log("Creating notification with data:", notificationData);

// ← ADD THIS LINE
notificationData.behavior_triggers = behaviorTriggers;

const { error: insertError } = await supabase
  .from("notifications")
  .insert([notificationData]);
```

**Full context:**
```tsx
const handleCreate = async (e: React.FormEvent) => {
  // ... existing code ...
  
  switch (selectedType) {
    case "purchase":
      notificationData = {
        ...notificationData,
        name: formData.purchaseName,
        // ... other fields
      };
      break;
    // ... other cases ...
  }

  console.log("Creating notification with data:", notificationData);
  
  // ADD THIS LINE ↓
  notificationData.behavior_triggers = behaviorTriggers;

  const { error: insertError } = await supabase
    .from("notifications")
    .insert([notificationData]);
```

---

### **Step 4: Add UI Component to Form** (Line ~800+, before the Submit button)

Find where the form fields end (before the "Create Notification" button) and add:

```tsx
{/* Behavior Triggers Section */}
<div className="px-8 py-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    🎯 Behavior Triggers (Optional)
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Control when this notification appears based on user behavior
  </p>
  <BehaviorTriggersEditor
    value={behaviorTriggers}
    onChange={setBehaviorTriggers}
  />
</div>
```

**It should go here (before the submit button):**
```tsx
{/* ... All your form fields above ... */}

{/* Behavior Triggers Section - ADD THIS */}
<div className="px-8 py-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    🎯 Behavior Triggers (Optional)
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Control when this notification appears based on user behavior
  </p>
  <BehaviorTriggersEditor
    value={behaviorTriggers}
    onChange={setBehaviorTriggers}
  />
</div>

{/* Submit Button */}
<div className="px-8 py-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Creating...
      </span>
    ) : (
      "Create Notification"
    )}
  </button>
</div>
```

---

## 📝 Complete Code Changes Summary

### **1. Add Import (Top of file)**
```tsx
import BehaviorTriggersEditor from '@/components/BehaviorTriggersEditor';
```

### **2. Add State (After formData)**
```tsx
const [behaviorTriggers, setBehaviorTriggers] = useState(null);
```

### **3. Add to Save (In handleCreate)**
```tsx
notificationData.behavior_triggers = behaviorTriggers;
```

### **4. Add UI (Before submit button)**
```tsx
<div className="px-8 py-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    🎯 Behavior Triggers (Optional)
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Control when this notification appears based on user behavior
  </p>
  <BehaviorTriggersEditor
    value={behaviorTriggers}
    onChange={setBehaviorTriggers}
  />
</div>
```

---

## 🎨 What It Will Look Like

When you add this, users will see:

```
┌─────────────────────────────────────────────────┐
│ Create Notification                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Select Type: Purchase, Review, etc.]          │
│                                                 │
│ [Form fields for the selected type]            │
│                                                 │
├─────────────────────────────────────────────────┤
│ 🎯 Behavior Triggers (Optional)                │
│ Control when this notification appears          │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Behavior Triggers          [Toggle ON]  │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ When enabled:                                   │
│ ┌─────────────────────────────────────────┐   │
│ │ Trigger Mode: ○ ANY  ○ ALL             │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🎯 Exit Intent          [Toggle ON]     │   │
│ │ Sensitivity: [Medium ▼]                 │   │
│ │                             [Remove]     │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ [+ Add Trigger buttons]                        │
│                                                 │
├─────────────────────────────────────────────────┤
│           [Create Notification]                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ How It Works

### **For Each Notification:**

1. **User creates notification** → Fills in type, message, etc.
2. **User enables triggers** → Toggles "Behavior Triggers" ON
3. **User adds triggers** → Clicks "+ Exit Intent", "+ Scroll Depth", etc.
4. **User configures settings** → Sets percentage, seconds, etc.
5. **User saves** → Data goes to `notifications.behavior_triggers` column
6. **Widget loads** → Reads triggers for THIS notification only
7. **Trigger fires** → Shows THIS notification at perfect moment

### **Example Scenarios:**

**Notification A: Exit Intent Discount**
```json
{
  "type": "reward",
  "message": "Wait! Get 20% off",
  "behavior_triggers": {
    "enabled": true,
    "triggers": [{ "type": "exit_intent" }]
  }
}
```
→ Shows ONLY when user tries to leave

**Notification B: Scroll Offer**
```json
{
  "type": "purchase",
  "message": "John just bought!",
  "behavior_triggers": {
    "enabled": true,
    "triggers": [{ "type": "scroll_depth", "settings": { "percentage": 50 } }]
  }
}
```
→ Shows ONLY at 50% scroll

**Notification C: Normal**
```json
{
  "type": "review",
  "message": "Great product!",
  "behavior_triggers": null
}
```
→ Shows immediately (no triggers)

---

## 🧪 Testing

### **After Adding the UI:**

1. **Go to:** `/dashboard/widgets/[your-widget-id]/notifications/new`
2. **Create a notification** with any type
3. **Scroll down** to see "Behavior Triggers" section
4. **Toggle it ON**
5. **Add triggers** (Exit Intent, Scroll Depth, etc.)
6. **Configure settings**
7. **Save notification**
8. **Test on:** `/test-behavior-triggers` or your website

---

## 🎯 Each Notification is Independent!

```
Widget A
├─ Notification 1: Exit Intent → Shows on exit
├─ Notification 2: Scroll 50% → Shows at 50% scroll
├─ Notification 3: Time 30s → Shows after 30s
└─ Notification 4: No triggers → Shows immediately

Widget B
├─ Notification 1: Scroll 75% + Time 60s → Shows when BOTH happen
└─ Notification 2: Element visible → Shows when #pricing is visible
```

**Every notification can have different triggers!** ✅

---

## 🚀 Next Steps

1. ✅ Add the 4 code changes above
2. ✅ Create a notification with triggers
3. ✅ Test on `/test-behavior-triggers`
4. ✅ Watch conversions improve!

---

## 💡 Pro Tips

**Best Practices:**
- Use exit intent for last-chance offers
- Use scroll depth for engaged readers
- Use time on page for interested visitors
- Use element visible for context-aware offers
- Mix and match for powerful combinations

**Common Combinations:**
- Exit Intent + Scroll 75% (ANY mode) → Engaged users leaving
- Time 60s + Scroll 50% (ALL mode) → Highly qualified leads
- Element Visible (#pricing) → Perfect timing for pricing offers

---

**🎉 You're ready to add behavior triggers to your app!** 🚀
