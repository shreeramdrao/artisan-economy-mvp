// frontend/app/page.tsx
import { RoleSelector } from '@/components/landing/role-selector'

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg scroll-smooth">
      {/* ✅ Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="hero-gradient">Empowering Indian Artisans</span>
            <br />
            Through AI Technology
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Bridging tradition with technology. We help artisans create
            professional product listings, reach global markets, and preserve
            cultural heritage through AI-powered tools.
          </p>

          {/* Role Selection */}
          <RoleSelector />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600">Artisans Onboarded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">2,000+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">15+</div>
              <div className="text-gray-600">Indian States</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-orange-600">
              For Artisans
            </h3>
            <ul className="space-y-3">
              <li>✓ AI-enhanced product photos</li>
              <li>✓ Multilingual story translation</li>
              <li>✓ Smart pricing suggestions</li>
              <li>✓ Direct payments to your account</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-amber-600">
              For Buyers
            </h3>
            <ul className="space-y-3">
              <li>✓ Verified authentic products</li>
              <li>✓ Listen to artisan stories</li>
              <li>✓ Secure online payments</li>
              <li>✓ Support traditional crafts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ✅ About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Artisan Economy is an AI-powered marketplace that empowers Indian
            artisans by connecting them directly with buyers worldwide. Our goal
            is to preserve heritage crafts while giving artisans modern tools to
            thrive in the digital economy.
          </p>
        </div>
      </section>

      {/* ✅ Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-6">
            Have questions or want to collaborate? Reach out to us.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>📧 Email: support@artisaneconomy.com</li>
            <li>📞 Phone: +91 8217731857</li>
          </ul>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>&copy; 2024 Artisan Economy. Built with ❤️ for Indian Craftsmen</p>
            <p className="text-sm text-gray-400 mt-2">Hackathon MVP Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}