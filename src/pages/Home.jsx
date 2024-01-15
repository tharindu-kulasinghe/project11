import React from 'react'

// components
import Buttons from '../components/Buttons';
import Nav from '../components/Nav';
import Hero from '../components/home/Hero';
import ItemList from '../components/home/ItemList';
import Footer from '../components/Footer';
// import Story from '../components/about/Story';
import WhyChoose from '../components/about/WhyChoose';
import Faq from '../components/Faq';

// styles
import './home.css';

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

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <ItemList items={allItems}/>
      {/* <Story /> */}
      <WhyChoose />
      <Faq />
      <Footer />
    </>
  )
}
