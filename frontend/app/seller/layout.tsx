'use client'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Global Navbar already included from app/layout.tsx */}
      <main>{children}</main>
    </div>
  )
}