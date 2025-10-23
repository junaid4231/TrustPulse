# 🎯 Behavior Triggers - Cheat Sheet

## 📋 Quick Reference Card

---

## 5 Trigger Types

### 🎯 **Exit Intent**
```
When: Cursor moves to top of browser
Best for: Last-chance offers, cart abandonment
Settings: Sensitivity (Medium), Cooldown (30s)
Example: "Wait! Get 20% off before you leave!"
```

### 📜 **Scroll Depth**
```
When: User scrolls to X% of page
Best for: Engaged readers, content offers
Settings: Percentage (50%), Direction (Down)
Example: "Enjoyed this? Get our free guide!"
```

### ⏱️ **Time on Page**
```
When: User on page for X seconds
Best for: Interested visitors, engagement
Settings: Seconds (30)
Example: "Still browsing? Here's 15% off!"
```

### 😴 **Inactivity**
```
When: No interaction for X seconds
Best for: Re-engagement, help offers
Settings: Seconds (20)
Example: "Need help? Chat with us!"
```

### 👁️ **Element Visible**
```
When: Specific element becomes visible
Best for: Context-aware, pricing offers
Settings: Selector (#pricing), Percentage (50%)
Example: "Only 5 spots left at this price!"
```

---

## Recommended Settings

### **E-commerce Store**
```
✅ Exit Intent (Medium, 30s)
✅ Scroll Depth (50%)
✅ Time on Page (30s)

Goal: Reduce cart abandonment
Expected: 35% reduction
```

### **SaaS Landing Page**
```
✅ Exit Intent (Medium, 30s)
✅ Scroll Depth (75%)
✅ Element Visible (#pricing)

Goal: Increase signups
Expected: 4x more signups
```

### **Blog/Content Site**
```
✅ Scroll Depth (50%)
✅ Exit Intent (Medium, 30s)
✅ Time on Page (60s)

Goal: Grow email list
Expected: 3x more subscribers
```

### **Service Business**
```
✅ Element Visible (#pricing)
✅ Inactivity (20s)
✅ Exit Intent (Medium, 30s)

Goal: More bookings
Expected: 2.5x more bookings
```

---

## Trigger Modes

### **ANY Mode (OR Logic)** ✅ Recommended
```
Show when ANY trigger fires
Example: Exit Intent OR Scroll 50%
→ Whichever happens first
→ More opportunities to show
```

### **ALL Mode (AND Logic)** - Advanced
```
Show only when ALL triggers fire
Example: Time 30s AND Scroll 50%
→ Both must happen
→ Highly qualified leads only
```

---

## Best Practices

### ✅ **DO:**
```
✓ Create 3-5 notifications (rotation)
✓ Use 30s cooldown on exit intent
✓ Start with 1-2 triggers
✓ Test on desktop AND mobile
✓ Monitor and optimize
```

### ❌ **DON'T:**
```
✗ Use only 1 notification (feels fake)
✗ Set cooldown to 0 (fires once only)
✗ Add too many triggers (overwhelming)
✗ Set timing too short (annoying)
✗ Ignore mobile users
```

---

## Quick Setup (5 Minutes)

### **Step 1: Create Notification**
```
Type: Purchase
Name: "John Smith"
Product: "Premium Plan"
```

### **Step 2: Enable Triggers**
```
Toggle: ON
Mode: ANY
```

### **Step 3: Add Exit Intent**
```
Sensitivity: Medium
Cooldown: 30 seconds
```

### **Step 4: Save & Test**
```
Save notification
Visit website
Move cursor to top
→ Notification shows! 🎉
```

---

## Rotation Setup

### **Create 3-5 Notifications:**
```
Notification 1: "John purchased Premium Plan"
Notification 2: "Sarah: 5-star review ⭐⭐⭐⭐⭐"
Notification 3: "23 people viewing now"
Notification 4: "Only 3 left in stock!"

All with: Exit Intent (Medium, 30s)

Result: Different notification each time!
```

---

## Sensitivity Levels

### **Exit Intent Sensitivity:**
```
Low (10px):    Less sensitive, requires more movement
Medium (5px):  Balanced ✅ RECOMMENDED
High (2px):    Very sensitive, triggers easily
```

---

## Cooldown Times

