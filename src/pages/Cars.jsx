import React, { useState } from "react";

// styles
import "./cars.css";

// components
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CarsList from "../components/cars/CarsList";
import Buttons from "../components/Buttons";

const Cars = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  const [pickupDate, setPickupDate] = useState('');

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const allItems = [
    {
      id: 1,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "3",
      fuelType: "Petrol",
    },
    {
      id: 2,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "4",
      fuelType: "Petrol",
    },
    {
      id: 3,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "2",
      fuelType: "Petrol",
    },
    {
      id: 4,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "5",
      fuelType: "Petrol",
    },
    {
      id: 5,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Manual",
      seats: "5",
      fuelType: "Diesel",
    },
    {
      id: 6,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "7",
      fuelType: "Petrol",
    },
    {
      id: 7,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "4",
      fuelType: "Hybrid",
    },
    {
      id: 8,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Manual",
      seats: "2",
      fuelType: "Petrol",
    },
    {
      id: 9,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "5",
      fuelType: "Diesel",
    },
    {
      id: 10,
      image: "/demo/profile.jpg",
      path: "",
      transmission: "Automatic",
      seats: "5",
      fuelType: "Petrol",
    },
  ];

  return (
    <>
      <Nav />
      <section className="cars-section">
        <div className="container">
          <button className="filter-toggle-btn" onClick={toggleFilter}>
            Filter
            <svg
              className={`filter-arrow ${isFilterVisible ? "open" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div className={`filter ${isFilterVisible ? "filter-visible" : ""}`}>
            <div className="filter-header">
              <h2>Filter</h2>
            </div>
            <div className="filter-content">
              <div className="filter-content-item">
                <h4>Pick Up Location</h4>
                <div className="filter-input">
                  <select name="" id="">
                    <option value="">Select Location</option>
                    <option value="colombo">Colombo</option>
                    <option value="kandy">Kandy</option>
                    <option value="galle">Galle</option>
                    <option value="jaffna">Jaffna</option>
                  </select>
                </div>
              </div>
              <div className="filter-content-item">
                <h4>Picking up Date</h4>
                <div className="filter-input">
                  <input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Picking up Time</h4>
                <div className="filter-input">
                  <input type="time" defaultValue={currentTime} />
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Drop Off Location</h4>
                <div className="filter-input">
                  <select name="" id="">
                    <option value="">Select Location</option>
                    <option value="colombo">Colombo</option>
                    <option value="kandy">Kandy</option>
                    <option value="galle">Galle</option>
                    <option value="jaffna">Jaffna</option>
                  </select>
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Drop Off Date</h4>
                <div className="filter-input">
                  <input type="date" min={pickupDate || today} />
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Fuel Type</h4>
                <div className="filter-input">
                  <select name="" id="">
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Transmission</h4>
                <div className="filter-input">
                  <select name="" id="">
                    <option value="">Select Transmission</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="filter-content-item">
                <h4>Seats</h4>
                <div className="filter-input">
                  <select name="" id="">
                    <option value="">Select Seats</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
              </div>

              <div className="filter-content-item">
                <div className="filter-input">
                  <Buttons text="Search" />
                </div>
              </div>
            </div>
          </div>
          <div className="cars-list-wrapper">
            <CarsList items={allItems} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Cars;
