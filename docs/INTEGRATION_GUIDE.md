# ProofPulse Integration Guide

## 🚀 Quick Start - Add Script Once

You only need to add the ProofPulse script **ONCE** to your website. The widget will automatically show/hide based on your targeting rules.

---

## Integration Methods

### **Method 1: HTML Websites (Recommended)**

Add this script **before the closing `</body>` tag** in your main HTML file:

```html
<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="YOUR_WIDGET_ID"
  async
></script>
```

**Where to add:**
- `index.html` (for single-page sites)
- `footer.php` or `header.php` (for WordPress)
- Main layout file (for most frameworks)

---

### **Method 2: Next.js (App Router)**

Add to `app/layout.tsx`:

```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* ProofPulse Widget - Add once, works everywhere */}
        <Script
          src="https://proofpulse.vercel.app/widget/widget.js"
          data-widget="YOUR_WIDGET_ID"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

---

### **Method 3: Next.js (Pages Router)**

Add to `pages/_app.tsx`:

```tsx
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      
      {/* ProofPulse Widget */}
      <Script
        src="https://proofpulse.vercel.app/widget/widget.js"
        data-widget="YOUR_WIDGET_ID"
        strategy="afterInteractive"
      />
    </>
  )
}

export default MyApp
```

---

### **Method 4: React (Create React App)**

Add to `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <div id="root"></div>
    
    <!-- ProofPulse Widget -->
    <script
      src="https://proofpulse.vercel.app/widget/widget.js"
      data-widget="YOUR_WIDGET_ID"
      async
    ></script>
  </body>
</html>
```

---

### **Method 5: WordPress**

Add to your theme's `footer.php` or use a plugin like "Insert Headers and Footers":

```html
<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="YOUR_WIDGET_ID"
  async
></script>
```

---

### **Method 6: Shopify**

1. Go to **Online Store** → **Themes** → **Edit Code**
2. Open `theme.liquid`
3. Add before `</body>`:

```liquid
<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="YOUR_WIDGET_ID"
  async
></script>
```

---

## ⚙️ Optional Customization

You can override widget settings using data attributes:

```html
<script
  src="https://proofpulse.vercel.app/widget/widget.js"
  data-widget="YOUR_WIDGET_ID"
  data-color="#F59E0B"
  data-position="bottom-left"
  data-radius="16"
  data-shadow="bold"
  data-anim="vivid"
  async
></script>
```

---

## 🎯 URL Targeting - Control Where Widget Shows

After adding the script once, use **URL Targeting** in your dashboard to control where the widget appears:

### **Show on specific pages:**
```
/products/*
/blog/*
```

### **Hide on specific pages:**
```
!/checkout
!/admin/*
```

### **Show everywhere except checkout:**
```
!/checkout
```

### **Show only on homepage:**
```
/
```

---

## 📱 Device Targeting

Control which devices see your widget:
- ✅ Desktop
- ✅ Tablet  
- ✅ Mobile

Leave all unchecked to show on all devices.

---

## ✅ That's It!

Add the script **once**, configure targeting in your dashboard, and you're done! The widget automatically shows/hides based on your rules.

**No need to add the script on every page!** 🎉
