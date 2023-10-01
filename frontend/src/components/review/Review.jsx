import React, { useMemo, useState, useCallback } from 'react'
import './review.css'
import Pagination from '@mui/material/Pagination'

export default function Review({ reviews = [] }) {
    const [page, setPage] = useState(1)
    const perPage = 50
    const total = useMemo(() => reviews.length, [reviews])
    const pageCount = useMemo(() => Math.ceil(total / perPage), [total, perPage])

    const currentReviews = useMemo(() => {
        const start = (page - 1) * perPage
        return reviews.slice(start, start + perPage)
    }, [reviews, page, perPage])

    const handlePageChange = useCallback((_, value) => {
        setPage(value)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <div className="review">
            <h1>Customer Reviews</h1>
            <div className="review-list">
                {currentReviews.length > 0 ? (
                    currentReviews.map((review, idx) => (
                        <div className="review-item" key={review._id || review.id || `${review.bookingId}-${review.userId}-${idx}`}>
                            <div className="review-profile">
                                <img src={review.profileImage} alt={review.name} />
                            </div>
                            <div className="review-body">
                                <div className="review-details">
                                    <div className="review-content">
                                        <div className="review-name">
                                            <h2>{review.name}</h2>
                                            <ul>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <li key={index} className={index < review.rating ? 'active' : ''}>
                                                        <i className="ri-star-fill"></i>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="review-date">
                                            <p>{review.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="review-text">
                                    <p>{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No reviews available for this vehicle.</p>
                )}
            </div>
            {pageCount > 1 && (
                <div className="review-pagination">
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        siblingCount={1}
                        boundaryCount={1}
                    />
                </div>
            )}
        </div>
    )
}
