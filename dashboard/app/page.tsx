import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Globe,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">ProofPulse</div>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-gray-600 hover:text-blue-600">
            Features
          </Link>
          <Link href="#beta" className="text-gray-600 hover:text-blue-600">
            Beta Program
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
            Join Beta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Now in Public Beta - Free Access for Early Adopters
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
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-medium shadow-lg"
            >
              Join Beta Program <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 text-lg font-medium">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            🎉 100% Free during beta • No credit card required • Full features
            unlocked
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

      {/* Beta Program Section */}
      <section
        id="beta"
        className="container mx-auto px-4 py-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl"
      >
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Limited Time Offer
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Public Beta Program
          </h2>
          <p className="text-xl text-gray-600">
            Get full access to all features - completely free during beta
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Beta Access
              </h3>
              <p className="text-gray-600 mb-6">
                Everything included, no limits
              </p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-blue-600">$0</span>
                <span className="text-gray-600 text-lg">/month</span>
                <p className="text-sm text-purple-600 font-medium mt-2">
                  🎉 Free during entire beta period
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited widgets</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited notifications</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Full customization</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority email support</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    No branding (white-label)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Early access to new features
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Lifetime discount when we launch
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-3">
                🎁 Beta Perks:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ No credit card required</li>
                <li>✅ No time limits during beta</li>
                <li>✅ Direct line to our founders</li>
                <li>✅ Influence product roadmap</li>
                <li>✅ 50% off forever when we launch paid plans</li>
              </ul>
            </div>

            <Link
              href="/signup"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              Join Beta Now - It's Free! <ArrowRight className="w-5 h-5" />
            </Link>

            <p className="text-center text-xs text-gray-500 mt-4">
              By joining beta, you help us build a better product. Your feedback
              matters! 💙
            </p>
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
            Join hundreds of beta testers already using ProofPulse to increase
            sales
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 text-lg font-medium shadow-lg"
          >
            Join Beta Program <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            © 2025 ProofPulse. All rights reserved.
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
