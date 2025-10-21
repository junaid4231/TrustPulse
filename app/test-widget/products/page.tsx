export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Products Page</h1>
        <p className="text-gray-600 mb-4">Current URL: <code className="bg-gray-200 px-2 py-1 rounded">/test-widget/products</code></p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Navigate:</h2>
          <div className="space-y-2">
            <a href="/test-widget" className="block text-blue-600 hover:underline">← Back to test page</a>
            <a href="/test-widget/products/item1" className="block text-blue-600 hover:underline">→ Product Item 1</a>
            <a href="/test-widget/checkout" className="block text-blue-600 hover:underline">→ Checkout</a>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800">
            ✅ If you set URL targeting to <code className="bg-white px-2 py-1 rounded">/test-widget/products/*</code>, 
            the widget should appear on this page and /products/item1
          </p>
        </div>
      </div>
    </div>
  );
}
