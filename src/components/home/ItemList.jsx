import React, { useState } from 'react'

// styles
import './itemList.css';

// components
import ItemCard from '../ItemCard';

export default function ItemList(props) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const allItems = props.items;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(allItems.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <>
            <div className='container'>
                <div className='item-list'>
                    {currentItems.map(item => (
                        <ItemCard 
                            key={item.id} 
                            image={item.image} 
                            path={item.path} 
                            transmission={item.transmission} 
                            seats={item.seats} 
                            fuelType={item.fuelType} 
                        />
                    ))}
                </div>
                <div className='pagination'>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo; 
                    </button>
                    {pageNumbers.map(number => (
                        <button key={number} onClick={() => paginate(number)} className={currentPage === number ? 'active' : ''}>
                            {number}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(allItems.length / itemsPerPage)}>
                         &raquo;
                    </button>
                </div>
            </div>
        </>
    )
}
