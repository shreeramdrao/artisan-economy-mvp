'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { sellerApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { SellerProfile } from '@/types/seller'

export default function SellerProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Fetch profile on load
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await sellerApi.getProfile()
        setProfile(data)
      } catch (err) {
        console.error('❌ Failed to load seller profile:', err)
        toast({
          title: 'Error',
          description: 'Could not load profile',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (!profile) return
    try {
      setSaving(true)

      // ✅ Pass avatar file into updateProfile
      await sellerApi.updateProfile({
        ...profile,
        avatar: avatarFile || undefined,
      })

      toast({
        title: '✅ Profile updated',
        description: 'Your profile changes were saved',
      })
      setEditMode(false)
      setAvatarFile(null)
    } catch (err) {
      console.error('❌ Failed to update profile:', err)
      toast({
        title: 'Error',
        description: 'Could not save profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!profile) {
    return <p className="text-center text-gray-500 p-8">No profile found.</p>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="p-6 space-y-6 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">👤 Seller Profile</h1>
          {!editMode && (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              ✏️ Edit
            </Button>
          )}
        </div>

        {editMode ? (
          // ------------------ EDIT MODE ------------------
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : profile.avatarUrl || '/images/default-avatar.png'
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full border object-cover"
              />
              <div>
                <label className="text-sm font-medium">Shop Logo / Avatar</label>
                <Input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Shop Name</label>
              <Input
                name="shopName"
                value={profile.shopName || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                name="location"
                value={profile.location || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input name="email" value={profile.email || ''} disabled />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  '💾 Save Changes'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // ------------------ VIEW MODE ------------------
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl || '/images/default-avatar.png'}
                alt="Avatar"
                className="w-20 h-20 rounded-full border object-cover"
              />
              <div>
                <p className="text-xl font-semibold">
                  {profile.shopName || 'Not set'}
                </p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            <p>
              <span className="font-semibold">📖 Bio:</span>{' '}
              {profile.bio || 'No bio yet'}
            </p>
            <p>
              <span className="font-semibold">📍 Location:</span>{' '}
              {profile.location || 'Not set'}
            </p>
            <p>
              <span className="font-semibold">📞 Phone:</span>{' '}
              {profile.phone || 'Not set'}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}