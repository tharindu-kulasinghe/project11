import React from "react";

import './story.css'

export default function Story() {
  return (
    <>
      <section className="about-story">
        <div className="container">
          <div className="about-story-item">
            <img src="./assets/about/story-image.jpg" alt="" />
          </div>
          <div className="about-story-item">
            <h2>Our Story</h2>
            <p className="about-story-item-text">
              Founded on the principle of making travel accessible and enjoyable for everyone, Gamanata LK started as a small, family-owned business with a handful of cars. Our passion for exploration and a commitment to exceptional customer service fueled our growth. We envisioned a car rental service that was not just about transactions, but about building relationships and helping people create lasting memories. Over the years, we've expanded our fleet to include a diverse range of vehicles to suit every need and budget, from compact cars for city tours to spacious SUVs for family adventures. Despite our growth, our core values remain the same: to provide reliable, clean, and safe vehicles, transparent pricing, and a rental experience that is seamless from start to finish.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
