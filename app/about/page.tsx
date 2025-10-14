import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Target,
  Lightbulb,
  Heart,
  Zap,
  Globe,
  Award,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ProofPulse
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About ProofPulse
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to help businesses build trust and increase
            conversions through the power of social proof. Founded by a team of
            conversion optimization experts, ProofPulse makes it easy for any
            business to display real-time social proof notifications that
            actually work.
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              ProofPulse was born from a simple observation: businesses were
              losing potential customers because their websites lacked social
              proof. We saw too many great products and services struggling to
              convert visitors into customers, not because of poor quality, but
              because visitors didn't trust the brand enough to take action.
            </p>
            <p className="mb-6">
              After years of helping businesses optimize their conversion rates,
              we realized that social proof notifications were one of the most
              effective tools for building trust. However, existing solutions
              were either too complex, too expensive, or didn't provide the
              customization options businesses needed.
            </p>
            <p className="mb-6">
              That's when we decided to build ProofPulse - a simple, powerful,
              and affordable social proof notification service that any business
              can use to increase their conversions. We believe that every
              business deserves access to the tools that help them succeed,
              which is why we're offering free access during our beta period.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To democratize access to conversion optimization tools by making
              social proof notifications simple, affordable, and effective for
              businesses of all sizes. We believe that trust is the foundation
              of every successful business relationship.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Values
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                • <strong>Simplicity:</strong> Complex problems deserve simple
                solutions
              </li>
              <li>
                • <strong>Transparency:</strong> Honest communication builds
                lasting relationships
              </li>
              <li>
                • <strong>Accessibility:</strong> Great tools should be
                available to everyone
              </li>
              <li>
                • <strong>Innovation:</strong> Continuous improvement drives
                better results
              </li>
            </ul>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy to Use
              </h3>
              <p className="text-gray-600">
                No technical expertise required. Get your first notification
                live in under 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Universal Compatibility
              </h3>
              <p className="text-gray-600">
                Works on any website, platform, or CMS. No restrictions or
                limitations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Proven Results
              </h3>
              <p className="text-gray-600">
                Our notifications have helped businesses increase conversions by
                20-30% on average.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Conversion Experts
              </h3>
              <p className="text-gray-600">
                Our team has over 10 years of combined experience in conversion
                optimization, helping hundreds of businesses improve their
                online performance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Product Innovators
              </h3>
              <p className="text-gray-600">
                We're constantly innovating and improving our product based on
                user feedback and the latest research in social proof
                psychology.
              </p>
            </div>
          </div>
        </div>

        {/* Join Our Mission */}
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ready to start building trust with your customers? Join thousands of
            businesses already using ProofPulse to increase their conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-lg"
            >
              Start Free Beta
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
