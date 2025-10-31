'use client'

// frontend/app/page.tsx
import { RoleSelector } from '@/components/landing/role-selector'
import { HeroSection } from '@/components/landing/HeroSection'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Hero */}
      <HeroSection />

      {/* Role Selection */}
      <section className="container mx-auto px-4 pb-8">
        <RoleSelector />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            className="rounded-xl p-8 shadow-xl border border-orange-200/60 bg-white/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-600">For Artisans</h3>
            <ul className="space-y-3 text-gray-700">
              <li>✓ AI-enhanced product photos</li>
              <li>✓ Multilingual story translation</li>
              <li>✓ Smart pricing suggestions</li>
              <li>✓ Direct payments to your account</li>
            </ul>
          </motion.div>

          <motion.div
            className="rounded-xl p-8 shadow-xl border border-amber-200/60 bg-white/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-amber-600">For Buyers</h3>
            <ul className="space-y-3 text-gray-700">
              <li>✓ Verified authentic products</li>
              <li>✓ Listen to artisan stories</li>
              <li>✓ Secure online payments</li>
              <li>✓ Support traditional crafts</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gradient-to-b from-white to-amber-50/60">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.h2>
          <motion.p
            className="text-gray-700 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Artisan Economy is an AI-powered marketplace that empowers Indian artisans by connecting them directly with buyers worldwide. Our goal is to preserve heritage crafts while giving artisans modern tools to thrive in the digital economy.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Contact Us
          </motion.h2>
          <motion.p
            className="text-gray-700 mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Have questions or want to collaborate? Reach out to us.
          </motion.p>
          <motion.ul
            className="space-y-2 text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <li>📧 Email: support@artisaneconomy.com</li>
            <li>📞 Phone: +91 8217731857</li>
          </motion.ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Artisan Economy. Built with ❤️ for Indian Craftsmen</p>
            <p className="text-sm text-gray-400 mt-2">Hackathon MVP Project</p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-300">
              <a href="#about" className="hover:underline">About</a>
              <a href="#contact" className="hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}