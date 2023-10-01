import React from 'react'
import './title.css'

export default function Title(props) {
    return (
        <>
            <div className='title' style={{ justifyContent: props.justifyContent }}>
                <div className='title-container'>
                    <h1>{props.title}</h1>
                    <p style={{ maxWidth: props.width ? props.width : '600px' }}>{props.subtitle}</p>
                </div>
            </div>
        </>
    )
}