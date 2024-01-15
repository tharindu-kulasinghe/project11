import React, { useState } from 'react'

// components
import Buttons from '../Buttons';

// styles
import './hero.css'

export default function Hero() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  const [pickupDate, setPickupDate] = useState('');

  return (
    <>
      <section className='hero'>
        {/* background image */}
        <div className="hero-bg">
          <img src="/assets/home/hero.jpg" alt="Hero Background" />
        </div>
        <div className='container'>

          <div className='hero-content'>
            <div className='hero-search'>
              <div className='hero-search-item'>
                <h4>Pick Up Location</h4>
                <div className='hero-search-item-input'>
                  <select name="" id="">
                    <option value="">Select Location</option>
                    <option value="colombo">Colombo</option>
                    <option value="kandy">Kandy</option>
                    <option value="galle">Galle</option>
                    <option value="jaffna">Jaffna</option>
                  </select>
                </div>
              </div>
              <div className='hero-search-item'>
                <h4>Picking up Date</h4>
                <div className='hero-search-item-input'>
                  <input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
              </div>
              <div className='hero-search-item'>
                <h4>Picking up Time</h4>
                <div className='hero-search-item-input'>
                  <input type="time" defaultValue={currentTime} />
                </div>
              </div>
              <div className='hero-search-item'>
                <h4>Drop Off Location</h4>
                <div className='hero-search-item-input'>
                  <select name="" id="">
                    <option value="">Select Location</option>
                    <option value="colombo">Colombo</option>
                    <option value="kandy">Kandy</option>
                    <option value="galle">Galle</option>
                    <option value="jaffna">Jaffna</option>
                  </select>
                </div>

              </div>
              <div className='hero-search-item'>
                <h4>Drop Off Date</h4>
                <div className='hero-search-item-input'>
                  <input type="date" min={pickupDate || today} />
                </div>
              </div>
              {/* <div className='hero-search-item'>
              <h4>Vehicle Category </h4>
              <div className='hero-search-item-input'>
                <select name="" id="">
                  <option value="">Select Category</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
            <div className='hero-search-item'>
              <h4>Vehicle Type</h4>
              <div className='hero-search-item-input'>
                <select name="" id="">
                  <option value="">Select Type</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
            <div className='hero-search-item'>
              <h4>Passengers</h4>
              <div className='hero-search-item-input'>
                <select name="" id="">
                  <option value="">Select Passengers</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                </select>
              </div>
            </div> */}
              <div className='hero-search-item'>
                <h4 style={{ color: 'var(--main-color)' }}>.</h4>
                <div className='hero-search-item-input'>
                  <Buttons text="Search" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}
