import './index.css'
import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { Loader2, Clock, Car, ArrowUpDown, MapPin } from 'lucide-react';

const CommuteAnalysis = () => {
    type AlternateRoute = {
        name: string;
        diff: number;
      };

    const [selectedTime, setSelectedTime] = useState('8am');
    const [customName, setCustomName] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('');
    const [customOfficeAddress, setCustomOfficeAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedDay, setSelectedDay] = useState('weekday');
    const [sortOrder, setSortOrder] = useState('asc');
    const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    const offices = [
        'DivergeIT',
        'The Agency',
        'PwC',
        'Camacho Commercial',
        'JOEY',
        'Other (Search Here)'
    ];

    const officeCoords = {
        'DivergeIT': [33.8413, -118.3301],
        'The Agency': [34.0697, -118.4034],
        'PwC': [34.0505, -118.2545],
        'Camacho Commercial': [34.0904, -118.3864],
        'JOEY': [33.8988, -118.3868]
    };

    const officeAddresses = {
        'DivergeIT': '2980 Columbia St, Torrance, CA 90503',
        'The Agency': '331 Foothill Rd Suite 100, Beverly Hills, CA 90210',
        'PwC': '601 S Figueroa St, Los Angeles, CA 90017',
        'Camacho Commercial': '9000 Sunset Blvd, West Hollywood, CA 90069',
        'JOEY': '3120 N Sepulveda Blvd, Manhattan Beach, CA 90266'
    };

    const livingAreas = {
        "Venice": [33.9850, -118.4695],
        "Santa Monica": [34.0195, -118.4912],
        "Playa Del Rey": [33.9537, -118.4489],
        "West Hollywood": [34.0900, -118.3617],
        "Brentwood": [34.0520, -118.4669],
        "Beverly Hills": [34.0736, -118.4004],
        "El Segundo": [33.9192, -118.4164],
        "Manhattan Beach": [33.8847, -118.4109],
        "Mar Vista": [34.0037, -118.4289],
        "Culver City": [34.0211, -118.3965]
    };

    // Traffic multipliers for different times
    const peakMultipliers = {
        '7am': 1.4,
        '8am': 1.8,
        '9am': 1.6,
        '10am': 1.3,
        '11am': 1.2,
        '12pm': 1.2,
        '1pm': 1.2,
        '2pm': 1.3,
        '3pm': 1.4,
        '4pm': 1.6,
        '5pm': 1.7,
        '6pm': 1.6
    };

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) return;
    
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setAddressSuggestions(data.map((item: any) => ({
            name: item.display_name,
            lat: item.lat,
            lon: item.lon
        })));
    };

    const getCommuteColor = (minutes) => {
        if (minutes <= 15) return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        hover: 'hover:bg-emerald-100',
        label: 'Super Quick!'
        };
        if (minutes <= 25) return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        label: 'Quick'
        };
        if (minutes <= 35) return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        label: 'Moderate'
        };
        if (minutes <= 45) return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-100',
        label: 'Long'
        };
        if (minutes <= 60) return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
        label: 'Very Long'
        };
        return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
        label: 'Consider Remote Work! 😅'
        };
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const generateAlternateRoutes = (area: string, mainRoute: { time: number; distance: number }): AlternateRoute[] => {
        const routes: AlternateRoute[] = [];
        
        // Freeway route
        if (mainRoute.distance > 8) {
        const freewayDiff = Math.round((Math.random() * 10) - 5); // -5 to +5 minutes
        routes.push({
            name: 'Freeway',
            diff: freewayDiff,
        });
        }
    
        // Surface streets
        if (mainRoute.distance < 15) {
        const streetsDiff = Math.round(mainRoute.time * 0.2); // Usually slower
        routes.push({
            name: 'Surface Streets',
            diff: streetsDiff,
        });
        }
    
        // Scenic route
        if (mainRoute.distance > 5) {
        const scenicDiff = Math.round(mainRoute.time * 0.3); // Usually slower
        routes.push({
            name: 'Scenic Route',
            diff: scenicDiff,
        });
        }
    
        return routes;
    };

    const calculateCommuteTime = (area) => {
        if (!selectedOffice || !officeCoords[selectedOffice]) return { time: 0, distance: 0 };

        const distance = calculateDistance(
        livingAreas[area][0],
        livingAreas[area][1],
        officeCoords[selectedOffice][0],
        officeCoords[selectedOffice][1]
        );

        // Base speed depends on distance
        let baseSpeed = 30; // mph
        if (distance < 5) baseSpeed = 20;
        else if (distance < 10) baseSpeed = 25;

        // Calculate time with multipliers
        const baseTime = (distance / baseSpeed) * 60; // Convert to minutes
        const timeMultiplier = peakMultipliers[selectedTime] || 1.2;
        const dayMultiplier = selectedDay === 'weekday' ? 1 : 0.7;
        
        return {
        time: Math.round(baseTime * timeMultiplier * dayMultiplier),
        distance: Math.round(distance * 10) / 10
        };
    };

    const handleCalculate = () => {
        setIsCalculating(true);
        setShowResults(false);
        setAddressSuggestions([]);
        
        setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
        }, 1500);
    };

    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCustomOfficeAddress(query);
        fetchSuggestions(query);
    };

    const selectSuggestion = (suggestion) => {
        setCustomOfficeAddress(suggestion);
        setAddressSuggestions([]);
    };

    const toggleSort = () => {
        setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    };

    const getSortedAreas = () => {
        const areas = Object.keys(livingAreas);
        if (!showResults) return areas;

        return areas.sort((a, b) => {
        const timeA = calculateCommuteTime(a).time;
        const timeB = calculateCommuteTime(b).time;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    LA Work Commute Calculator
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                    Find your ideal commute and make good decisions about where to live!
                </p>
            </div>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
    
                <div>
                    <label className="block text-sm font-medium mb-2">Work Location</label>
                    <select 
                        value={selectedOffice}
                        onChange={(e) => setSelectedOffice(e.target.value)}
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select work location</option>
                        {offices.map(office => (
                            <option key={office} value={office}>{office}</option>
                        ))}
                    </select>
                    
                    {selectedOffice === 'Custom Location' && (
                        <div className="relative mt-2">
                            <input
                                type="text"
                                value={customOfficeAddress}
                                onChange={handleAddressInput}
                                placeholder="Enter work address"
                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {addressSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
                                    {addressSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-2.5 hover:bg-gray-50 cursor-pointer flex items-center"
                                            onClick={() => selectSuggestion(suggestion)}
                                        >
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
    
                <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <select 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>
    
                <div>
                    <label className="block text-sm font-medium mb-2">Day Type</label>
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="weekday">Weekday</option>
                        <option value="weekend">Weekend</option>
                    </select>
                </div>
            </div>
    
            <div className="text-center mb-8">
                <button
                    onClick={handleCalculate}
                    disabled={isCalculating || !selectedOffice}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg
                                hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                                transform transition-all duration-300 hover:scale-105"
                >
                    {isCalculating ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2" />
                            Calculating...
                        </span>
                    ) : (
                        'Calculate Commute Times'
                    )}
                </button>
            </div>
    
            {showResults && (
                <>
                    <div className="mb-6 text-center">
                        <h3 className="text-lg md:text-xl text-gray-800">
                            {customName ? `Hi ${customName}! Here` : 'Here'} are your commute times from each neighborhood to{' '}
                            {selectedOffice === 'Custom Location' ? 'your work location' : selectedOffice}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Showing estimated travel times for {selectedDay === 'weekday' ? 'a weekday' : 'the weekend'} at {selectedTime}
                        </p>
                    </div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={toggleSort}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowUpDown className="w-4 h-4 mr-1" />
                            Sort by Time ({sortOrder === 'asc' ? 'Shortest First' : 'Longest First'})
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getSortedAreas().map(area => {
                            const commute = calculateCommuteTime(area);
                            const colors = getCommuteColor(commute.time);
                            
                            return (
                                <div 
                                    key={area} 
                                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${colors.hover} 
                                                transition-all duration-300 transform hover:scale-105`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800">{area}</h3>
                                        <span className={`text-sm px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                            {colors.label}
                                        </span>
                                    </div>
                                    <div className={`text-2xl font-bold ${colors.text} mb-2`}>
                                        {commute.time} min
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Car className="w-4 h-4 mr-1" />
                                        <span>{commute.distance} miles</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Best before {selectedTime}</span>
                                    </div>
    
                                    <div className="mt-3 pt-3 border-t border-dashed">
                                        <p className="text-xs font-medium text-gray-600 mb-2">Alternate Routes:</p>
                                        {generateAlternateRoutes(area, commute).map((route, idx) => (
                                            <div key={idx} className="text-xs text-gray-600 flex items-center mb-1">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                                    route.diff < 0 ? 'bg-green-400' : 'bg-orange-400'
                                                }`} />
                                                {route.name}: {Math.abs(route.diff) < 5 ? 'Similar time' : 
                                                `${Math.abs(route.diff)}min ${route.diff < 0 ? 'faster' : 'slower'}`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
    
            <div className="mt-8 text-center text-sm text-gray-500">
                Created by Patrick King | December 21, 2024
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <CommuteAnalysis />
  );
  
export default CommuteAnalysis;