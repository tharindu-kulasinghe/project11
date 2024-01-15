import React from "react";
import { Link } from "react-router-dom";

// components
import Buttons from "./Buttons";

// styles
import "./nav.css";

// icons
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { FaPhone } from "react-icons/fa6";

export default function Nav() {
    const [menuActive, setMenuActive] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(true);
    const [profileDropdownActive, setProfileDropdownActive] = React.useState(false);

    const handleMenuClick = () => {
        setMenuActive((prev) => !prev);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        setMenuActive(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setMenuActive(false);
    };

    const handleProfileClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents the document click handler from closing it immediately
        setProfileDropdownActive((prev) => !prev);
    };

    React.useEffect(() => {
        const closeDropdown = () => {
            setProfileDropdownActive(false);
        };

        document.addEventListener('click', closeDropdown);

        return () => {
            document.removeEventListener('click', closeDropdown);
        };
    }, []);

    return (
        <>
            <header>
                <div className="container">
                    <div className="header-content">
                        <div className="header-content-1">
                            <ul>
                                <li>
                                    <a href="mailto:tharindukulasinghe@fuchisus.com"><IoIosMail /> <span>tharindukulasinghe@fuchisus.com</span></a>
                                </li>
                                <li>
                                    <a href="tel:+94775200106"><FaPhone /> <span>+94 7752 00106</span></a>
                                </li>
                            </ul>
                        </div>
                        <div className="header-content-2">
                            <ul>
                                <li>
                                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                                        <FaFacebook />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                        <FaInstagram />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                                        <FaLinkedin />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                                        <FaTwitter />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
            <nav>
                <div className="container">
                    <div className="nav-content">
                        {/* navigation logo */}
                        <div className="nav-content-1">
                            <Link to="/" className="logo">
                                <img src="/logo-w.png" alt="Logo" />
                            </Link>
                        </div>
                        {/* navigation links and login signup*/}
                        <div className="nav-content-2">
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/cars">Cars</Link></li>
                                <li><Link to="/about">About</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                            <div className="nav-content-2-buttons">
                                {isLoggedIn ? (
                                    <div className="nav-profile-container">
                                        {/* profile icon */}
                                        <div className="nav-profile">
                                            <img src="/demo/profile.jpg" alt="Profile" onClick={handleProfileClick} />
                                        </div>
                                        {/* nav profile dropdown */}
                                        <div className={`nav-profile-dropdown${profileDropdownActive ? " active" : ""}`}>
                                            <ul>
                                                <li><Link to="/profile"><span>Profile</span></Link></li>
                                                <li><Link to="/rent-history"><span>Cars Rent History</span></Link></li>
                                                <li><a href="#" onClick={handleLogout}><span>Logout</span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="nav-login">
                                            <Buttons text="Login" onClick={handleLogin} />
                                        </div>
                                        <div className="nav-signup">
                                            <Buttons text="Signup" path="#" />
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* navigation menu icon */}
                            <div className="nav-menu">
                                <div
                                    className={`nav-menu-icon${menuActive ? " active" : ""}`}
                                    onClick={handleMenuClick}
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <menu>
                <div className={`mobile-menu${menuActive ? " active" : ""}`}>
                    {isLoggedIn ? (
                        <>
                            <div className="menu-profile">
                                <img src="/demo/profile.jpg" alt="Profile" />
                            </div>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/cars">Cars</Link></li>
                                <li><Link to="/profile">Profile</Link></li>
                                <li><Link to="/about">About</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/rent-history">Cars Rent History</Link></li>
                            </ul>
                            <div className="mobile-menu-buttons">
                                <div style={{ width: '100%' }} onClick={handleLogout} >
                                    <Buttons text="Logout" />
                                </div>

                            </div>
                        </>
                    ) : (
                        <>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/cars">Cars</Link></li>
                                <li><Link to="/about">About</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                            </ul>
                            <div className="mobile-menu-buttons">
                                <div className="nav-login">
                                    <Buttons text="Login" onClick={handleLogin} />
                                </div>
                                <div className="nav-signup">
                                    <Buttons text="Signup" path="#" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </menu>
        </>
    );
}
