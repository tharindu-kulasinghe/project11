import React from "react";
import { FaCar, FaHeadset, FaTags, FaShieldAlt, FaCalendarAlt, FaWrench } from 'react-icons/fa';

// styles
import "./whyChoose.css";

export default function WhyChoose() {
  return (
    <>
      <section className="about-why-choose">
        <h1>Why Choose Us</h1>
        <div className="container">
          <div className="about-why-choose-content">
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaCar />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>Wide Variety of Cars</h2>
                <p>
                  We offer a diverse fleet of vehicles to suit every need and budget, from compact cars for city driving to spacious SUVs for family road trips.
                </p>
              </div>
            </div>
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaHeadset />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>24/7 Customer Support</h2>
                <p>
                  Our dedicated support team is available around the clock to assist you with any questions, booking modifications, or roadside assistance.
                </p>
              </div>
            </div>
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaTags />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>Transparent Pricing</h2>
                <p>
                  No hidden fees. We believe in transparent pricing, so you know exactly what you're paying for upfront. The price you see is the price you pay.
                </p>
              </div>
            </div>
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaShieldAlt />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>Easy & Secure Booking</h2>
                <p>
                  Our booking process is simple, fast, and secure. Reserve your car in just a few clicks with our user-friendly platform and secure payment gateway.
                </p>
              </div>
            </div>
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaCalendarAlt />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>Flexible Rental Periods</h2>
                <p>
                  Whether you need a car for a few hours, a day, or a month, we offer flexible rental options to fit your schedule.
                </p>
              </div>
            </div>
            <div className="about-why-choose-content-item">
              <div className="about-why-choose-content-item-icon">
                <FaWrench />
              </div>
              <div className="about-why-choose-content-item-content">
                <h2>Well-Maintained & Clean Cars</h2>
                <p>
                  Your safety and comfort are our top priorities. Every car is regularly serviced and professionally cleaned before each rental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
