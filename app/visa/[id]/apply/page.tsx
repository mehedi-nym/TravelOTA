'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface VisaRequirement {
  id: string
  field_name: string
  field_type: string
  field_label: string
  is_required: boolean
  options?: string
  placeholder?: string
  order_index: number
}

interface Country {
  id: string
  name: string
}

export default function VisaApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const [country, setCountry] = useState<Country | null>(null)
  const [requirements, setRequirements] = useState<VisaRequirement[]>([])
  const [formData, setFormData] = useState<Record<string, string | File[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  async function checkUserAndFetchData() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Check if user is logged in
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Fetch country details
      const { data: countryData, error: countryError } = await supabase
        .from('countries')
        .select('id, name')
        .eq('id', params.id)
        .single()

      if (countryError) {
        console.error('[v0] Error fetching country:', countryError)
        router.push('/auth/login')
        return
      }

      setCountry(countryData)

      // Fetch visa requirements for this country
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('visa_requirements')
        .select('*')
        .eq('country_id', params.id)
        .order('order_index', { ascending: true })

      if (requirementsError) {
        console.error('[v0] Error fetching requirements:', requirementsError)
      } else {
        setRequirements(requirementsData || [])
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: Array.from(files),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()

      // Create visa application
      const { data: applicationData, error: appError } = await supabase
        .from('visa_applications')
        .insert({
          user_id: user.id,
          country_id: params.id,
          status: 'pending',
          application_data: formData,
        })
        .select()
        .single()

      if (appError) {
        console.error('[v0] Error creating application:', appError)
        alert('Failed to submit application. Please try again.')
        return
      }

      // Upload files if any
      for (const [fieldName, value] of Object.entries(formData)) {
        if (Array.isArray(value) && value.length > 0) {
          const files = value as File[]
          for (const file of files) {
            const filePath = `${user.id}/${applicationData.id}/${fieldName}/${file.name}`
            const { error: uploadError } = await supabase.storage
              .from('visa-application-files')
              .upload(filePath, file, { upsert: false })

            if (uploadError) {
              console.error('[v0] Error uploading file:', uploadError)
            } else {
              // Record file in database
              await supabase.from('visa_application_files').insert({
                application_id: applicationData.id,
                field_name: fieldName,
                file_path: filePath,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
              })
            }
          }
        }
      }

      alert('Application submitted successfully!')
      router.push('/dashboard/applications')
    } catch (error) {
      console.error('[v0] Submit error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!country || !user) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Unable to load application form
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href={`/visa/${country.id}`}>
          <Button variant="ghost" className="mb-6">
            ← Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Apply for {country.name} Visa</CardTitle>
            <CardDescription>
              Please fill in all required fields to complete your visa application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {requirements.length > 0 ? (
                requirements.map((requirement) => (
                  <div key={requirement.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {requirement.field_label}
                      {requirement.is_required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>

                    {requirement.field_type === 'text' && (
                      <Input
                        type="text"
                        placeholder={requirement.placeholder}
                        value={
                          (formData[requirement.field_name] as string) || ''
                        }
                        onChange={(e) =>
                          handleInputChange(
                            requirement.field_name,
                            e.target.value
                          )
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'email' && (
                      <Input
                        type="email"
                        placeholder={requirement.placeholder}
                        value={
                          (formData[requirement.field_name] as string) || ''
                        }
                        onChange={(e) =>
                          handleInputChange(
                            requirement.field_name,
                            e.target.value
                          )
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'phone' && (
                      <Input
                        type="tel"
                        placeholder={requirement.placeholder}
                        value={
                          (formData[requirement.field_name] as string) || ''
                        }
                        onChange={(e) =>
                          handleInputChange(
                            requirement.field_name,
                            e.target.value
                          )
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'date' && (
                      <Input
                        type="date"
                        value={
                          (formData[requirement.field_name] as string) || ''
                        }
                        onChange={(e) =>
                          handleInputChange(
                            requirement.field_name,
                            e.target.value
                          )
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'file' && (
                      <Input
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleFileChange(requirement.field_name, e.target.files)
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'textarea' && (
                      <Textarea
                        placeholder={requirement.placeholder}
                        value={
                          (formData[requirement.field_name] as string) || ''
                        }
                        onChange={(e) =>
                          handleInputChange(
                            requirement.field_name,
                            e.target.value
                          )
                        }
                        required={requirement.is_required}
                      />
                    )}

                    {requirement.field_type === 'dropdown' &&
                      requirement.options && (
                        <select
                          value={
                            (formData[requirement.field_name] as string) || ''
                          }
                          onChange={(e) =>
                            handleInputChange(
                              requirement.field_name,
                              e.target.value
                            )
                          }
                          required={requirement.is_required}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                          <option value="">Select an option</option>
                          {JSON.parse(requirement.options).map(
                            (option: string) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No specific requirements configured yet. Your application will be
                  reviewed by our team.
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 h-12"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
