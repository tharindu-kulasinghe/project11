import React from "react";

// components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Story from "../components/about/Story";
import WhyChoose from "../components/about/WhyChoose";

// styles
import "./about.css";

export default function About() {
  return (
    <>
      <Nav />
      <Hero
        title="About Us"
        description="Your trusted partner for car rentals. We offer a wide range of vehicles and are committed to providing a seamless and stress-free rental experience."
        image="./assets/about/hero-image.jpg"
      />
      <WhyChoose />
      <Story />
      <Footer />
    </>
  );
}
