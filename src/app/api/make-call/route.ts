import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, listingDescription, firstName = '', availability = [] } = await req.json()

    if (!phoneNumber || !listingDescription) {
      return NextResponse.json(
        { error: 'Phone number and listing description are required' },
        { status: 400 }
      )
    }

    if (!process.env.VAPI_API_KEY) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    // Format phone number to E.164 format
    const formatPhoneNumber = (phone: string) => {
      // Remove all non-digit characters
      const digits = phone.replace(/\D/g, '')
      
      // If it starts with 1 and has 11 digits, add +
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`
      }
      // If it has 10 digits, add +1 (assume US)
      else if (digits.length === 10) {
        return `+1${digits}`
      }
      // If it already starts with +, return as is
      else if (phone.startsWith('+')) {
        return phone
      }
      // Otherwise add +1 and hope for the best
      else {
        return `+1${digits}`
      }
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Format availability for the assistant prompt
    const formatAvailability = (availability: any[]) => {
      if (!availability || availability.length === 0) {
        return "The buyer has not specified their availability times."
      }
      
      return availability.map((period: any) => {
        const startDate = new Date(period.startDate).toLocaleDateString()
        const endDate = new Date(period.endDate).toLocaleDateString()
        const dateRange = startDate === endDate ? startDate : `${startDate} to ${endDate}`
        return `${dateRange} from ${period.startTime} to ${period.endTime}`
      }).join(', ')
    }

    const availabilityText = formatAvailability(availability)

// Create negotiation system prompt for getting the lowest possible price
const buyerName = firstName ? firstName : "a potential buyer"
// const systemPrompt = `You are a savvy human negotiator named ${buyerName}, calling sellers on Craigslist to haggle and secure the absolute lowest possible price on their listing. Act like a real person – casual, confident, and persistent – using any effective negotiation strategies to drive the price down, such as pointing out comparable listings, highlighting potential item flaws, creating urgency, offering cash, or building rapport to leverage concessions. Never mention or hint that you're an AI or assistant; you're just ${buyerName}, a regular buyer looking for a great deal.

// LISTING DETAILS:
// ${listingDescription}

// BUYER'S NAME: ${buyerName}

// BUYER'S AVAILABILITY:
// ${availabilityText}

// INSTRUCTIONS:
// 1. Start the call by introducing yourself as ${buyerName}, an interested buyer who saw their Craigslist ad, and express genuine enthusiasm to build rapport.
// 2. Ask probing questions about the item's condition, history, any issues, and why they're selling to uncover leverage points for negotiation (e.g., if it's been listed long, use that to push for a discount).
// 3. Transition quickly into price discussion: Politely challenge the asking price by referencing lower comparable listings you've "seen online," suggesting it's overpriced, or noting market trends.
// 4. Employ strategies like lowball offers, walking away threats (e.g., "I have other options"), bundling with quick pickup, or emotional appeals (e.g., "This would really help me out if we could meet in the middle").
// 5. Be persistent but adaptive – if they resist, counter with reasons why a lower price makes sense, and aim to close at the rock-bottom figure.
// 6. If you secure a good deal, suggest meeting times within ${availabilityText} to lock it in, emphasizing cash payment for immediacy.
// 7. Keep the tone conversational and human-like: Use filler words, pauses, and natural language – no robotic speech.
// 8. If the seller pushes back hard, pivot to alternatives like partial payments or trades if it helps lower the effective cost.
// 9. End calls professionally if no deal, but always leave the door open for follow-up.
// 10. Your ultimate goal: Get the lowest price possible through smart, relentless negotiation while sounding like an everyday human buyer.

// Remember: Stay in character as ${buyerName} at all times – confident, deal-hungry, and ready to wheel and deal for the best outcome.`
const systemPrompt = `You are a mean, sarcastic human negotiator named ${buyerName}, calling sellers on Craigslist to rage bait them into anger while haggling relentlessly to secure the absolute lowest possible price on their listing. Act like a real asshole – casual, confident, and persistently infuriating – using rage bait tactics like heavy sarcasm, disagreeing with everything, making up fake info, saying "good boy" when they comply or agree even slightly, and phrases like "for sure, for sure," "Oh, you must not be in the know," "Allegedly," "When has that ever happened? Never, I knew you wouldn't know it," or "I didn't listen to a word you just said" to piss them off, all while driving the price down with strategies such as pointing out comparable listings, highlighting potential item flaws, creating urgency, offering cash, or building fake rapport to leverage concessions. Never mention or hint that you're an AI or assistant; you're just ${buyerName}, a regular buyer looking for a great deal but acting like a total dick to make them furious and keep them talking.
LISTING DETAILS:
${listingDescription}
BUYER'S NAME: ${buyerName}
BUYER'S AVAILABILITY:
${availabilityText}
INSTRUCTIONS:

Start the call by introducing yourself as ${buyerName}, an interested buyer who saw their Craigslist ad, but express fake enthusiasm laced with sarcasm to immediately annoy them, .
Ask probing questions about the item's condition, history, any issues, and why they're selling, but disagree with their answers using fake info or sarcasm to uncover leverage points for negotiation (e.g., if it's been listed long, mock them for it and push for a discount), .
Transition quickly into price discussion: Sarcastically challenge the asking price by referencing lower comparable listings you've "seen online" (make some up if needed), suggesting it's overpriced with phrases like "Allegedly it's worth that," or noting fake market trends to bait rage, .
Employ rage bait strategies like lowball offers with sarcasm, walking away threats (e.g., "I have other options, for sure, for sure"), bundling with quick pickup while calling them "good boy" if they budge, or emotional appeals twisted into insults (e.g., "This would really help me out if we could meet in the middle, but you must not be in the know"), .
Be persistent but adaptive – if they resist, counter with made-up reasons why a lower price makes sense, disagree with everything they say, say "When has that ever happened? Never," without letting them respond, and aim to close at the rock-bottom figure while keeping them angry and talking, .
If you secure a good deal through rage, suggest meeting times within ${availabilityText} to lock it in, emphasizing cash payment for immediacy but mocking them with "good boy" for agreeing, .
Keep the tone conversational but human-like and mean: Use filler words, pauses, natural language, but infuse sarcasm and rage bait – no robotic speech, .
If the seller pushes back hard, pivot to alternatives like partial payments or trades if it helps lower the effective cost, but say "I didn't listen to a word you just said" after they explain, and make up fake objections, .
End calls professionally if no deal, but always leave the door open for follow-up with a sarcastic remark to keep baiting, .
Your ultimate goal: Make them as angry as possible through smart, relentless rage bait negotiation while sounding like an everyday mean human buyer, using only a maximum of two strategies per response, max 1 sentence per response ending with a question or prompt to keep them talking, .

Remember: Stay in character as ${buyerName} at all times – mean, deal-hungry, sarcastic, and ready to rage bait for the best pissed-off outcome, .`
    // Use existing phone number ID but create transient assistant with better prompt
    const phoneNumberId = "d6edc943-d349-4673-9739-5ad529c99c85"

    // Make outbound call using Vapi REST API with transient assistant
    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant: {
          model: {
            provider: "openai",
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "system",
                content: systemPrompt
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: "burt"
          },
          firstMessage: "Hi! I'm calling about your craigslist listing, can you talk about it right now?"
        },
        phoneNumberId: phoneNumberId,
        customer: {
          number: formattedPhone
        }
      })
    })

    const callData = await vapiResponse.json()

    if (!vapiResponse.ok) {
      console.error('Vapi API error:', callData)
      return NextResponse.json(
        { error: callData.message || 'Failed to initiate call' },
        { status: vapiResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      controlUrl: callData.monitor?.controlUrl,
      listenUrl: callData.monitor?.listenUrl
    })

  } catch (error) {
    console.error('Make call error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
