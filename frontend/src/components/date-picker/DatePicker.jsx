import React, { useState, useRef, useEffect } from 'react'
import './date-picker.css'

const DatePicker = ({ value, onChange, placeholder = 'Select date', disabled = false, min, disabledDates = [] }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const pickerRef = useRef(null)
    const inputRef = useRef(null)

    // Helper function to compare dates without time components
    const isSameDate = (date1, date2) => {
        if (!date1 || !date2) return false
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
    }

    // Normalize selected date to avoid timezone issues
    const selectedDate = value ? (() => {
        const date = new Date(value + 'T12:00:00')
        return date
    })() : null

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    // Format date for display
    const formatDate = (date) => {
        if (!date) return ''
        // Normalize date to avoid timezone issues
        const d = new Date(date + 'T12:00:00')
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Format date for input value (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return ''
        // Ensure we get the date in YYYY-MM-DD format consistently
        // Normalize to avoid timezone issues by using local date components
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const firstDayOfWeek = firstDay.getDay()
        const daysInMonth = lastDay.getDate()

        const days = []

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month (normalize to avoid timezone issues)
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day)
            // Normalize to local date by setting time to noon to avoid timezone issues
            dateObj.setHours(12, 0, 0, 0)
            days.push(dateObj)
        }

        return days
    }

    // Check if a date is within any disabled date range
    const isDateDisabled = (date) => {
        if (!date || disabled) return true

        // Normalize date to avoid timezone issues
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        checkDate.setHours(12, 0, 0, 0)

        for (const range of disabledDates) {
            const startDate = new Date(range.startDate)
            startDate.setHours(0, 0, 0, 0)

            const endDate = new Date(range.endDate)
            endDate.setHours(23, 59, 59, 999)

            if (checkDate >= startDate && checkDate <= endDate) {
                return true
            }
        }

        // Also check minimum date constraint
        if (min) {
            const minDate = new Date(min + 'T12:00:00') // Normalize min date
            minDate.setHours(0, 0, 0, 0)
            if (checkDate < minDate) {
                return true
            }
        }

        return false
    }

    // Check if current selection is valid (for dropoff date)
    const isCurrentSelectionValid = () => {
        if (!value) return true

        const selectedDate = new Date(value + 'T12:00:00')
        return !isDateDisabled(selectedDate)
    }

    // Handle date selection
    const handleDateClick = (date) => {
        if (!date || isDateDisabled(date)) return

        const formattedDate = formatDateForInput(date)
        onChange(formattedDate)
        setIsOpen(false)
    }

    // Handle input click
    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Update current month when selected date changes to a different month
    useEffect(() => {
        if (value && selectedDate) {
            const valueDate = new Date(value + 'T12:00:00')
            if (valueDate.getMonth() !== currentMonth.getMonth() ||
                valueDate.getFullYear() !== currentMonth.getFullYear()) {
                setCurrentMonth(new Date(valueDate.getFullYear(), valueDate.getMonth(), 1))
            }
        }
    }, [value, selectedDate, currentMonth])

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const goToToday = () => {
        setCurrentMonth(new Date())
    }

    const days = getDaysInMonth(currentMonth)

    return (
        <div className="date-picker" ref={pickerRef}>
            <div className="date-picker-input">
                <input
                    ref={inputRef}
                    type="text"
                    value={formatDate(value)}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                    className={`${disabled ? 'disabled' : ''} ${!isCurrentSelectionValid() ? 'invalid' : ''}`}
                />
                <i className={`ri-calendar-line ${isOpen ? 'active' : ''}`} onClick={handleInputClick}></i>
            </div>

            {isOpen && (
                <div className="date-picker-dropdown">
                    <div className="date-picker-header">
                        <button type="button" onClick={goToPreviousMonth} className="nav-btn">
                            <i className="ri-arrow-left-s-line"></i>
                        </button>
                        <h3>
                            {currentMonth.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h3>
                        <button type="button" onClick={goToNextMonth} className="nav-btn">
                            <i className="ri-arrow-right-s-line"></i>
                        </button>
                    </div>

                    <div className="date-picker-weekdays">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>

                    <div className="date-picker-days">
                        {days.map((date, index) => (
                            <div
                                key={index}
                                className={`day ${!date ? 'empty' :
                                        isSameDate(date, today) ? 'today' :
                                            selectedDate && isSameDate(date, selectedDate) ? 'selected' :
                                                isDateDisabled(date) ? 'disabled' : 'available'
                                    }`}
                                onClick={() => handleDateClick(date)}
                            >
                                {date ? date.getDate() : ''}
                            </div>
                        ))}
                    </div>

                    <div className="date-picker-footer">
                        <button type="button" onClick={goToToday} className="today-btn">
                            Today
                        </button>
                        <button type="button" onClick={() => setIsOpen(false)} className="close-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatePicker
