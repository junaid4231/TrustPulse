"use client";

import Script from "next/script";

export default function TestWidgetPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Widget Test Page - Homepage</h1>
          <p className="text-gray-600 mb-4">Current URL: <code className="bg-gray-200 px-2 py-1 rounded">/test-widget</code></p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              ✅ <strong>Widget loaded on this test page only</strong> - Dashboard pages are clean!
            </p>
            <p className="text-xs text-green-700 mt-2">
              The widget script is added to <code className="bg-white px-1 py-0.5 rounded">test-widget</code> pages for testing. Your dashboard won't track itself.
            </p>
          </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Different URLs:</h2>
          <div className="space-y-2">
            <a href="/test-widget" className="block text-blue-600 hover:underline">→ /test-widget (this page)</a>
            <a href="/test-widget/products" className="block text-blue-600 hover:underline">→ /test-widget/products</a>
            <a href="/test-widget/products/item1" className="block text-blue-600 hover:underline">→ /test-widget/products/item1</a>
            <a href="/test-widget/blog" className="block text-blue-600 hover:underline">→ /test-widget/blog</a>
            <a href="/test-widget/blog/post1" className="block text-blue-600 hover:underline">→ /test-widget/blog/post1</a>
            <a href="/test-widget/checkout" className="block text-blue-600 hover:underline">→ /test-widget/checkout</a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 URL Targeting Examples to Test:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li><code className="bg-white px-2 py-1 rounded">/test-widget/products/*</code> - Shows on /products/item1, /products/item2</li>
            <li><code className="bg-white px-2 py-1 rounded">/test-widget/blog/**</code> - Shows on all blog pages</li>
            <li><code className="bg-white px-2 py-1 rounded">!/test-widget/checkout</code> - Hide on checkout page</li>
            <li><code className="bg-white px-2 py-1 rounded">/test-widget</code> - Shows only on this page</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>👀 Open Console (F12)</strong> to see URL targeting debug logs
          </p>
        </div>
      </div>
    </div>
    
    {/* Widget Script - Only on test pages */}
    <Script
      src="https://proofpulse.vercel.app/widget/widget.js"
      data-widget="e23aa8cb-5b75-4f1b-83e3-1eb7fbe63fad"
      data-color="#F59E0B"
      data-radius="32"
      data-shadow="bold"
      data-anim="subtle"
      strategy="afterInteractive"
    />
    </>
  );
}
