import React from 'react'

// styles
import './itemCard.css';

// icon
import { GiGearStick } from "react-icons/gi";
import { GiCarSeat } from "react-icons/gi";
import { BsFillFuelPumpDieselFill } from "react-icons/bs";

// components
import Buttons from './Buttons';


export default function ItemCard(props) {
    return (
        <>
            <div className='item-card'>
                <div className='item-card-image'>
                    <img src={props.image} alt="Item" />
                </div>
                <div className='item-card-details'>
                    <h3>Item Name</h3>
                    <div className='item-card-car-info'>
                        <div className='item-card-car-info-item'>
                            <div>
                                <GiGearStick />
                            </div>
                            <div>
                                <p>{props.transmission} Transmission</p>
                            </div>
                        </div>
                        <div className='item-card-car-info-item'>
                            <div>
                                <GiCarSeat />
                            </div>
                            <div>
                                <p>{props.seats} Seats</p>
                            </div>
                        </div>
                        <div className='item-card-car-info-item'>
                            <div>
                                <BsFillFuelPumpDieselFill />
                            </div>
                            <div>
                                <p>{props.fuelType} Fuel type</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='item-card-button'>
                    <Buttons text="View Details" path={props.path}/>
                </div>
            </div>
        </>
    )
}
