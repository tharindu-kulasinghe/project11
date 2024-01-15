import React from "react";

// components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Buttons from "../components/Buttons";
import Faq from "../components/Faq";

// styles
import "./contact.css";

export default function Contact() {
  return (
    <>
      <Nav />
      <Hero
        title="Contact Us"
        description="We are here to help you with any questions or concerns you may have."
        image="./assets/contact/hero-image.jpg"
      />

      <section className="contact-section">
        <div className="contact-map">
          <div className="container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.072686979087!2d79.98084267499611!3d6.881895993117017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8bc570145eafbc15%3A0x15f655659825b160!2sFuchsius!5e0!3m2!1sen!2slk!4v1752360057711!5m2!1sen!2slk"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className="contact-form">
          <div className="container">
            <div className="contact-form-content">
              <h2>Get in touch</h2>
              <p>
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
              <form action="">
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <input type="text" placeholder="Subject" />
                <textarea name="" id="" cols="30" rows="10"></textarea>
                <Buttons text="Send Message" path="" />
              </form>
            </div>
          </div>
        </div>
      </section>

      <Faq />
      <Footer />
    </>
  );
}
