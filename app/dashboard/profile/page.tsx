'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  async function fetchUserAndProfile() {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('[v0] Error fetching profile:', error)
        } else {
          setProfile(data)
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
          })
        }
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSave() {
    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) {
        console.error('[v0] Error updating profile:', error)
        alert('Failed to update profile')
      } else {
        alert('Profile updated successfully!')
        setEditing(false)
        fetchUserAndProfile()
      }
    } catch (error) {
      console.error('[v0] Save error:', error)
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input value={user?.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange('first_name', e.target.value)
                }
                disabled={!editing}
                className={!editing ? 'bg-muted' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) =>
                  handleInputChange('last_name', e.target.value)
                }
                disabled={!editing}
                className={!editing ? 'bg-muted' : ''}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange('phone', e.target.value)
              }
              disabled={!editing}
              className={!editing ? 'bg-muted' : ''}
            />
          </div>

          <div className="flex gap-2">
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      first_name: profile?.first_name || '',
                      last_name: profile?.last_name || '',
                      phone: profile?.phone || '',
                    })
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card className="mt-6 bg-muted/30 border-muted">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Account created on{' '}
              <span className="font-semibold">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
