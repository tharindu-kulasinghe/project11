import React from 'react'
import Nav from '../components/navigation/Nav'
import Footer from '../components/footer/Footer'

export default function MainLayout({children}) {
  return (
    <>
        <Nav />
        <main>{children}</main>
        <Footer />
    </>
  )
}
