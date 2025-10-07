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

declare global {
  interface Window {
    Razorpay?: any
  }
}

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
    paymentMethod: 'stripe', // Default
  })

  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any | null>(null)
  const [productLoading, setProductLoading] = useState(false)

  // Fetch product if "Buy Now"
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

  // Checkout items (Buy Now or Cart)
  const checkoutItems = useMemo(() => {
    if (productId) {
      return [{ productId, quantity }]
    }
    return cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  }, [productId, quantity, cart])

  // Total amount calculation
  const total = useMemo(() => {
    if (productId) {
      const price = product?.price || product?.price?.amount || 0
      return quantity * price
    }
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [productId, quantity, product, cart])

  /* ----------------- ✅ Razorpay Script Loader ----------------- */
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  /* ----------------- ✅ Razorpay Flow ----------------- */
  const handleRazorpayPayment = async (orderData: any) => {
    const res = await loadRazorpayScript()
    if (!res) {
      toast({
        title: 'Error',
        description: 'Failed to load Razorpay SDK. Check your internet.',
        variant: 'destructive',
      })
      return
    }

    const options = {
      key: orderData.razorpayKey,
      amount: orderData.amount * 100,
      currency: 'INR',
      name: 'Artisan Economy',
      description: 'Purchase from artisan store',
      order_id: orderData.razorpayOrderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await buyerApi.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          if (verifyRes?.success) {
            toast({
              title: '✅ Payment Successful',
              description: 'Your order has been confirmed!',
            })
            clearCart()
            router.push('/buyer/orders')
          }
        } catch (err) {
          console.error('❌ Payment verification failed:', err)
          toast({
            title: 'Error',
            description: 'Payment verification failed. Please contact support.',
            variant: 'destructive',
          })
        }
      },
      prefill: {
        name: form.name,
        email: user?.email || '',
        contact: form.phone,
      },
      theme: { color: '#f97316' },
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  /* ----------------- ✅ Checkout Submission ----------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty or product missing.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
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

      // ✅ Stripe flow
      if (form.paymentMethod === 'stripe' && res.paymentUrl) {
        window.location.href = res.paymentUrl
      }

      // ✅ Razorpay flow
      else if (form.paymentMethod === 'razorpay' && res.razorpayOrderId) {
        await handleRazorpayPayment(res)
      }

      // ✅ COD flow
      else if (form.paymentMethod === 'cod') {
        toast({
          title: '✅ Order Placed',
          description: 'Your order has been placed successfully.',
        })
        clearCart()
        router.push('/buyer/orders')
      }

      else {
        toast({
          title: '⚠️ Error',
          description: 'Something went wrong. Please try again.',
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

  /* ----------------- ✅ UI Rendering ----------------- */
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
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} required />
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
              <option value="razorpay">Razorpay (UPI / Cards / NetBanking)</option>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  )
}