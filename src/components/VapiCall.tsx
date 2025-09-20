"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, PhoneOff } from 'lucide-react'
import { AvailabilityPeriod } from '@/hooks/useLocalStorage'

interface VapiCallProps {
  listingText: string
  sellerPhone: string
  firstName?: string
  availability?: AvailabilityPeriod[]
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
}

export function VapiCall({ listingText, sellerPhone, firstName, availability, onCallStart, onCallEnd, onMessage }: VapiCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [callStatus, setCallStatus] = useState<string>('Ready to call')
  const [callId, setCallId] = useState<string | null>(null)
  const [controlUrl, setControlUrl] = useState<string | null>(null)

  const startCall = async () => {
    if (!listingText.trim() || !sellerPhone.trim()) return

    setIsConnecting(true)
    setCallStatus('Initiating call...')

    try {
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: sellerPhone,
          listingDescription: listingText,
          firstName: firstName || '',
          availability: availability || []
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsCallActive(true)
        setIsConnecting(false)
        setCallId(result.callId)
        setControlUrl(result.controlUrl)
        setCallStatus(`Call initiated - Status: ${result.status}`)
        onCallStart?.()
        onMessage?.(result)
      } else {
        setCallStatus(`Failed to start call: ${result.error}`)
        setIsConnecting(false)
      }
    } catch (error) {
      console.error('Failed to start call:', error)
      setCallStatus('Failed to start call - Network error')
      setIsConnecting(false)
    }
  }

  const endCall = async () => {
    if (!callId || !controlUrl) return

    try {
      const response = await fetch(controlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'end-call'
        }),
      })

      if (response.ok) {
        setIsCallActive(false)
        setCallStatus('Call ended')
        setCallId(null)
        setControlUrl(null)
        onCallEnd?.()
      } else {
        setCallStatus('Failed to end call')
      }
    } catch (error) {
      console.error('Failed to end call:', error)
      setCallStatus('Failed to end call - Network error')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Seller
        </CardTitle>
        <CardDescription>
          AI assistant will call the seller on your behalf to inquire about the listing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Call Controls */}
        <div className="flex gap-2 justify-center">
          {!isCallActive && !isConnecting ? (
            <Button
              onClick={startCall}
              disabled={!listingText.trim() || !sellerPhone.trim()}
              size="lg"
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {sellerPhone ? `Call Seller ${sellerPhone}` : 'Call Seller'}
            </Button>
          ) : isConnecting ? (
            <Button
              disabled
              size="lg"
              className="flex items-center gap-2"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Calling...
            </Button>
          ) : (
            <Button
              onClick={endCall}
              variant="destructive"
              size="lg"
              className="flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          )}
        </div>

        {(!listingText.trim() || !sellerPhone.trim()) && !isConnecting && !isCallActive && (
          <p className="text-sm text-muted-foreground text-center">
            {!listingText.trim() && !sellerPhone.trim() 
              ? "Please analyze a Craigslist listing and enter the seller's phone number above."
              : !listingText.trim() 
              ? "Please analyze a Craigslist listing above first."
              : "Please enter the seller's phone number above."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
