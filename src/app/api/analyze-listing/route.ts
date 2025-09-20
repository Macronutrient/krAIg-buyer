import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { url, contactPhone } = await req.json()

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate that it's a Craigslist URL
    if (!url.includes('craigslist.org')) {
      return NextResponse.json(
        { error: 'Please provide a valid Craigslist URL' },
        { status: 400 }
      )
    }

    // Fetch the Craigslist listing content
    let listingContent = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      listingContent = await response.text()
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError)
      return NextResponse.json(
        { error: 'Could not fetch the Craigslist listing. Please check the URL and try again.' },
        { status: 400 }
      )
    }

    // Extract image URLs from HTML content
    const imageUrlRegex = /<img[^>]+src="([^"]*)"[^>]*>/g
    const imageUrls: string[] = []
    let match
    while ((match = imageUrlRegex.exec(listingContent)) !== null) {
      const imageUrl = match[1]
      // Filter for actual image URLs and make them absolute URLs if needed
      if (imageUrl && (imageUrl.includes('craigslist.org') || imageUrl.startsWith('http'))) {
        imageUrls.push(imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`)
      }
    }

    // First, analyze the text content
    const textAnalysisPrompt = `
Please analyze this Craigslist listing HTML content and extract key information. Focus on:

1. Item title/name
2. Price (asking price, if negotiable)
3. Item description and condition
4. Location
5. Contact information
6. Key features or specifications
7. Any red flags or concerns
8. Posted date if available

Provide a comprehensive summary that would be useful for someone considering purchasing this item. Format it as a clear, structured description.

Here's the HTML content:
${listingContent.substring(0, 8000)} // Limit content to avoid token limits

${contactPhone ? `The buyer's contact phone number is: ${contactPhone}` : ''}
`

    try {
      // Analyze text content
      const textCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing Craigslist listings and extracting key information for potential buyers. Provide clear, structured summaries that highlight important details, potential concerns, and value assessments."
          },
          {
            role: "user",
            content: textAnalysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      let description = textCompletion.choices[0]?.message?.content?.trim()

      // If there are images, analyze them too
      if (imageUrls.length > 0 && description) {
        try {
          // Analyze up to 3 images to avoid token limits
          const imagesToAnalyze = imageUrls.slice(0, 3)
          
          const imageAnalysisCompletion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Please analyze these images from the Craigslist listing and describe:
1. What you see in the images
2. Condition of the item(s)
3. Any notable details or features
4. Quality of the photos
5. Any potential concerns visible in the images

Provide a detailed description that would help a potential buyer understand what they're looking at.`
                  },
                  ...imagesToAnalyze.map(url => ({
                    type: "image_url" as const,
                    image_url: {
                      url: url,
                      detail: "low" as const
                    }
                  }))
                ]
              }
            ],
            max_tokens: 800,
            temperature: 0.3
          })

          const imageDescription = imageAnalysisCompletion.choices[0]?.message?.content?.trim()
          
          if (imageDescription) {
            description += `\n\n**Image Analysis:**\n${imageDescription}`
            description += `\n\n**Images Found:** ${imageUrls.length} image(s) in the listing`
          }
        } catch (imageError) {
          console.error('Error analyzing images:', imageError)
          description += `\n\n**Images Found:** ${imageUrls.length} image(s) in the listing (image analysis unavailable)`
        }
      } else if (imageUrls.length > 0) {
        description += `\n\n**Images Found:** ${imageUrls.length} image(s) in the listing`
      } else {
        description += `\n\n**Images Found:** No images detected in this listing`
      }

      if (!description) {
        return NextResponse.json(
          { error: 'Could not analyze the listing content' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        description,
        url,
        contactPhone: contactPhone || null,
        analyzedAt: new Date().toISOString()
      })

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return NextResponse.json(
        { error: 'Error analyzing listing with AI. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
