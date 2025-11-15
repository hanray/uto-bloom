// REQ: BR-UX-003 (Search must feel instant)
// REQ: FR-UI-004 (Onboarding with local, offline catalog search)

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HomeIcon, HistoryIcon, DetailsIcon, SettingsIcon } from '../components/NavIcon';
import logo from '../icons/uto-labs-logo4x.png';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import MobileMenu from '../components/MobileMenu';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

function Onboarding() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTVMode, setIsTVMode] = useState(false);
  const { isMobile } = useDeviceDetection();
  const resultRefs = useRef([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadPlantCatalog();
    
    // Detect TV mode from URL parameter
    const params = new URLSearchParams(window.location.search);
    const tvMode = params.get('tv') === '1';
    setIsTVMode(tvMode);
    
    if (tvMode) {
      console.log('🎮 TV mode enabled - DPAD navigation active');
    }
  }, []);

  const loadPlantCatalog = async () => {
    try {
      const response = await fetch('/plant-catalog.json');
      const data = await response.json();
      setCatalog(data);
    } catch (error) {
      console.error('Error loading plant catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // In TV mode, show all plants by default
    if (isTVMode && searchTerm.length === 0) {
      setResults(catalog.slice(0, 10));
      setSelectedIndex(0);
      return;
    }
    
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = catalog.filter(plant => 
      plant.common_name.toLowerCase().includes(term) ||
      plant.latin_name.toLowerCase().includes(term) ||
      plant.aliases.some(alias => alias.toLowerCase().includes(term))
    );
    
    // Sort by relevance (exact matches first)
    filtered.sort((a, b) => {
      const aMatch = a.common_name.toLowerCase().startsWith(term);
      const bMatch = b.common_name.toLowerCase().startsWith(term);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    
    setResults(filtered.slice(0, 10)); // Limit to top 10
    setSelectedIndex(0); // Reset selection when results change
  }, [searchTerm, catalog, isTVMode]);

  // Handle DPAD navigation (TV remote)
  useEffect(() => {
    if (!isTVMode) return;

    const handleKeyDown = (e) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          // Blur any focused input to dismiss keyboard
          if (document.activeElement) {
            document.activeElement.blur();
          }
          if (searchInputRef.current) {
            searchInputRef.current.blur();
          }
          if (results[selectedIndex]) {
            handleSelectPlant(results[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTVMode, results, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (isTVMode && resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex, isTVMode]);

  const handleSelectPlant = (plant) => {
    // Clear search and results immediately
    setSearchTerm('');
    setResults([]);
    
    // Force blur all inputs to dismiss keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.blur());
    
    // Save and navigate
    localStorage.setItem('selectedPlant', JSON.stringify(plant));
    
    // Small delay to ensure keyboard dismissal before navigation
    setTimeout(() => {
      navigate(`/${isTVMode ? '?tv=1' : ''}`);
    }, 100);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading plant catalog..." />;
  }

  // MOBILE LAYOUT
  if (isMobile && !isTVMode) {
    return (
      <div className="figma-mobile-layout">
        {/* SLIDE-OUT MENU */}
        <MobileMenu currentPage="/onboarding" />

        {/* HEADER */}
        <div className="figma-mobile-header">
          <div className="figma-logo-container">
            <img src={logo} alt="Uto Labs" className="figma-logo" />
          </div>
        </div>

        {/* TITLE */}
        <div className="figma-mobile-title-section">
          <h1 className="figma-title">Choose Your Plant</h1>
          <p className="figma-subtitle">Search for your plant species</p>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="figma-mobile-content">
          {/* Search Bar */}
          <SearchBar
            placeholder="Search plants by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="primary"
          />
          
          {/* Results */}
          <div className="onboarding-results-mobile">
            {results.map((plant, index) => (
              <div 
                key={plant.id}
                ref={el => resultRefs.current[index] = el}
                className="onboarding-plant-card"
                onClick={() => handleSelectPlant(plant)}
                tabIndex={0}
              >
                <h3>{plant.common_name}</h3>
                <p className="latin-name">{plant.latin_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP/TV LAYOUT
  return (
    <div className={`app-layout onboarding-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* LEFT SIDEBAR - Vertical Pill Navigation */}
      <nav className="app-nav figma-sidebar-nav">
        <Link to="/" className="figma-nav-btn">🏠</Link>
        <Link to="/history" className="figma-nav-btn">📊</Link>
        <Link to="/details" className="figma-nav-btn">ℹ️</Link>
        <Link to="/onboarding" className="figma-nav-btn active">🌱</Link>
      </nav>

      {/* MAIN CONTENT GRID */}
      <main className="app-content">
        {/* HEADER - Row 1 - Reusable Header Component */}
        <header className="page-header figma-header">
          <div className="figma-header-left">
            <h1 className="figma-title">Choose Your Plant</h1>
            <p className="figma-subtitle">Search for your plant species</p>
          </div>
        </header>
        
        {/* MAIN SECTION - Row 2 - All content below header */}
        <div className="content-full page-main">
          {/* Search Bar */}
          {!isTVMode && (
            <div className="content-full">
              <SearchBar
                placeholder="Search plants by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="primary"
              />
            </div>
          )}
          
          {/* Results */}
          {results.map((plant, index) => (
            <div 
              key={plant.id}
              ref={el => resultRefs.current[index] = el}
              className={`content-full onboarding-plant-card ${isTVMode && index === selectedIndex ? 'tv-selected' : ''}`}
              onClick={() => !isTVMode && handleSelectPlant(plant)}
              tabIndex={isTVMode ? -1 : 0}
            >
              <h3>{plant.common_name}</h3>
              <p className="latin-name">{plant.latin_name}</p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER - Logo */}
      <footer className="app-footer">
        <img src={logo} alt="Uto Labs" className="figma-logo" />
      </footer>
    </div>
  );
}

export default Onboarding;
