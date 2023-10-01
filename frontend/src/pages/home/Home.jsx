import React from 'react'
import './home.css'

// import component
import Hero from '../../components/home/Hero'
import AvailableVehicle from '../../components/home/AvailableVehicle'
import WhyChoose from '../../components/home/WhyChoose'
import Category from '../../components/home/Category'

export default function Home() {
  return (
    <>
        <Hero />
        <AvailableVehicle />
        <WhyChoose />
        <Category />
    </>
  )
}
