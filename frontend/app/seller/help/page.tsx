'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText,
  Video,
  Download,
  Search
} from 'lucide-react'

const helpSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the Seller Portal',
    icon: BookOpen,
    articles: [
      'Setting up your seller account',
      'Adding your first product',
      'Understanding the dashboard',
      'Managing orders'
    ]
  },
  {
    title: 'Product Management',
    description: 'Everything about managing your products',
    icon: FileText,
    articles: [
      'Creating product listings',
      'Managing inventory',
      'Product photography tips',
      'Pricing strategies'
    ]
  },
  {
    title: 'Order Processing',
    description: 'How to handle orders and customers',
    icon: MessageCircle,
    articles: [
      'Processing orders',
      'Shipping and tracking',
      'Customer communication',
      'Handling returns'
    ]
  },
  {
    title: 'Analytics & Reports',
    description: 'Understanding your business performance',
    icon: Video,
    articles: [
      'Reading analytics dashboard',
      'Sales reports',
      'Customer insights',
      'Performance metrics'
    ]
  }
]

const faqs = [
  {
    question: 'How do I add a new product?',
    answer: 'Go to Products > Create Product and fill in the product details, upload images, and set pricing.'
  },
  {
    question: 'How do I track my orders?',
    answer: 'Navigate to Orders section to see all your orders and update their status as they progress.'
  },
  {
    question: 'How do I get paid?',
    answer: 'Payments are automatically processed and transferred to your registered bank account weekly.'
  },
  {
    question: 'Can I edit my product listings?',
    answer: 'Yes, you can edit any product from the Products section by clicking the Edit button.'
  },
  {
    question: 'How do I manage inventory?',
    answer: 'Use the Inventory section to track stock levels and set up low stock alerts.'
  },
  {
    question: 'What analytics are available?',
    answer: 'You can view sales trends, customer insights, product performance, and revenue reports.'
  }
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">❓ Help & Support</h1>
        <p className="text-gray-600">Find answers to your questions and learn how to use the Seller Portal</p>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </Card>

      {/* Help Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {helpSections.map((section, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <section.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              <div className="space-y-2">
                {section.articles.map((article, articleIndex) => (
                  <div key={articleIndex} className="text-sm text-gray-700 hover:text-orange-600 transition-colors">
                    • {article}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                Learn More
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <BookOpen className="w-6 h-6 mb-2" />
            User Guide
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Video className="w-6 h-6 mb-2" />
            Video Tutorials
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Download className="w-6 h-6 mb-2" />
            Download Resources
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <MessageCircle className="w-6 h-6 mb-2" />
            Live Chat
          </Button>
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Support */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you succeed. Get in touch with us through any of these channels.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p>Support Hours: Monday - Friday, 9 AM - 6 PM IST</p>
            <p>Email: support@artisaneconomy.com | Phone: +91 98765 43210</p>
          </div>
        </div>
      </Card>

      {/* Community */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            Connect with other sellers, share tips, and get inspired by success stories.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">Seller Forum</Button>
            <Button variant="outline">Success Stories</Button>
            <Button variant="outline">Best Practices</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
