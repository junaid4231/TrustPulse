"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const helpSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      {
        title: "How to create your first widget",
        description:
          "Step-by-step guide to creating and installing your first social proof widget",
        url: "/help/getting-started/first-widget",
      },
      {
        title: "Widget installation guide",
        description:
          "Learn how to install the widget code on different platforms",
        url: "/help/getting-started/installation",
      },
      {
        title: "Understanding analytics",
        description: "How to read and interpret your widget performance data",
        url: "/help/getting-started/analytics",
      },
    ],
  },
  {
    id: "widgets",
    title: "Widget Management",
    icon: FileText,
    articles: [
      {
        title: "Customizing widget appearance",
        description: "Change colors, position, and styling to match your brand",
        url: "/help/widgets/customization",
      },
      {
        title: "Managing notifications",
        description: "Add, edit, and organize your social proof notifications",
        url: "/help/widgets/notifications",
      },
      {
        title: "Widget troubleshooting",
        description: "Common issues and how to fix them",
        url: "/help/widgets/troubleshooting",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: ExternalLink,
    articles: [
      {
        title: "WordPress integration",
        description: "Install ProofPulse on WordPress sites",
        url: "/help/integrations/wordpress",
      },
      {
        title: "Shopify integration",
        description: "Add social proof to your Shopify store",
        url: "/help/integrations/shopify",
      },
      {
        title: "Custom website integration",
        description: "Install on custom HTML/CSS websites",
        url: "/help/integrations/custom",
      },
    ],
  },
];

const quickLinks = [
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Video,
    url: "/help/videos",
    color: "bg-red-500",
  },
  {
    title: "Live Chat Support",
    description: "Get instant help from our team",
    icon: MessageCircle,
    url: "/contact",
    color: "bg-green-500",
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    icon: FileText,
    url: "/help/api",
    color: "bg-blue-500",
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredSections = helpSections
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers, tutorials, and support resources to get the most out
            of ProofPulse
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div
              className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {link.title}
            </h3>
            <p className="text-gray-600 text-sm">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Help Sections */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {section.articles.length} articles
                  </p>
                </div>
              </div>
              {expandedSections.includes(section.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes(section.id) && (
              <div className="border-t border-gray-200">
                <div className="p-6 space-y-4">
                  {section.articles.map((article, index) => (
                    <Link
                      key={index}
                      href={article.url}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group"
                    >
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {article.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Our support team is here to help
          you succeed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Contact Support
          </Link>
          <Link
            href="/faq"
            className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
