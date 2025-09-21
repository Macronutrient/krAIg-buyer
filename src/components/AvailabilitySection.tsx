"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTimePicker } from "./DateTimePicker"
import { AvailabilityPeriod } from "@/hooks/useLocalStorage"

interface AvailabilitySectionProps {
  availability: AvailabilityPeriod[]
  onAvailabilityChange: (availability: AvailabilityPeriod[]) => void
}

export function AvailabilitySection({ availability, onAvailabilityChange }: AvailabilitySectionProps) {
  const [newPeriod, setNewPeriod] = useState<Partial<AvailabilityPeriod>>({
    startDate: undefined,
    endDate: undefined,
    startTime: "09:00",
    endTime: "17:00"
  })

  const addAvailabilityPeriod = () => {
    console.log('Adding availability period:', newPeriod) // Debug log
    
    if (newPeriod.startDate && newPeriod.endDate && newPeriod.startTime && newPeriod.endTime) {
      // Validate that end date is not before start date
      if (newPeriod.endDate < newPeriod.startDate) {
        console.error('End date cannot be before start date')
        return
      }
      
      const period: AvailabilityPeriod = {
        id: Date.now().toString(),
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate,
        startTime: newPeriod.startTime,
        endTime: newPeriod.endTime
      }
      
      console.log('Created period:', period) // Debug log
      onAvailabilityChange([...availability, period])
      
      // Reset the form
      setNewPeriod({
        startDate: undefined,
        endDate: undefined,
        startTime: "09:00",
        endTime: "17:00"
      })
    } else {
      console.log('Incomplete period data:', newPeriod) // Debug log
    }
  }

  const removePeriod = (id: string) => {
    onAvailabilityChange(availability.filter(period => period.id !== id))
  }

  const canAddPeriod = newPeriod.startDate && newPeriod.endDate && newPeriod.startTime && newPeriod.endTime

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Availability
        </CardTitle>
        <CardDescription>
          Add time periods when you're available for contact about your listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new period form */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">Add Availability Period</h4>
          <div className="space-y-4">
            <DateTimePicker
              date={newPeriod.startDate}
              time={newPeriod.startTime || "09:00"}
              onDateChange={(date) => setNewPeriod(prev => ({ ...prev, startDate: date }))}
              onTimeChange={(time) => setNewPeriod(prev => ({ ...prev, startTime: time }))}
              label="Start Date & Time"
              placeholder="Select start date"
            />
            <DateTimePicker
              date={newPeriod.endDate}
              time={newPeriod.endTime || "17:00"}
              onDateChange={(date) => setNewPeriod(prev => ({ ...prev, endDate: date }))}
              onTimeChange={(time) => setNewPeriod(prev => ({ ...prev, endTime: time }))}
              label="End Date & Time"
              placeholder="Select end date"
            />
          </div>
          <Button 
            onClick={addAvailabilityPeriod} 
            disabled={!canAddPeriod}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </div>

        {/* Display existing periods */}
        {availability.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Your Availability ({availability.length} period{availability.length !== 1 ? 's' : ''})</h4>
            {availability.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {period.startDate.toLocaleDateString()} at {period.startTime} 
                    {' → '} 
                    {period.endDate.toLocaleDateString()} at {period.endTime}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {period.startDate.toLocaleDateString() === period.endDate.toLocaleDateString() 
                      ? 'Same day' 
                      : `${Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24))} day(s)`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePeriod(period.id)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {availability.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No availability periods added yet.</p>
            <p className="text-xs">Add times when you're available to be contacted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}