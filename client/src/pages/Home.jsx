// REQ: BR-UX-001 (Home must be readable at a glance)
// REQ: FR-UI-001 (Home shows image, status, last updated, 24h mini-chart)
// REQ: BR-ST-001 (Display "Need water" status)
// REQ: BR-ST-002 (Display "I'm doing great" status)
// REQ: BR-ST-003 (Display temperature alerts)
// REQ: BR-ST-004 (Display "In need of care!" status)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import healthIcon from '../icons/health4x.png';
import detailsIcon from '../icons/Details4x.png';
import historyIcon from '../icons/history.png';
import pencilIcon from '../icons/Pencil4x.png';
import menuOpenIcon from '../icons/Menu-Open4x.png';
import menuClosedIcon from '../icons/Menu-Closed 4x.png';
import logo from '../icons/uto-labs-logo4x.png';
import PlantVisualization from '../components/PlantVisualization';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

function Home() {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [status, setStatus] = useState('unknown');
  const [lastReading, setLastReading] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTVMode, setIsTVMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    // Detect TV mode
    const params = new URLSearchParams(window.location.search);
    setIsTVMode(params.get('tv') === '1');
    
    loadPlantData();
    setupWebSocket();
    
    const interval = setInterval(loadPlantData, 60000); // Refresh every minute
    return () => clearInterval(interval);
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
      
      // HOME PAGE SPECIFIC: Carousel navigation with Up/Down (only when not in nav)
      if (!isInNav && e.key === 'ArrowUp') {
        e.preventDefault();
        setCarouselIndex(0); // Go to plant image
        return;
      }
      if (!isInNav && e.key === 'ArrowDown') {
        e.preventDefault();
        setCarouselIndex(1); // Go to chart
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTVMode, carouselIndex]);

  const loadPlantData = async () => {
    try {
      const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
      setPlant(selectedPlant);
      
      // Fetch latest node status
      const nodeResponse = await fetch(`/api/nodes/pot-01`);
      if (nodeResponse.ok) {
        const nodeData = await nodeResponse.json();
        setLastReading(nodeData);
        setStatus(nodeData.status || 'unknown');
      }
      
      // Fetch 24h history for mini chart
      const historyResponse = await fetch(`/api/history?device_id=pot-01&range=24h`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        updateChartData(historyData.readings || []);
      }
      
    } catch (error) {
      console.error('Error loading plant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Connect to WebSocket for live updates
    const ws = new WebSocket(`ws://localhost:3000/live`);
    
    ws.onmessage = (event) => {
      const reading = JSON.parse(event.data);
      if (reading.device_id === 'pot-01') {
        setLastReading(reading);
        loadPlantData(); // Refresh data
      }
    };
    
    ws.onerror = () => console.log('WebSocket connection failed');
    
    return () => ws.close();
  };

  const updateChartData = (readings) => {
    if (!readings.length) return;
    
    // Get current time and calculate 1 hour before/after window
    const now = Date.now() / 1000;
    const oneHourAgo = now - 3600;
    const oneHourAhead = now + 3600;
    
    // Filter readings to 3-hour window (1hr before, current, 1hr after)
    const filteredReadings = readings.filter(r => 
      r.ts >= oneHourAgo && r.ts <= oneHourAhead
    );
    
    // If we have filtered data, use it; otherwise show all (for initial setup)
    const dataToShow = filteredReadings.length > 0 ? filteredReadings : readings.slice(-10);
    
    const labels = dataToShow.map(r => {
      const date = new Date(r.ts * 1000);
      const hours = date.getHours();
      const mins = date.getMinutes();
      // Show time as HH:MM for more precision
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    });
    
    const data = dataToShow.map(r => r.soil_raw);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Soil Moisture',
        data,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      need_water: { emoji: '💧', text: "I'm in need of water.", color: '#ef4444' },
      great: { emoji: '🌟', text: "I'm doing great!", color: '#10b981' },
      fine: { emoji: '✅', text: "I'm doing fine.", color: '#3b82f6' },
      cold: { emoji: '🥶', text: "I'm cold.", color: '#60a5fa' },
      hot: { emoji: '🔥', text: "I'm hot.", color: '#f97316' },
      care: { emoji: '🆘', text: "I'm in need of care!", color: '#dc2626' },
      stale: { emoji: '⚠️', text: 'Connection lost.', color: '#6b7280' }
    };
    return configs[status] || { emoji: '❓', text: 'Unknown', color: '#9ca3af' };
  };

  const isStale = () => {
    if (!lastReading?.last_seen) return true;
    const thirtyMinsAgo = Date.now() - (30 * 60 * 1000);
    return lastReading.last_seen < thirtyMinsAgo;
  };

  const handleChangePlant = () => {
    navigate(`/onboarding${isTVMode ? '?tv=1' : ''}`);
  };

  if (loading) {
    return <div className="loading">Loading plant status...</div>;
  }

  const statusConfig = getStatusConfig(isStale() ? 'stale' : status);

  return (
    <div className={`home-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* Sidebar Navigation - Always Visible */}
      <nav className="nav-sidebar">
        <Link to={`/${isTVMode ? '?tv=1' : ''}`} className="nav-item active">
          <img src={healthIcon} alt="Health" />
          <span>Health</span>
        </Link>
        <Link to={`/details${isTVMode ? '?tv=1' : ''}`} className="nav-item">
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
      <div className="main-content" tabIndex="0">
        <h1>{statusConfig.text}</h1>

        {/* Plant 3D Visualization */}
        {carouselIndex === 0 && (
          <div className="plant-image-container">
            <PlantVisualization 
              moisture={lastReading?.soil_raw || 343}
              species={plant?.species || 'pothos'}
            />
          </div>
        )}

        {/* Chart */}
        {carouselIndex === 1 && chartData && (
          <div className="chart-wrapper">
            <div className="chart-card">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <h3>Last 3 Hours</h3>
              <div className="chart-container">
                <Line 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        bottom: 0
                      }
                    },
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: {
                        ticks: { 
                          color: '#666',
                          font: { size: 10 },
                          maxRotation: 0,
                          autoSkip: true,
                          maxTicksLimit: 6
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                      },
                      y: {
                        beginAtZero: false,
                        grace: '10%',
                        ticks: { 
                          color: '#666',
                          font: { size: 10 },
                          maxTicksLimit: 5
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toggle indicators */}
        <div className="view-toggle">
          <button 
            className={`indicator ${carouselIndex === 0 ? 'active' : ''}`}
            onClick={() => setCarouselIndex(0)}
            aria-label="View plant image"
          />
          <button 
            className={`indicator ${carouselIndex === 1 ? 'active' : ''}`}
            onClick={() => setCarouselIndex(1)}
            aria-label="View chart"
          />
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Moisture:</span>
            <span className="stat-value">{lastReading?.soil_raw || '--'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Temperature:</span>
            <span className="stat-value">
              {lastReading?.temp_c ? `${lastReading.temp_c}°C` : '--'}
            </span>
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

export default Home;
