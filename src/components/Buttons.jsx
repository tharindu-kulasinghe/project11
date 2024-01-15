import React from 'react'
import './buttons.css'

export default function buttons(props) {
  return (
    <>
      <a className='btn' href={props.path}>{props.text}</a>
    </>
  )
}
