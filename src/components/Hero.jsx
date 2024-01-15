import React from "react";
import "./hero.css";

export default function Hero(props) {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src={props.image} alt="" />
        </div>
        <div className="container">
          <div className="about-hero-content">
            <h2>{props.title}</h2>
            <p>{props.description}</p>
          </div>
        </div>
      </section>
    </>
  );
}
