# ⚡ Quick Start Guide - Behavior Triggers

## 🚀 Get Started in 5 Minutes

### **Step 1: Create Your First Notification (2 min)**

1. Go to **Dashboard** → **Widgets** → **Your Widget**
2. Click **"Create Notification"**
3. Choose type: **Purchase** (most popular)
4. Fill in:
   - Name: "John Smith"
   - Product: "Premium Plan"
   - Location: "New York"

---

### **Step 2: Enable Behavior Triggers (1 min)**

1. Scroll down to **"🎯 Behavior Triggers"**
2. Toggle switch **ON**
3. Keep **"ANY"** mode selected (default)

---

### **Step 3: Add Exit Intent Trigger (1 min)**

1. Click **"+ Exit Intent"** button
2. Settings appear:
   - Sensitivity: **Medium** (keep default)
   - Cooldown: **30** seconds (keep default)
3. Leave toggle **ON**

---

### **Step 4: Save & Test (1 min)**

1. Click **"Create Notification"**
2. Visit your website
3. Move cursor to top of browser
4. **Notification appears!** 🎉

---

## 🎯 Your First Setup (Copy This!)

```
Notification Type: Purchase
Message: "John just purchased Premium Plan"

Behavior Trigger: Exit Intent
├─ Sensitivity: Medium
├─ Cooldown: 30 seconds
└─ Mode: ANY

Result: Shows when user tries to leave!
```

---

## 📈 Next Steps (After Testing)

### **Level 2: Add Rotation (5 min)**

Create 2 more notifications with same trigger:

**Notification 2:**
```
Type: Review
Message: "Sarah: Amazing product! ⭐⭐⭐⭐⭐"
Trigger: Exit Intent (same settings)
```

**Notification 3:**
```
Type: Live Activity
Message: "23 people viewing now"
Trigger: Exit Intent (same settings)
```

**Result:** Different notification each time = feels real! ✅

---

### **Level 3: Add More Triggers (5 min)**

Add to your notifications:

**Scroll Depth:**
```
Percentage: 50%
Direction: Down
```

**Time on Page:**
```
Seconds: 30
```

**Result:** Multiple ways to trigger = more conversions! 📈

---

## 🎨 Cheat Sheet

### **Trigger Types Quick Reference:**

| **Trigger** | **When** | **Best For** | **Settings** |
|-------------|----------|--------------|--------------|
| 🎯 Exit Intent | Cursor to top | Last-chance offers | Sensitivity: Medium, Cooldown: 30s |
| 📜 Scroll Depth | Scroll to X% | Engaged readers | Percentage: 50%, Direction: Down |
| ⏱️ Time on Page | After X seconds | Interested visitors | Seconds: 30 |
| 😴 Inactivity | No interaction | Re-engagement | Seconds: 20 |
| 👁️ Element Visible | Element shows | Context-aware | Selector: #pricing, Percentage: 50% |

---

### **Recommended Settings:**

**For E-commerce:**
```
✅ Exit Intent (Medium, 30s cooldown)
✅ Scroll Depth (50%)
✅ Time on Page (30s)
```

**For SaaS:**
```
✅ Exit Intent (Medium, 30s cooldown)
✅ Scroll Depth (75%)
✅ Element Visible (#pricing)
```

**For Blogs:**
```
✅ Scroll Depth (50%)
✅ Exit Intent (Medium, 30s cooldown)
✅ Time on Page (60s)
```

---

## ⚠️ Common Mistakes

### **❌ Don't Do This:**

1. **Only 1 notification** → Feels fake
2. **No cooldown** → Only fires once
3. **Too many triggers** → Overwhelming
4. **Too aggressive** → Annoying (5s time on page)
5. **No testing** → Don't know what works

### **✅ Do This Instead:**

1. **3-5 notifications** → Rotation feels real
2. **30s cooldown** → Fires multiple times
3. **1-2 triggers** → Simple and effective
4. **30s+ timing** → Not annoying
5. **Test everything** → Optimize based on data

---

## 📊 Expected Results

### **Week 1:**
- Set up exit intent
- Create 3 notifications
- Test and verify working

### **Week 2:**
- Monitor conversions
- Add scroll depth trigger
- Optimize timing

### **Week 3:**
- Create more notifications (rotation)
- Test different messages
- Scale what works

### **Week 4:**
- 2-5x higher conversions! 🚀
- Lower bounce rate
- More revenue

---

## 🆘 Troubleshooting

### **Not firing?**
1. Check toggle is ON
2. Check notification is active
3. Wait for cooldown to pass
4. Open console (F12) for logs

### **Fires too much?**
1. Increase cooldown (30s → 60s)
2. Lower sensitivity (High → Medium)
3. Use longer time thresholds

### **Feels fake?**
1. Create 3-5 notifications (rotation)
2. Add 30s cooldown
3. Use real customer data

---

## 🎉 Success Checklist

- [ ] Created first notification with exit intent
- [ ] Tested on website (works!)
- [ ] Created 2 more notifications (rotation)
- [ ] Added scroll depth trigger
- [ ] Monitoring conversions
- [ ] Seeing improvement! 📈

---

## 🚀 You're Done!

**Congratulations!** You've set up behavior triggers!

**What you have now:**
- ✅ Smart timing (not random)
- ✅ Multiple triggers
- ✅ Rotation system
- ✅ Higher conversions

**Next:** Monitor performance and optimize! 📊

---

## 📚 Full Documentation

For detailed information, see:
- 📖 **Complete Guide:** `USER_GUIDE_BEHAVIOR_TRIGGERS.md`
- 🔄 **Rotation System:** `SMART_NOTIFICATION_ROTATION.md`
- 🎯 **All Features:** `BEHAVIOR_TRIGGERS_GUIDE.md`

---

**Need help?** Check the full user guide or test on `/test-behavior-triggers` page!

**Happy converting!** 🎉✨
