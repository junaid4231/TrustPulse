import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Globe,
  BarChart3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">TrustPulse Lite</div>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-gray-600 hover:text-blue-600">
            Features
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-blue-600">
            Pricing
          </Link>
          <Link href="#faq" className="text-gray-600 hover:text-blue-600">
            FAQ
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600">
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
            🚀 Boost Your Conversions by 30%
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Show Social Proof That
            <span className="text-blue-600"> Actually Converts</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Display real-time activity notifications on your website. Build
            trust instantly with live social proof widgets that take 2 minutes
            to install.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-medium"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 text-lg font-medium">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Setup in 2 minutes
          </p>
        </div>

        {/* Demo Widget Preview */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
              <p className="text-gray-400 text-lg">Your Website Preview</p>
              {/* Demo notification */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      <span className="font-semibold">John Doe</span> from New
                      York
                    </p>
                    <p className="text-xs text-gray-500">
                      just signed up • 2 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Build Trust
          </h2>
          <p className="text-xl text-gray-600">
            Simple, powerful features that drive real results
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Notifications</h3>
            <p className="text-gray-600">
              Show live activity like "John just purchased" or "23 people
              viewing now" to create urgency and FOMO.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Testimonial Popups</h3>
            <p className="text-gray-600">
              Display customer reviews and 5-star ratings automatically. Build
              credibility with rotating testimonials.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Boost Conversions</h3>
            <p className="text-gray-600">
              Increase sales by 20-30% by showing social proof. Proven
              psychology that works for any business.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">One Line Install</h3>
            <p className="text-gray-600">
              Copy one line of code. Paste it anywhere. Works on any website,
              platform, or CMS. No technical skills needed.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Simple Analytics</h3>
            <p className="text-gray-600">
              See how many people viewed and clicked your notifications. Track
              what's working and optimize.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fully Customizable</h3>
            <p className="text-gray-600">
              Match your brand colors, choose position, customize messages. Make
              it look like it belongs on your site.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for testing</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>1 widget</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>500 notifications/month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Basic customization</span>
              </li>
            </ul>
            <button className="w-full py-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 font-medium">
              Start Free
            </button>
          </div>

          {/* Starter Plan */}
          <div className="bg-blue-600 text-white p-8 rounded-xl shadow-2xl border-2 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <p className="text-blue-100 mb-6">For small businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-blue-100">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-200 mt-0.5" />
                <span>1 website</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-200 mt-0.5" />
                <span>5,000 notifications/month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-200 mt-0.5" />
                <span>Full customization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-200 mt-0.5" />
                <span>Remove branding</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-200 mt-0.5" />
                <span>Email support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Get Started
            </button>
          </div>

          {/* Growth Plan */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-2">Growth</h3>
            <p className="text-gray-600 mb-6">For agencies & teams</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>3 websites</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Unlimited notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
            </ul>
            <button className="w-full py-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 font-medium">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Boost Your Conversions?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses using social proof to increase sales by
            30%
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 text-lg font-medium"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            © 2025 TrustPulse Lite. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
