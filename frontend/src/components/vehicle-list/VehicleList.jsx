import React from 'react'
import './vehicle-list.css'
import VehicleCard from '../vehicle-card/VehicleCard'

export default function VehicleList({ data = [], currentUserId = null, onWishlistRemove }) {
    return (
        <>
            <div className='vehicle-list-1'>
                {data.map((v, index) => (
                  <VehicleCard
                    key={v._id || v.id || `vehicle-${index}`}
                    id={v._id || v.id}
                    slug={v.slug}
                    title={v.title}
                    pricePerDay={v.pricePerDay}
                    image={v.image}
                    description={v.description}
                    seats={v.seats}
                    bags={v.bags}
                    transmission={v.transmission}
                    available={v.available}
                    availableToday={v.availableToday}
                    favorite={v.favorite}
                    inWishlist={v.inWishlist}
                    isOwnVehicle={v.userId === currentUserId}
                    userId={v.userId}
                    bookLink={v.bookLink}
                    detailsLink={v.detailsLink}
                    onWishlistRemove={onWishlistRemove}
                  />
                ))}
            </div>
        </>
    )
}
