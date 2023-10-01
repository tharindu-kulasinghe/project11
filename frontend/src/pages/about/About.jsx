import React from 'react'
import './about.css'
import Title from '../../components/title/Title'

const About = () => {
    return (
        <div className="about">
                <div className="container">
                    <div className='about-container'>
                        <div className="about-header">
                            <Title title="About Gamanata.lk" subtitle="For over two decades, Gamanata.lk has been the premier destination for luxury car rentals, providing exceptional vehicles and unparalleled service to discerning customers worldwide." justifyContent="center" width="800px" />
                        </div>
                        <div className="about-story">
                            <div className="about-story-details">
                                <div className="about-story-header">
                                    <h1>Our Story</h1>
                                    <p>Founded in 2001 by automotive enthusiasts, RentWheels began with a simple vision: to make luxury vehicles accessible to everyone. What started as a small fleet of premium vehicles has evolved into a comprehensive rental service with over 500 vehicles across multiple locations.
                                        <br /><br />
                                        Our commitment to excellence has earned us the trust of over 50,000 satisfied customers and established us as the industry leader in premium vehicle rentals.</p>
                                </div>
                                <div className="about-story-rating">
                                    <div className="about-story-rating-item">
                                        <h1>100+</h1>
                                        <p>Premium Vehicles</p>
                                    </div>
                                    <div className="about-story-rating-item">
                                        <h1>50K+</h1>
                                        <p>Happy Customers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="about-story-image">
                                <img src="/assets/images/hero-bg.jpg" alt="Our Story" loading="lazy" />
                            </div>
                        </div>
                        <div className="about-values">
                            <div className="about-value-item">
                                <div className="icon">
                                    <img src="/assets/icons/star.svg" alt="" />
                                </div>
                                <div className="content">
                                    <h1>Excellence</h1>
                                    <p>We maintain the highest standards in vehicle quality, customer service, and overall experience.</p>
                                </div>
                            </div>
                            <div className="about-value-item">
                                <div className="icon">
                                    <img src="/assets/icons/shield.svg" alt="" />
                                </div>
                                <div className="content">
                                    <h1>Trust</h1>
                                    <p>Building lasting relationships through transparency, reliability, and consistent service delivery.</p>
                                </div>
                            </div>
                            <div className="about-value-item">
                                <div className="icon">
                                    <img src="/assets/icons/light-bulb.svg" alt="" />
                                </div>
                                <div className="content">
                                    <h1>Innovation</h1>
                                    <p>Continuously innovating to offer cutting-edge technology, advanced features, and unique experiences.</p>
                                </div>
                            </div>
                        </div>
                        <div className="about-leadership">
                        <Title title="Meet Our Leadership Team" justifyContent="center"></Title>
                            <div className="leadership-list">
                                <div className="leadership-item">
                                    <div className="leadership-image">
                                        <img src="/assets/images/demo/profile.jpg" alt="Nimal Kumara" loading="lazy" />
                                    </div>
                                    <div className="leadership-deatils">
                                        <h1>Nimal Kumara</h1>
                                        <p>CEO & Founder</p>
                                    </div>
                                    <div className='leadership-description'>
                                        <p>20+ years in automotive industry leadership</p>
                                    </div>
                                </div>
                                <div className="leadership-item">
                                    <div className="leadership-image">
                                        <img src="/assets/images/demo/profile.jpg" alt="Team Member" loading="lazy" />
                                    </div>
                                    <div className="leadership-deatils">
                                        <h1>Nimal Kumara</h1>
                                        <p>CEO & Founder</p>
                                    </div>
                                    <div className='leadership-description'>
                                        <p>20+ years in automotive industry leadership</p>
                                    </div>
                                </div>
                                <div className="leadership-item">
                                    <div className="leadership-image">
                                        <img src="/assets/images/demo/profile.jpg" alt="Team Member" loading="lazy" />
                                    </div>
                                    <div className="leadership-deatils">
                                        <h1>Nimal Kumara</h1>
                                        <p>CEO & Founder</p>
                                    </div>
                                    <div className='leadership-description'>
                                        <p>20+ years in automotive industry leadership</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div> 
                </div>
        </div>
    )
}

export default About;
