'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { aiApi } from '@/lib/api'
import { Clipboard } from 'lucide-react'

type Props = {
  productId?: string
  title?: string
  description?: string
  sellerName?: string
  imageUrl?: string   // ✅ added for completeness (not used yet but good for future preview)
  productUrl?: string // ✅ used in share text
}

export default function CaptionGenerator({
  productId,
  title,
  description,
  sellerName,
  productUrl,
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const [hashtags, setHashtags] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setCaption(null)
    setHashtags(null)
    setOpen(true)

    try {
      const payload = {
        productTitle: title || '',
        description: description || '',
        sellerName: sellerName || '',
        productId,
      }

      const data = await aiApi.generateInstagramCaption(payload)

      setCaption(data.caption || data.text || '')
      setHashtags(data.hashtags || data.hashtagString || '')

      toast({ title: '✅ Caption ready', description: 'You can copy or share it now.' })
    } catch (err) {
      console.error('❌ Caption generation error:', err)
      toast({ title: 'Failed to generate caption', variant: 'destructive' })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const copyAll = async () => {
    try {
      const text = `${caption || ''}\n\n${
        description ? description.slice(0, 120) + '...' : ''
      }\n\n${hashtags || ''}\n\n${productUrl || ''}`
      await navigator.clipboard.writeText(text)
      toast({ title: '📋 Copied to clipboard' })
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `${caption || ''}\n\n${
        description ? description.slice(0, 120) + '...' : ''
      }\n\n${hashtags || ''}\n\n${productUrl || ''}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `${caption || ''}\n\n${
        description ? description.slice(0, 120) + '...' : ''
      }\n\n${hashtags || ''}\n\n${productUrl || ''}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <div>
      <Button onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate caption & share'}
      </Button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/40 absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <Card className="p-6 z-10 w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-3">✨ AI Caption</h3>

            <div className="mb-4">
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                {caption || '—'}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Hashtags</div>
              <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
                {hashtags || '—'}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={copyAll}>
                <Clipboard className="mr-2" size={14} /> Copy
              </Button>
              <Button onClick={shareWhatsApp}>WhatsApp</Button>
              <Button onClick={shareTwitter}>Twitter</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}