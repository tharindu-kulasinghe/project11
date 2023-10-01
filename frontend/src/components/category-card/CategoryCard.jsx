import React from 'react'
import './category-card.css'

export default function CategoryCard({
  title,
  priceFrom,
  image,
  description,
  vehiclesCount,
  link
}) {
  return (
    <>
      <div className="category-card">
        <div className="category-card-image">
          <div className='category-card-image-gradient'></div>
          <img src={image} alt={title} />
          <div className="category-card-image-overlay">
            <h1>{title}</h1>
            <p>From ${priceFrom}/day</p>
          </div>
        </div>
        <div className="category-card-content">
          <p>{description}</p>
        </div>
        <div className="category-card-footer">
          <p>{vehiclesCount}+ vehicles</p>
          <a href={link}>View All</a>
        </div>
      </div>
    </>
  )
}
