import React from 'react'
import './category.css'

import Title from '../title/Title'
import CategoryList from '../category-list/CategoryList'

export default function Category() {
  return (
    <div className="category mt-64">
        <div className="container">
            <Title title="Explore by Category" subtitle="Find the perfect vehicle for your needs from our diverse fleet of premium Vehicles." justifyContent="center" />
            <div className="category-container mt-16">
              <CategoryList />
            </div>
        </div>
    </div>
  )
}
