// REQ: BR-UX-003 (Search must feel instant)
// REQ: FR-UI-004 (Onboarding with local, offline catalog search)

import React, { useState, useEffect } from 'react';

/**
 * Onboarding Page - Plant selection with type-ahead search
 * Searches local catalog by common name, Latin name, and aliases
 */
function Onboarding() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    // TODO: Load local plant catalog JSON
    // TODO: Index catalog for fast search
    
    // Stub catalog
    setCatalog([
      { id: 1, common_name: 'Snake Plant', latin_name: 'Sansevieria trifasciata' },
      { id: 2, common_name: 'Pothos', latin_name: 'Epipremnum aureum' }
    ]);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    // TODO: Implement fuzzy search
    // TODO: Match common name, Latin name, aliases
    // TODO: Sort by relevance
    // TODO: Limit results to top 10
    
    const filtered = catalog.filter(plant => 
      plant.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.latin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setResults(filtered);
  }, [searchTerm, catalog]);

  const handleSelectPlant = (plant) => {
    // TODO: Save selected plant to local storage
    // TODO: Navigate to home with selected plant
    // TODO: Initialize device pairing if needed
    
    console.log('Selected plant:', plant);
  };

  return (
    <div className="onboarding-page">
      <h1>Choose Your Plant</h1>
      
      {/* TODO: Search input with type-ahead */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for your plant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>
      
      {/* TODO: Results list */}
      <div className="results-list">
        {searchTerm.length < 2 && (
          <p className="hint">Type at least 2 characters to search</p>
        )}
        
        {results.length === 0 && searchTerm.length >= 2 && (
          <p>No plants found matching "{searchTerm}"</p>
        )}
        
        {results.map(plant => (
          <div 
            key={plant.id}
            className="plant-card"
            onClick={() => handleSelectPlant(plant)}
          >
            <h3>{plant.common_name}</h3>
            <p className="latin-name">{plant.latin_name}</p>
          </div>
        ))}
      </div>
      
      {/* TODO: Works offline - no network dependency */}
    </div>
  );
}

export default Onboarding;
