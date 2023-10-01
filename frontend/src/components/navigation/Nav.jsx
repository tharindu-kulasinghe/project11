import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './nav.css'

// Function to decode JWT token
function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (e) {
        return null;
    }
}

const Nav = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const profileRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleTokenUpdate = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = decodeToken(token);
                if (decoded) {
                    setIsProfileOpen(true);
                } else {
                    setIsProfileOpen(false);
                    localStorage.removeItem('token');
                }
            } else {
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('tokenUpdated', handleTokenUpdate);
        handleTokenUpdate();
        return () => {
            window.removeEventListener('tokenUpdated', handleTokenUpdate);
        };
    }, []);

    const toggleDropdown = useCallback((event) => {
        event.preventDefault();
        setIsDropdownOpen(prev => !prev);
    }, []);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsProfileOpen(false);
        window.dispatchEvent(new CustomEvent('tokenUpdated'));
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                profileRef.current && !profileRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav>
            <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
                <div className="nav-left">
                    <div className="logo">
                        <img src="/assets/images/logo-w.png" alt="" />
                    </div>

                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                        </li>
                        <li>
                            <Link to="/vehicles">Vehicles</Link>
                        </li>
                        <li>
                            <Link to="/contact">Contact</Link>
                        </li>
                    </ul>
                </div>
                <div className="nav-right">
                    <div className="nav-contact">
                        <a href="tel:+94771234567"> <i className="ri-phone-line"></i>&nbsp;+94771234567</a>
                        <a href="mailto:info@gamanata.com"> <i className="ri-mail-line"></i>&nbsp;info@gamanata.lk</a>
                    </div>
                    {/* <div className="nav-icon" style={{ display: isProfileOpen ? undefined : 'none' }}>
                        <Link to="/wishlist">
                            <i className="ri-heart-line"></i>
                        </Link>
                    </div> */}

                    <div className="nav-buttons" style={{ display: isProfileOpen ? 'none' : undefined }}>
                        <Link to="/login">Login</Link>
                    </div>

                    <div className="nav-buttons add-vehicle-button" style={{ display: isProfileOpen ? undefined : 'none' }}>
                        <Link to="/add-vehicle">Add Vehicle</Link>
                    </div>

                    <div className="nav-profile" style={{ display: isProfileOpen ? undefined : 'none' }}>
                        <a href="#" onClick={toggleDropdown} ref={profileRef}>
                            <img src="/assets/images/demo/profile.jpg" alt="" />
                        </a>

                        <div className={`nav-profile-dropdown ${isDropdownOpen ? 'active' : ''}`} ref={dropdownRef}>
                            <ul>
                                <li>
                                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)}> <i className="ri-user-line"></i>&nbsp;Profile</Link>
                                </li>
                                <li>
                                    <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)}> <i className="ri-heart-line"></i>&nbsp;Wishlist</Link>
                                </li>
                                <li>
                                    <Link to="/rental-history" onClick={() => setIsDropdownOpen(false)}> <i className="ri-history-line"></i>&nbsp;Rental History</Link>
                                </li>
                                <li>
                                    <Link to="/rent-out" onClick={() => setIsDropdownOpen(false)}> <i className="ri-history-line"></i>&nbsp;Rent Out History</Link>
                                </li>
                                <li>
                                    <Link to="/my-vehicles" onClick={() => setIsDropdownOpen(false)}> <i className="ri-car-line"></i>&nbsp;My Vehicles</Link>
                                </li>
                                <li>
                                    <a href="#" onClick={handleLogout}> <i className="ri-logout-box-line"></i>&nbsp;Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="nav-toggle">
                        <i className="ri-menu-line" onClick={toggleMenu}></i>
                    </div>
                </div>
            </div>
            <div className={`nav-mobile ${isMenuOpen ? 'active' : ''}`}>
                <div className="close" onClick={closeMenu}>
                    <i className="ri-close-line"></i>
                </div>
                <ul>
                    <li>
                        <Link to="/" onClick={closeMenu}>Home</Link>
                    </li>
                    <li>
                        <Link to="/about" onClick={closeMenu}>About</Link>
                    </li>
                    <li>
                        <Link to="/vehicles" onClick={closeMenu}>Vehicles</Link>
                    </li>
                    <li>
                        <Link to="/contact" onClick={closeMenu}>Contact</Link>
                    </li>
                </ul>
                <div className="nav-mobile-content">
                    <a href="tel:+94771234567"> <i className="ri-phone-line"></i>&nbsp;+94771234567</a>
                    <a href="mailto:info@gamanata.com"> <i className="ri-mail-line"></i>&nbsp;info@gamanata.lk</a>
                </div>
            </div>
        </nav>
    );
};

export default React.memo(Nav);
