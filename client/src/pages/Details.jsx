// REQ: BR-UX-002 (Explain status changes)
// REQ: FR-UI-002 (Details view explains status changes with timestamps)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import healthIcon from '../icons/health4x.png';
import detailsIcon from '../icons/Details4x.png';
import historyIcon from '../icons/history.png';
import pencilIcon from '../icons/Pencil4x.png';
import menuOpenIcon from '../icons/Menu-Open4x.png';
import menuClosedIcon from '../icons/Menu-Closed 4x.png';
import logo from '../icons/uto-labs-logo4x.png';

function Details() {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTVMode(params.get('tv') === '1');
    
    loadPlantData();
  }, []);

  // TV Remote DPAD Navigation Handler - UNIFIED SYSTEM
  useEffect(() => {
    if (!isTVMode) return;

    const handleKeyDown = (e) => {
      const focused = document.activeElement;
      const navSidebar = document.querySelector('.nav-sidebar');
      const isInNav = focused?.closest('.nav-sidebar');
      
      // GLOBAL: Escape key always brings you back to main content
      if (e.key === 'Escape') {
        e.preventDefault();
        navSidebar?.classList.remove('menu-active');
        document.querySelector('.main-content')?.focus();
        return;
      }
      
      // GLOBAL: Left arrow ALWAYS opens navigation (from anywhere)
      if (e.key === 'ArrowLeft' && !isInNav) {
        e.preventDefault();
        navSidebar?.classList.add('menu-active');
        const activeNavItem = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
        activeNavItem?.focus();
        return;
      }
      
      // If in navigation: Right arrow goes back to content
      if (isInNav && e.key === 'ArrowRight') {
        e.preventDefault();
        navSidebar?.classList.remove('menu-active');
        document.querySelector('.main-content')?.focus();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTVMode]);

  const loadPlantData = async () => {
    try {
      const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
      setPlant(selectedPlant);
      
      // Fetch node details
      const response = await fetch(`/api/nodes/pot-01`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading details...</div>;
  }

  return (
    <div className={`details-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* Sidebar Navigation - Always Visible */}
      <nav className="nav-sidebar">
        <Link to={`/${isTVMode ? '?tv=1' : ''}`} className="nav-item">
          <img src={healthIcon} alt="Health" />
          <span>Health</span>
        </Link>
        <Link to={`/details${isTVMode ? '?tv=1' : ''}`} className="nav-item active">
          <img src={detailsIcon} alt="Details" />
          <span>Details</span>
        </Link>
        <Link to={`/history${isTVMode ? '?tv=1' : ''}`} className="nav-item">
          <img src={historyIcon} alt="History" />
          <span>History</span>
        </Link>
        
        {/* Plant Name Badge - At bottom of nav */}
        <button className="plant-badge nav-plant-button" onClick={() => navigate(`/onboarding${isTVMode ? '?tv=1' : ''}`)}>
          <img src={pencilIcon} alt="" />
          <span>{plant?.common_name || 'My Plant'}</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>Current Status</h1>
        <p className="status-explanation">Status explanation (stub)</p>

        <div className="details-section" tabIndex="0">
          <h2>Current Readings</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Soil Moisture:</span>
              <span className="detail-value">{details?.soil_raw || '--'} (raw)</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Temperature:</span>
              <span className="detail-value">
                {details?.temp_c ? `${details.temp_c}°C` : '--'}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section" tabIndex="0">
          <h2>Thresholds</h2>
          <p>Threshold visualization (stub)</p>
        </div>

        <div className="details-section" tabIndex="0">
          <h2>Recent Status Changes</h2>
          <p>Changed to [status] at [time] because [reason]</p>
        </div>

        <div className="details-section" tabIndex="0">
          <h2>Device Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Node ID:</span>
              <span className="detail-value">{details?.node_id || '--'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last seen:</span>
              <span className="detail-value">
                {details?.last_seen ? new Date(details.last_seen).toLocaleString() : '--'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Calibrated:</span>
              <span className="detail-value">{details?.calibrated ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Logo */}
        <img src={logo} alt="UTO Labs" className="logo" />
      </div>

      {/* UtoBloom text */}
      <div className="app-name">UtoBloom</div>
    </div>
  );
}

export default Details;
