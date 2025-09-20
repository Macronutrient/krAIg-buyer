"use client"

import { useState, useEffect } from 'react'

export interface AvailabilityPeriod {
  id: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
}

export interface FormData {
  category: string
  phoneNumber: string
  context: string
  availability: AvailabilityPeriod[]
}

const STORAGE_KEY = 'craigslist-form-data'

export function useLocalStorage() {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    phoneNumber: '',
    context: '',
    availability: []
  })

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedData = JSON.parse(stored)
        // Convert date strings back to Date objects
        const availability = parsedData.availability?.map((period: any) => ({
          ...period,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate)
        })) || []
        
        setFormData({
          ...parsedData,
          availability
        })
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [])

  // Save data to localStorage whenever formData changes
  const saveToStorage = (data: FormData) => {
    try {
      console.log('Saving to localStorage:', data) // Debug log
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setFormData(data)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const updateFormData = (updates: Partial<FormData>) => {
    const newData = { ...formData, ...updates }
    console.log('Updating form data:', updates) // Debug log
    saveToStorage(newData)
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setFormData({
        category: '',
        phoneNumber: '',
        context: '',
        availability: []
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  return {
    formData,
    updateFormData,
    clearStorage
  }
}