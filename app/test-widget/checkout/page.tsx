export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout Page</h1>
        <p className="text-gray-600 mb-4">Current URL: <code className="bg-gray-200 px-2 py-1 rounded">/test-widget/checkout</code></p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Navigate:</h2>
          <div className="space-y-2">
            <a href="/test-widget" className="block text-blue-600 hover:underline">← Back to test page</a>
            <a href="/test-widget/products" className="block text-blue-600 hover:underline">← Back to products</a>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">
            ❌ If you set URL targeting to <code className="bg-white px-2 py-1 rounded">!/test-widget/checkout</code>, 
            the widget should NOT appear on this page
          </p>
        </div>
      </div>
    </div>
  );
}
