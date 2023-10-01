import React from 'react'
import Title from '../title/Title'
import './why-choose.css'

export default function WhyChoose() {
    return (
        <>
            <div className='why-choose mt-64'>
                <div className='container'>
                    <Title title="Why Choose Us" subtitle="Experience the difference with our premium car rental services designed to exceed your expectations" justifyContent="center" />

                    <div className="why-choose-container mt-24">
                        <div className="why-choose-list">
                            <div className="why-choose-item">
                                <div className="why-choose-icon">
                                    <img src="/assets/icons/shield.svg" alt="" />
                                </div>
                                <div className="why-choose-content">
                                    <h3>Fully Insured</h3>
                                    <p>Comprehensive coverage for complete peace of mind during your rental period</p>
                                </div>
                            </div>
                            <div className="why-choose-item">
                                <div className="why-choose-icon">
                                    <img src="/assets/icons/clock.svg" alt="" />
                                </div>
                                <div className="why-choose-content">
                                    <h3>24/7 Support</h3>
                                    <p>Round-the-clock customer assistance whenever and wherever you need help</p>
                                </div>
                            </div>
                            <div className="why-choose-item">
                                <div className="why-choose-icon">
                                    <img src="/assets/icons/eco-car.svg" alt="" />
                                </div>
                                <div className="why-choose-content">
                                    <h3>Eco-Friendly</h3>
                                    <p>Large selection of hybrid and electric vehicles for sustainable travel</p>
                                </div>
                            </div>
                            <div className="why-choose-item">
                                <div className="why-choose-icon">
                                    <img src="/assets/icons/money-bag.svg" alt="" />
                                </div>
                                <div className="why-choose-content">
                                    <h3>Best Prices</h3>
                                    <p>Competitive rates with no hidden fees and transparent pricing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
