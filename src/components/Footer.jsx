import React from 'react'
import { FaLocationArrow } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// styles
import './footer.css';


export default function Footer() {
    const handleNewsletterSubmit = () => {
        toast.success('Thank you for subscribing!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            closeButton: false,
        });
    };

    return (
        <>
            <footer>
                <div className='container'>
                    <div className='footer-content'>
                        <div className='footer-content-item'>
                            <div className='footer-logo'>
                                <img src='/logo-w.png' alt='Gamanata Logo' />
                            </div>
                            <p>gamanata.lk - Simple and reliable car rental service for your travel needs.</p>
                        </div>
                        <div className='footer-content-item'>
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href='/'>Home</a></li>
                                <li><a href='/services'>Cars</a></li>
                                <li><a href='/about'>About Us</a></li>
                                <li><a href='/contact'>Contact Us</a></li>
                            </ul>
                        </div>
                        <div className='footer-content-item'>
                            <h3>Social Media</h3>
                            <ul>
                                <li><a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer'>Facebook</a></li>
                                <li><a href='https://www.twitter.com' target='_blank' rel='noopener noreferrer'>Twitter</a></li>
                                <li><a href='https://www.instagram.com' target='_blank' rel='noopener noreferrer'>Instagram</a></li>
                                <li><a href='https://www.linkedin.com' target='_blank' rel='noopener noreferrer'>LinkedIn</a></li>
                            </ul>
                        </div>
                        <div className='footer-content-item'>
                            <h3>Newsletter</h3>
                            <p>
                                Subscribe to our newsletter for the latest updates and offers.
                            </p>
                            <div className='footer-newsletter-input'>
                                <input type="text" placeholder="Enter your email" />
                                <button onClick={handleNewsletterSubmit}><FaLocationArrow /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <ToastContainer />
        </>
    )
}
