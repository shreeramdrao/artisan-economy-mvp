'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { formatPrice } from '@/lib/utils'

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()

  // Buy Now params
  const productId = searchParams.get('productId')
  const quantity = Number(searchParams.get('quantity') || 1)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    paymentMethod: 'stripe',
  })

  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any | null>(null)
  const [productLoading, setProductLoading] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return
      setProductLoading(true)
      try {
        const p = await buyerApi.getProduct(productId)
        setProduct(p)
      } catch (err) {
        console.error('Failed to load product for Buy Now:', err)
        toast({
          title: 'Error',
          description: 'Failed to load product details for checkout.',
          variant: 'destructive',
        })
      } finally {
        setProductLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Build checkout items (Buy Now or Cart)
  const checkoutItems = useMemo(() => {
    if (productId) {
      return [{ productId, quantity }]
    }
    return cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  }, [productId, quantity, cart])

  // Calculate total amount
  const total = useMemo(() => {
    if (productId) {
      // if product fetched, use its price; fallback to 0
      const price = product?.price || product?.price?.amount || 0
      return quantity * price
    }
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [productId, quantity, product, cart])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty and no product selected.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Use real logged-in buyerId (fallback to 'guest' only if missing)
      const buyerId = user?.userId || 'guest'

      const checkoutData = {
        buyerId,
        items: checkoutItems,
        paymentMethod: form.paymentMethod,
        shippingAddress: {
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone: form.phone,
        },
      }

      const res = await buyerApi.checkout(checkoutData)

      if (res.paymentUrl && form.paymentMethod === 'stripe') {
        // redirect to stripe
        window.location.href = res.paymentUrl
      } else if (form.paymentMethod === 'cod') {
        toast({
          title: '✅ Order Placed',
          description: 'Your order has been placed successfully.',
        })
        clearCart()
        router.push('/buyer/orders')
      } else {
        toast({
          title: '⚠️ Unexpected',
          description: 'Unknown payment method or missing payment URL.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('❌ Checkout failed:', err)
      toast({
        title: 'Error',
        description: 'Checkout failed. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // UI state while loading product for Buy Now
  if (productId && productLoading) {
    return <div className="text-center mt-10">⏳ Loading product details...</div>
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Info */}
          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <Label>State</Label>
                <Input name="state" value={form.state} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pincode</Label>
                <Input name="pincode" value={form.pincode} onChange={handleChange} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            >
              <option value="stripe">Stripe (Cards / Wallets)</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* Order Summary */}
          <div className="text-right font-semibold">
            Total: {formatPrice(total)}
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading
              ? 'Processing...'
              : `Place Order (${checkoutItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )} item${checkoutItems.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''})`}
          </Button>
        </form>
      </Card>
    </div>
  )
}

// Wrap in Suspense like before
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  )
}