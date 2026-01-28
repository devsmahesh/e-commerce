'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  id?: string
  name?: string
  showTime?: boolean
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Pick a date',
  error,
  id,
  name,
  showTime = true,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? new Date(value) : null
  )
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(new Date(value), 'HH:mm') : ''
  )
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      try {
        // Handle both ISO string and datetime-local format
        let date: Date
        if (value.includes('T') && value.length === 16) {
          // datetime-local format: YYYY-MM-DDTHH:mm
          date = new Date(value + ':00')
        } else {
          date = new Date(value)
        }
        if (!isNaN(date.getTime())) {
          setSelectedDate(date)
          setTimeValue(format(date, 'HH:mm'))
        }
      } catch (e) {
        // Invalid date, ignore
      }
    } else {
      setSelectedDate(null)
      setTimeValue('')
    }
  }, [value])

  const handleDateSelect = (date: Date | null) => {
    if (!date) {
      setSelectedDate(null)
      setTimeValue('')
      onChange('')
      return
    }

    // Check if date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(date)
    selectedDateOnly.setHours(0, 0, 0, 0)
    
    if (selectedDateOnly < today) {
      // Don't allow past dates
      return
    }

    setSelectedDate(date)
    
    // Combine date with time if time is set
    const now = new Date()
    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(':')
      date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0)
      
      // If combined datetime is in the past, adjust to current time
      if (date < now) {
        date.setHours(now.getHours(), now.getMinutes(), 0, 0)
        setTimeValue(format(date, 'HH:mm'))
      }
    } else if (showTime && !timeValue) {
      // If no time set and it's today, use current time, otherwise use midnight
      if (selectedDateOnly.getTime() === today.getTime()) {
        date.setHours(now.getHours(), now.getMinutes(), 0, 0)
        setTimeValue(format(date, 'HH:mm'))
      } else {
        date.setHours(0, 0, 0, 0)
      }
    }
    
    // Convert to ISO string format for datetime-local input compatibility
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`
    
    onChange(datetimeLocal)
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0)
      
      // Check if the combined datetime is in the past
      const now = new Date()
      if (newDate < now) {
        // If past datetime, set to current time
        const currentTime = format(now, 'HH:mm')
        setTimeValue(currentTime)
        newDate.setHours(now.getHours(), now.getMinutes(), 0, 0)
      }
      
      // Convert to ISO string format for datetime-local input compatibility
      const year = newDate.getFullYear()
      const month = String(newDate.getMonth() + 1).padStart(2, '0')
      const day = String(newDate.getDate()).padStart(2, '0')
      const finalHours = String(newDate.getHours()).padStart(2, '0')
      const finalMinutes = String(newDate.getMinutes()).padStart(2, '0')
      const datetimeLocal = `${year}-${month}-${day}T${finalHours}:${finalMinutes}`
      
      onChange(datetimeLocal)
    }
  }

  const formatDisplayValue = () => {
    if (!selectedDate) return ''
    try {
      if (showTime && timeValue) {
        return format(selectedDate, 'dd-MM-yyyy') + ' ' + timeValue
      }
      return format(selectedDate, 'dd-MM-yyyy')
    } catch (e) {
      return ''
    }
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth)
  const [displayYear, setDisplayYear] = React.useState(currentYear)

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysArray = () => {
    const days = []
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      displayMonth === today.getMonth() &&
      displayYear === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      displayMonth === selectedDate.getMonth() &&
      displayYear === selectedDate.getFullYear()
    )
  }

  const isPastDate = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(displayYear, displayMonth, day)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  const handleDayClick = (day: number) => {
    if (isPastDate(day)) {
      return // Prevent selecting past dates
    }
    const newDate = new Date(displayYear, displayMonth, day)
    handleDateSelect(newDate)
    if (!showTime) {
      setIsOpen(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const today = new Date()
      const currentDisplayDate = new Date(displayYear, displayMonth, 1)
      // Prevent navigating to months before current month
      if (currentDisplayDate <= new Date(today.getFullYear(), today.getMonth(), 1)) {
        return
      }
      if (displayMonth === 0) {
        setDisplayMonth(11)
        setDisplayYear(displayYear - 1)
      } else {
        setDisplayMonth(displayMonth - 1)
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0)
        setDisplayYear(displayYear + 1)
      } else {
        setDisplayMonth(displayMonth + 1)
      }
    }
  }

  const canNavigatePrev = () => {
    const today = new Date()
    const currentDisplayDate = new Date(displayYear, displayMonth, 1)
    return currentDisplayDate > new Date(today.getFullYear(), today.getMonth(), 1)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? formatDisplayValue() : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth('prev')}
                disabled={!canNavigatePrev()}
              >
                ←
              </Button>
              <div className="font-semibold">
                {monthNames[displayMonth]} {displayYear}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateMonth('next')}
              >
                →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                  {day}
                </div>
              ))}
              {getDaysArray().map((day, index) => {
                const isPast = day ? isPastDate(day) : false
                return (
                  <button
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    disabled={!day || isPast}
                    className={cn(
                      'h-8 w-8 rounded-md text-sm transition-colors',
                      !day && 'cursor-default',
                      day && !isPast && 'hover:bg-accent hover:text-accent-foreground',
                      day && isPast && 'opacity-40 cursor-not-allowed',
                      day && isToday(day) && 'bg-accent font-semibold',
                      day && isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      day && isPast && isSelected(day) && 'opacity-100'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Time Picker */}
            {showTime && (
              <div className="mt-4 pt-4 border-t">
                <Label htmlFor={`${id}-time`} className="text-sm mb-2 block">
                  Time
                </Label>
                <Input
                  id={`${id}-time`}
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(null)
                  setTimeValue('')
                  onChange('')
                  setIsOpen(false)
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

