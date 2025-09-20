import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, phone_number, context, availability } = body

    if (!category || !phone_number) {
      return NextResponse.json(
        { error: 'Both category and phone number are required' },
        { status: 400 }
      )
    }

    // Print to console as requested
    console.log('\n=== USER SUBMISSION ===')
    console.log(`Selected Category: ${category}`)
    console.log(`Phone Number: ${phone_number}`)
    
    if (context && context.trim()) {
      console.log(`\nAdditional Context:`)
      console.log(`"${context.trim()}"`)
    }
    
    if (availability && availability.length > 0) {
      console.log(`\nAvailability (${availability.length} period${availability.length !== 1 ? 's' : ''}):`)
      availability.forEach((period: any, index: number) => {
        const startDate = new Date(period.startDate).toLocaleDateString()
        const endDate = new Date(period.endDate).toLocaleDateString()
        console.log(`  ${index + 1}. ${startDate} ${period.startTime} → ${endDate} ${period.endTime}`)
      })
    } else {
      console.log('\nAvailability: No periods specified')
    }
    
    console.log('========================\n')

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully!',
      data: {
        category,
        phone_number,
        context: context || '',
        availability: availability || []
      }
    })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
}