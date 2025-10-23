'use client';

import { useEffect } from 'react';

export default function TestBehaviorTriggersPage() {
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = '/widget/widget.js';
    script.setAttribute('data-widget', 'test-widget-id');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Behavior Triggers Test Page
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test all behavior trigger types for ProofPulse notifications
          </p>
        </div>

        {/* Exit Intent Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎯 Exit Intent Trigger
          </h2>
          <p className="text-gray-600 mb-4">
            Move your mouse to the top of the browser window (as if you're going to close the tab).
            The notification will appear when exit intent is detected.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>How to test:</strong> Move your cursor quickly towards the browser's address bar or tab area.
            </p>
          </div>
        </div>

        {/* Scroll Depth Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            📜 Scroll Depth Trigger
          </h2>
          <p className="text-gray-600 mb-4">
            Scroll down to 50% of the page to trigger a notification.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>How to test:</strong> Scroll down this page. At 50% scroll depth, a notification will appear.
            </p>
          </div>
        </div>

        {/* Time on Page Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            ⏱️ Time on Page Trigger
          </h2>
          <p className="text-gray-600 mb-4">
            Stay on this page for 10 seconds to see a notification.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>How to test:</strong> Just wait 10 seconds after page load.
            </p>
          </div>
        </div>

        {/* Inactivity Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            😴 Inactivity Trigger
          </h2>
          <p className="text-gray-600 mb-4">
            Stop moving your mouse for 15 seconds to trigger a notification.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>How to test:</strong> Don't move your mouse, don't scroll, don't type for 15 seconds.
            </p>
          </div>
        </div>

        {/* Element Visible Test */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            👁️ Element Visibility Trigger
          </h2>
          <p className="text-gray-600 mb-4">
            Scroll down to the pricing section below to trigger a notification.
          </p>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-sm text-pink-800">
              <strong>How to test:</strong> Scroll down until the "Pricing" section is visible.
            </p>
          </div>
        </div>

        {/* Spacer for scrolling */}
        <div className="h-screen"></div>

        {/* Pricing Section (for element visibility trigger) */}
        <div id="pricing" className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-2xl p-12 mb-6">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            💰 Pricing Section
          </h2>
          <p className="text-xl text-white text-center mb-8">
            When this section becomes visible, a notification should appear!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$29</p>
              <p className="text-gray-600">Perfect for small businesses</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center transform scale-105">
              <div className="bg-indigo-500 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-2">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$79</p>
              <p className="text-gray-600">For growing companies</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-4">$199</p>
              <p className="text-gray-600">For large organizations</p>
            </div>
          </div>
        </div>

        {/* More content for scrolling */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            📊 Trigger Status
          </h2>
          <p className="text-gray-600 mb-4">
            Check your browser console to see which triggers have fired.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-800 font-mono">
              Open DevTools (F12) → Console tab to see trigger logs
            </p>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="h-96"></div>

        <div className="bg-gray-900 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">🎉 You've reached the end!</h3>
          <p className="text-gray-300">
            Try moving your mouse to the top to test exit intent one more time.
          </p>
        </div>
      </div>
    </div>
  );
}
