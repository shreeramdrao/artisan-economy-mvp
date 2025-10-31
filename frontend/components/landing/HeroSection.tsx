'use client'

import { motion } from 'framer-motion'

function BackgroundGradient() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute -inset-[20%] bg-[radial-gradient(circle_at_20%_20%,rgba(253,186,116,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(251,146,60,0.35),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(250,204,21,0.25),transparent_40%)]" />

      {/* Animated diagonal gradient sheet */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -inset-x-10 -top-40 h-[60rem] rotate-12 bg-gradient-to-br from-orange-200/50 via-amber-100/50 to-amber-50/50 blur-3xl"
          initial={{ opacity: 0.3, y: 40 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
      </div>

      {/* Subtle artisan weave pattern */}
      <svg className="absolute inset-0 opacity-[0.08]" width="100%" height="100%">
        <defs>
          <pattern id="weave" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 30 H60 M30 0 V60" stroke="currentColor" strokeWidth="1" className="text-amber-900" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weave)" />
      </svg>
    </div>
  )
}

function AiOrb() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-6 right-6 h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/30 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 0.9, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{ boxShadow: [
          '0 0 0 0 rgba(251,146,60,0.35)',
          '0 0 0 12px rgba(251,146,60,0)',
        ] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundGradient />
      <div className="relative container mx-auto px-4 py-24 md:py-28">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          >
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Empowering Indian Artisans
            </span>
            <br />
            <span className="text-gray-900">Through AI Technology</span>
          </motion.h1>

          <motion.p
            className="mx-auto max-w-2xl text-lg md:text-xl text-gray-700/90"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6 }}
          >
            Bridging tradition with technology. We help artisans create professional product listings, reach global markets, and preserve cultural heritage through AI-powered tools.
          </motion.p>

          <motion.div
            className="mt-10 grid grid-cols-3 gap-6"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          >
            {[{
              value: '500+', label: 'Artisans Onboarded', color: 'from-orange-500 to-amber-400'
            }, {
              value: '2,000+', label: 'Products Listed', color: 'from-amber-500 to-yellow-400'
            }, {
              value: '15+', label: 'Indian States', color: 'from-orange-400 to-amber-300'
            }].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <AiOrb />
    </section>
  )
}

export default HeroSection


