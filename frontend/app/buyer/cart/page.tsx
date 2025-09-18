'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()
  const router = useRouter()

  // ✅ Safely calculate total
  const total = cart.reduce(
    (sum, item) =>
      sum + ((item.price !== undefined ? item.price : 0) * (item.quantity || 1)),
    0
  )

  // ✅ Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return

    // For now, handle single product checkout
    const firstItem = cart[0]

    router.push(
      `/buyer/checkout?productId=${firstItem.productId}&quantity=${firstItem.quantity || 1}`
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length > 0 ? (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <Card
                key={item.productId}
                className="p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  {/* ✅ Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={item.imageUrl || '/placeholder.png'}
                      alt={item.title || 'Untitled'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ✅ Product Info */}
                  <div>
                    <h2 className="font-semibold">
                      {item.title || 'Untitled'}
                    </h2>
                    <p className="text-gray-600">
                      {formatPrice(item.price || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                </div>

                {/* ✅ Remove Button */}
                <Button
                  variant="destructive"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>

          {/* ✅ Cart Total + Actions */}
          <div className="mt-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Total: {formatPrice(total)}
            </h2>
            <div className="space-x-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleProceedToCheckout}
              >
                Proceed to Buy
              </Button>
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Your cart is empty.</p>
      )}
    </div>
  )
}