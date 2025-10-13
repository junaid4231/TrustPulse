"use client";

import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What is ProofPulse?",
    answer:
      "ProofPulse is a social proof notification service that helps businesses display real-time activity notifications on their websites. These notifications show things like 'John from New York just signed up' or '23 people are viewing this page now' to build trust and increase conversions.",
    category: "General",
  },
  {
    id: "2",
    question: "How do I install the widget on my website?",
    answer:
      "Installing the ProofPulse widget is simple: 1) Create a widget in your dashboard, 2) Copy the provided code snippet, 3) Paste it into your website's HTML before the closing </body> tag. The widget will automatically start showing notifications on your site.",
    category: "Installation",
  },
  {
    id: "3",
    question: "Is ProofPulse free to use?",
    answer:
      "Yes! We're currently in public beta and offering free access to all features. This includes unlimited widgets, notifications, customization options, and analytics. No credit card required during the beta period.",
    category: "Pricing",
  },
  {
    id: "4",
    question: "Can I customize the appearance of notifications?",
    answer:
      "Absolutely! You can customize colors, fonts, position, timing, and content to match your brand. You can also choose from different notification styles and templates to find what works best for your website.",
    category: "Customization",
  },
  {
    id: "5",
    question: "What types of notifications can I show?",
    answer:
      "You can display various types of social proof notifications including: recent signups, purchases, page views, form submissions, downloads, and custom events. You can also show testimonials, reviews, and user activity.",
    category: "Features",
  },
  {
    id: "6",
    question: "Does the widget work on all websites?",
    answer:
      "Yes! ProofPulse works on any website, regardless of the platform or CMS you're using. It's compatible with WordPress, Shopify, Squarespace, custom HTML sites, and any other web platform.",
    category: "Compatibility",
  },
  {
    id: "7",
    question: "How do I track the performance of my notifications?",
    answer:
      "Your dashboard includes detailed analytics showing impressions, clicks, conversion rates, and other metrics. You can see which notifications are most effective and optimize your social proof strategy accordingly.",
    category: "Analytics",
  },
  {
    id: "8",
    question: "Can I use ProofPulse on multiple websites?",
    answer:
      "Yes! You can create multiple widgets for different websites or pages. Each widget can be customized independently and tracked separately in your analytics dashboard.",
    category: "Usage",
  },
  {
    id: "9",
    question: "Is my data secure with ProofPulse?",
    answer:
      "Absolutely. We take data security seriously and implement industry-standard encryption, secure data centers, and regular security audits. We never share your data with third parties without your consent.",
    category: "Security",
  },
  {
    id: "10",
    question: "What happens when the beta period ends?",
    answer:
      "Beta users will receive early access to paid plans with significant discounts (up to 50% off). We'll provide plenty of notice before any pricing changes and will always honor the commitments made during beta.",
    category: "Pricing",
  },
  {
    id: "11",
    question: "How do I get support if I need help?",
    answer:
      "We offer multiple support channels: email support (support@proofpulse.com), live chat during business hours, and comprehensive documentation. Beta users also get priority support and direct access to our team.",
    category: "Support",
  },
  {
    id: "12",
    question: "Can I integrate ProofPulse with my existing tools?",
    answer:
      "Yes! ProofPulse integrates with popular tools like Google Analytics, Facebook Pixel, and various CRM systems. We also provide webhooks and APIs for custom integrations.",
    category: "Integrations",
  },
];

const categories = [
  "All",
  "General",
  "Installation",
  "Pricing",
  "Customization",
  "Features",
  "Compatibility",
  "Analytics",
  "Usage",
  "Security",
  "Support",
  "Integrations",
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about ProofPulse. Can't find what
            you're looking for?{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Contact us
            </Link>{" "}
            and we'll help you out.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600">
                No FAQs found matching your search criteria.
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {faq.question}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  {openItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  )}
                </button>

                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-blue-100 mb-6">
            Can't find the answer you're looking for? Our support team is here
            to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
