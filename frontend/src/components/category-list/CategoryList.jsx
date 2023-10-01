import React, { useEffect, useState } from 'react'
import './category-list.css'
import CategoryCard from '../category-card/CategoryCard'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function CategoryList() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError('')

            // Fetch vehicle types
            const typesResponse = await fetch(`${API_BASE}/api/vehicle-types`)
            if (!typesResponse.ok) {
                throw new Error('Failed to fetch vehicle types')
            }
            const vehicleTypes = await typesResponse.json()

            // Fetch all vehicles to count by type
            const vehiclesResponse = await fetch(`${API_BASE}/api/vehicles`)
            const vehicles = vehiclesResponse.ok ? await vehiclesResponse.json() : []

            // Transform vehicle types to category format
            const transformedCategories = vehicleTypes.map(type => {
                // Count vehicles of this type
                const vehiclesOfType = vehicles.filter(vehicle =>
                    vehicle.vehicleType === type._id || vehicle.vehicleType?._id === type._id
                )

                // Find minimum price for this type
                const prices = vehiclesOfType
                    .map(vehicle => vehicle.pricePerDayLKR || vehicle.pricePerDay || 0)
                    .filter(price => price > 0)

                const minPrice = prices.length > 0 ? Math.min(...prices) : 25

                return {
                    id: type._id,
                    title: type.name,
                    priceFrom: minPrice,
                    image: type.image ? `${API_BASE}${type.image}` : '/assets/images/hero-bg.jpg',
                    description: type.description || `${type.name} vehicles for all your transportation needs.`,
                    vehiclesCount: vehiclesOfType.length,
                    link: `/vehicles?type=${encodeURIComponent(type.name)}`
                }
            })

            setCategories(transformedCategories)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setError(error.message || 'Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="category-list">
                <div className="category-list-container">
                    <div className="loading">Loading categories...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="category-list">
                <div className="category-list-container">
                    <div className="error-message">Failed to load categories</div>
                </div>
            </div>
        )
    }

    return (
        <div className="category-list">
            <div className="category-list-container">
                <div className="category-list-item">
                    {categories.map(item => (
                        <CategoryCard
                            key={item.id}
                            title={item.title}
                            priceFrom={item.priceFrom}
                            image={item.image}
                            description={item.description}
                            vehiclesCount={item.vehiclesCount}
                            link={item.link}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