### **Exit Intent Cooldown:**
```
0 seconds:   Fires once only (feels fake)
30 seconds:  Fires every 30s ✅ RECOMMENDED
60 seconds:  Less aggressive
10 seconds:  Very aggressive
```

---

## Scroll Percentages

### **Scroll Depth Settings:**
```
25%:  Early engagement
50%:  Mid-page ✅ RECOMMENDED
75%:  Deep engagement
100%: Bottom of page
```

---

## Time Thresholds

### **Time on Page Settings:**
```
10s:  Quick engagement
30s:  Interested visitors ✅ RECOMMENDED
60s:  Highly engaged
120s: Very interested, ready to buy
```

---

## Common Combinations

### **Combo 1: Exit + Scroll**
```
Mode: ANY
Triggers:
  - Exit Intent (Medium, 30s)
  - Scroll Depth (50%)

Use: General engagement
```

### **Combo 2: Time + Scroll**
```
Mode: ALL
Triggers:
  - Time on Page (60s)
  - Scroll Depth (75%)

Use: Highly qualified leads
```

### **Combo 3: Exit + Element**
```
Mode: ANY
Triggers:
  - Exit Intent (Medium, 30s)
  - Element Visible (#pricing)

Use: Pricing page offers
```

---

## Troubleshooting

### **Problem → Solution**
```
Not firing?
→ Check toggle ON, notification active, cooldown passed

Fires too much?
→ Increase cooldown, lower sensitivity

Feels fake?
→ Create 3-5 notifications, add cooldown

Low conversions?
→ Test different triggers, improve message
```

---

## Expected Results

### **Metrics:**
```
Conversion Rate:  1.2% → 4.8% (4x better)
Bounce Rate:      65% → 42% (35% reduction)
Time on Site:     15s → 45s (3x longer)
Revenue:          $1,000 → $3,500/day (3.5x more)
```

---

## Testing Checklist

```
□ Created notification with trigger
□ Tested on desktop
□ Tested on mobile
□ Verified trigger fires
□ Created 2 more notifications (rotation)
□ Monitoring conversions
□ Optimizing based on data
```

---

## CSS Selectors (Element Visible)

### **Common Selectors:**
```
#pricing          → Element with ID "pricing"
.product          → Elements with class "product"
#checkout-button  → Checkout button
.testimonials     → Testimonials section
#cta-button       → Call-to-action button
```

---

## Progressive Offers

### **Escalate Value:**
```
1st trigger: "Get 10% off"
2nd trigger: "Wait! Get 15% off"
3rd trigger: "Last chance: 20% off + free shipping"

Result: Increasing value = higher conversion!
```

---

## Mobile vs Desktop

### **Best Triggers:**
```
Desktop:
  ✅ Exit Intent (works great)
  ✅ Scroll Depth
  ✅ Time on Page

Mobile:
  ⚠️ Exit Intent (less reliable)
  ✅ Scroll Depth (works great)
  ✅ Time on Page (works great)
  ✅ Inactivity

Solution: Use multiple triggers for both!
```

---

## Performance Tips

### **Optimization:**
```
1. Start with exit intent
2. Add 3-5 notifications (rotation)
3. Set 30s cooldown
4. Test for 1 week
5. Add more triggers
6. Monitor and optimize
7. Scale what works
```

---

## Quick Wins

### **Immediate Impact:**
```
✅ Exit intent on checkout page
   → 30% reduction in cart abandonment

✅ Scroll depth on blog posts
   → 3x more email signups

✅ Element visible on pricing
   → 2x more conversions

✅ Time on page for engaged users
   → 4x higher conversion rate
```

---

## Resources

```
📖 Full Guide:     USER_GUIDE_BEHAVIOR_TRIGGERS.md
⚡ Quick Start:    QUICK_START_BEHAVIOR_TRIGGERS.md
🔄 Rotation:       SMART_NOTIFICATION_ROTATION.md
🎯 All Features:   BEHAVIOR_TRIGGERS_GUIDE.md
🧪 Test Page:      /test-behavior-triggers
```

---

## Support

```
Need help?
1. Read full user guide
2. Test on /test-behavior-triggers
3. Check browser console (F12)
4. Review examples in documentation
```

---

**Print this cheat sheet for quick reference!** 📄

**Happy converting!** 🚀✨
