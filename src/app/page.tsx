"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VapiCall } from "@/components/VapiCall"
import { AvailabilitySection } from "@/components/AvailabilitySection"
import { useLocalStorage, AvailabilityPeriod } from "@/hooks/useLocalStorage"
import { ExternalLink, MessageSquare, Copy, Check, Link, Phone, Zap } from "lucide-react"

export default function Home() {
  const { formData, updateFormData, clearStorage } = useLocalStorage()
  const [craigslistUrl, setCraigslistUrl] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [listingDescription, setListingDescription] = useState("")
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    // Load saved data from localStorage
    const savedUrl = localStorage.getItem('craigslist-url')
    const savedPhone = localStorage.getItem('contact-phone')
    const savedFirstName = localStorage.getItem('first-name')
    const savedDescription = localStorage.getItem('listing-description')
    
    if (savedUrl) setCraigslistUrl(savedUrl)
    if (savedPhone) setContactPhone(savedPhone)
    if (savedFirstName) setFirstName(savedFirstName)
    if (savedDescription) setListingDescription(savedDescription)
  }, [])

  useEffect(() => {
    // Save data to localStorage
    if (isMounted) {
      if (craigslistUrl) localStorage.setItem('craigslist-url', craigslistUrl)
      if (contactPhone) localStorage.setItem('contact-phone', contactPhone)
      if (firstName) localStorage.setItem('first-name', firstName)
      if (listingDescription) localStorage.setItem('listing-description', listingDescription)
    }
  }, [craigslistUrl, contactPhone, firstName, listingDescription, isMounted])

  const handleAvailabilityChange = (availability: AvailabilityPeriod[]) => {
    updateFormData({ availability })
  }

  if (!isMounted) {
    return null
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCraigslistUrl(e.target.value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactPhone(e.target.value)
  }

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value)
  }

  const analyzeListing = async () => {
    if (!craigslistUrl.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: craigslistUrl,
          contactPhone: contactPhone
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setListingDescription(result.description)
      } else {
        console.error('Analysis failed:', result.error)
        setListingDescription(`Error analyzing listing: ${result.error}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      setListingDescription('Error: Could not analyze listing. Please check the URL and try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCallStart = () => {
    console.log('Call started for listing analysis')
  }

  const handleCallEnd = () => {
    console.log('Call ended')
  }

  const handleMessage = (message: any) => {
    console.log('Vapi message:', message)
    setAnalysisResults(prev => [...prev, message])
  }

  const clearData = () => {
    setCraigslistUrl("")
    setContactPhone("")
    setListingDescription("")
    setAnalysisResults([])
    localStorage.removeItem('craigslist-url')
    localStorage.removeItem('contact-phone')
    localStorage.removeItem('listing-description')
  }

  const copyToClipboard = async () => {
    if (listingDescription) {
      try {
        await navigator.clipboard.writeText(listingDescription)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
            kr
            <span className="inline-block bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">AI</span>
            g
            </h1>
          <p className="text-xl text-muted-foreground">
            The AI agent for Craigslist - analyze listings and call sellers on your behalf for the best price.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Listing Input Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Craigslist Listing URL
              </CardTitle>
              <CardDescription>
                Paste the Craigslist listing URL and your contact phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Craigslist URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://craigslist.org/ctd/electronics/d/iphone-12-128gb/..."
                  value={craigslistUrl}
                  onChange={handleUrlChange}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full URL of the Craigslist listing you want to analyze
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">Your First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
                <p className="text-xs text-muted-foreground">
                  Your first name - the AI assistant will introduce you by name to the seller
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Seller's Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contactPhone}
                  onChange={handlePhoneChange}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the seller's phone number from the listing - krAIg will call this number
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={analyzeListing}
                  disabled={!craigslistUrl.trim() || isAnalyzing}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Analyze Listing
                    </>
                  )}
                </Button>
                
                {(craigslistUrl.trim() || contactPhone.trim() || listingDescription.trim()) && (
                  <Button
                    onClick={clearData}
                    variant="outline"
                    size="default"
                  >
                    Clear All
                  </Button>
                )}
              </div>


              {/* Analysis Result */}
              {listingDescription && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Analyzed Listing Description</Label>
                    <Button
                      onClick={copyToClipboard}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={listingDescription}
                    readOnly
                    className="min-h-[120px] max-h-[200px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be used by the voice assistant for analysis
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Voice Analysis Card */}
          <div className="space-y-6">
            {/* Availability Section - Right Side */}
            <AvailabilitySection
              availability={formData.availability}
              onAvailabilityChange={handleAvailabilityChange}
            />

            <VapiCall
              listingText={listingDescription}
              sellerPhone={contactPhone}
              firstName={firstName}
              availability={formData.availability}
              negotiationStrategy={formData.negotiationStrategy}
              onNegotiationStrategyChange={(strategy) => updateFormData({ negotiationStrategy: strategy })}
              onCallStart={handleCallStart}
              onCallEnd={handleCallEnd}
              onMessage={handleMessage}
            />

            {/* Analysis Results */}
            {analysisResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Analysis History
                  </CardTitle>
                  <CardDescription>
                    Messages and insights from your voice analysis sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {analysisResults.slice(-10).map((result, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-muted-foreground mb-1">
                            {new Date().toLocaleTimeString()}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {JSON.stringify(result, null, 2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Get the most out of your Craigslist listing analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">1. Add URL</h4>
              <p className="text-sm text-muted-foreground">
                Copy and paste the Craigslist listing URL. Optionally add your contact phone number.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Analyze Listing</h4>
              <p className="text-sm text-muted-foreground">
                Click "Analyze Listing" to fetch and process the content using AI.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Voice Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Start a voice conversation to discuss pricing, red flags, and get purchasing advice.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Built by Karsten P and Nickita K with 🤖
          </p>
        </div>
      </div>
    </div>
  )
}
