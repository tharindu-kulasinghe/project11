import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
    const year = useMemo(() => new Date().getFullYear(), []);
    return (
        <footer className="footer mt-64">
                <div className="container">
                    <div className="footer-container">
                        <div className='footer-item'>
                            <div className="footer-logo">
                                <img src="/assets/images/logo-w.png" alt="" />
                            </div>
                            <div className="footer-description">
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti dolores distinctio nam nostrum, reprehenderit delectus quam nihil ratione fuga amet!</p>
                            </div>
                            <div className='footer-soical-media'>
                                <ul>
                                    <li>
                                        <a href=""><i className="ri-facebook-fill"></i></a>
                                    </li>
                                    <li>
                                        <a href=""><i className="ri-twitter-fill"></i></a>
                                    </li>
                                    <li>
                                        <a href=""><i className="ri-instagram-fill"></i></a>
                                    </li>
                                    <li>
                                        <a href=""><i className="ri-youtube-fill"></i></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className='footer-item'>
                            <h3 className='footer-title'>Quick Links</h3>
                            <div className='footer-links'>
                                <ul>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/about">About</Link></li>
                                    <li><Link to="/vehicles">Vehicles</Link></li>
                                    <li><Link to="/contact">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className='footer-item'>
                            <h3 className='footer-title'>Contact Us</h3>
                            <div className='footer-contact'>
                                <ul>
                                    <li>Email<a href="mailto:info@gamanata.lk">info@gamanata.lk</a></li>
                                    <li>Phone<a href="tel:+94775200106">+94 77 520 0106</a></li>
                                    <li>Address<span>14 Sir Baron Jayathilake Mawatha, Colombo 01</span></li>
                                </ul>
                            </div>
                        </div>
                        <div className='footer-item'>
                            <h3 className='footer-title'>Newsletter</h3>
                            <div className="footer-newsletter">
                                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                                    <input type="email" placeholder="Enter your email" required />
                                    <button type="submit">Subscribe</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='footer-bottom'>
                    <p>© {year} Gamanata. All rights reserved.</p>
                </div>
        </footer>
    );
};

export default React.memo(Footer);
