import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './hero.css';

const Hero = () => {
    const navigate = useNavigate();
    const [pickupLocation, setPickupLocation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Refs for date inputs
    const pickupDateRef = useRef(null);
    const returnDateRef = useRef(null);

    const openDatePicker = useCallback((ref) => {
        if (!ref?.current) return;
        if (typeof ref.current.showPicker === 'function') {
            ref.current.showPicker();
        } else {
            ref.current.focus();
        }
    }, []);

    // Debounced fetch from Photon (OSM), limited to Sri Lanka
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        if (!pickupLocation.trim()) {
            setSuggestions([]);
            setError('');
            setLoading(false);
            return () => controller.abort();
        }

        setLoading(true);
        setError('');
        const handle = setTimeout(async () => {
            try {
                // Photon bbox format: left,top,right,bottom
                const bbox = [79.5, 9.9, 81.9, 5.8].join(',');
                const params = new URLSearchParams({
                    q: pickupLocation.trim(),
                    lang: 'en',
                    limit: '10',
                    bbox
                });
                const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                    signal
                });
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();

                const allowed = new Set(['village', 'town', 'city', 'hamlet', 'suburb', 'locality']);
                const items = (data?.features || [])
                    .map(f => ({
                        id: f?.properties?.osm_id ?? JSON.stringify(f?.geometry?.coordinates),
                        name: f?.properties?.name || '',
                        type: f?.properties?.osm_value,
                        country: (f?.properties?.countrycode || '').toUpperCase()
                    }))
                    .filter(r => r.name && r.country === 'LK' && (!r.type || allowed.has(r.type)));

                setSuggestions(items);
            } catch (e) {
                if (!signal.aborted) {
                    setError('Failed to load locations');
                    setSuggestions([]);
                }
            } finally {
                setLoading(false);
            }
        }, 200); // debounce

        return () => {
            clearTimeout(handle);
            controller.abort();
        };
    }, [pickupLocation]);

    const handleOpenMaps = useCallback((q) => {
        if (!q) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ', Sri Lanka')}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((v) => (v + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((v) => (v - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                const chosen = suggestions[highlightIndex].name;
                setPickupLocation(chosen);
                setShowSuggestions(false);
                handleOpenMaps(chosen);
            } else if (pickupLocation.trim()) {
                handleOpenMaps(pickupLocation.trim());
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSearch = () => {
        const start = pickupDateRef.current?.value || '';
        const end = returnDateRef.current?.value || '';
        const pickup = pickupLocation.trim();
        const params = new URLSearchParams();
        if (pickup) params.set('pickup', pickup);
        if (start && end) {
            // Only include if both provided
            params.set('startDate', start);
            params.set('endDate', end);
        }
        navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <div
            className="hero"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="hero-bg-color"></div>
            <div className="hero-container">
                <div className="hero-title">
                    <h1>Find Your Perfect Rental Vehicle</h1>
                    <p>Premium Vehicles at affordable prices. Book now and drive away!</p>
                </div>

                <div className="search">
                    <div className="pickup-location">
                        <label htmlFor="pickup-location">Pick-up Location</label>
                        <div className="input-with-icon">
                            <input
                                id="pickup-location"
                                type="text"
                                placeholder="Pick-up Location"
                                value={pickupLocation}
                                onChange={(e) => { setPickupLocation(e.target.value); setShowSuggestions(true); setHighlightIndex(-1); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                                onKeyDown={handleKeyDown}
                            />
                            {/* Right-side location icon */}
                            <button
                                type="button"
                                className="location-icon"
                                aria-label="Open in Google Maps"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    const q = pickupLocation.trim();
                                    if (q) {
                                        handleOpenMaps(q);
                                    }
                                }}
                                title="Open in Google Maps"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                        {showSuggestions && (
                            <ul className="suggestions" role="listbox">
                                {loading && <li className="loading">Loading...</li>}
                                {!loading && error && <li className="error">{error}</li>}
                                {!loading && !error && suggestions.map((s, idx) => (
                                    <li
                                        key={s.id}
                                        role="option"
                                        aria-selected={idx === highlightIndex}
                                        className={idx === highlightIndex ? 'active' : ''}
                                        onMouseDown={() => { setPickupLocation(s.name); setShowSuggestions(false); }}
                                    >
                                        {s.name}
                                    </li>
                                ))}
                                {!loading && !error && pickupLocation.trim() && suggestions.length === 0 && (
                                    <li className="no-results">No locations found</li>
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="pickup-date">
                        <label htmlFor="pickup-date">Pick-up Date</label>
                        <div className="input-with-icon">
                            <input id="pickup-date" ref={pickupDateRef} type="date" />
                            <button
                                type="button"
                                className="calendar-icon"
                                aria-label="Open date picker"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => openDatePicker(pickupDateRef)}
                                title="Open date picker"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1ZM5 8h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8Zm3 3h2v2H8v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="return-date">
                        <label htmlFor="return-date">Return Date</label>
                        <div className="input-with-icon">
                            <input id="return-date" ref={returnDateRef} type="date" />
                            <button
                                type="button"
                                className="calendar-icon"
                                aria-label="Open date picker"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => openDatePicker(returnDateRef)}
                                title="Open date picker"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1ZM5 8h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8Zm3 3h2v2H8v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="search-button">
                        <button type="button" onClick={handleSearch}>Search Vehicles</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Hero);