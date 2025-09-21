'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { sellerApi } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function EditProductPage() {
  const { productId } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await sellerApi.getProducts() // 🔑 TODO: replace with real seller auth
        const found = data.find((p: any) => p.productId === productId)
        setProduct(found)
      } catch (err) {
        console.error("❌ Failed to fetch product:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  async function handleSave() {
    if (!product) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', (document.getElementById('title') as HTMLInputElement).value)
      formData.append('price', (document.getElementById('price') as HTMLInputElement).value)
      formData.append('category', (document.getElementById('category') as HTMLInputElement).value)

      if (file) {
        formData.append('image', file)
      }

      await sellerApi.updateProduct(productId as string, formData)

      alert('✅ Product updated successfully!')
      router.push('/seller/products')
    } catch (err) {
      console.error('❌ Failed to update product:', err)
      alert('❌ Failed to update product. See console for details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-8 text-center">Loading...</p>
  if (!product) return <p className="p-8 text-center">Product not found</p>

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input id="title" defaultValue={product.title} />
        </div>

        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" defaultValue={product.price} />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" defaultValue={product.category} />
        </div>

        <div>
          <Label htmlFor="image">Replace Image (optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Card>
    </div>
  )
}