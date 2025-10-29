// REQ: BR-UX-004 (Charts should show trends cleanly)
// REQ: FR-UI-003 (History view with 24h and 7d charts)

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

function History() {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [range, setRange] = useState('24h');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTVMode(params.get('tv') === '1');
    
    loadPlantData();
    loadHistoryData(range);
  }, [range]);

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

  const loadPlantData = () => {
    const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
    setPlant(selectedPlant);
  };

  const loadHistoryData = async (timeRange) => {
    try {
      const response = await fetch(`/api/history?device_id=pot-01&range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        updateChartData(data.readings || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (readings) => {
    if (!readings.length) return;
    
    const labels = readings.map(r => {
      const date = new Date(r.ts * 1000);
      if (range === '24h') {
        return date.getHours() + ':00';
      } else {
        return (date.getMonth() + 1) + '/' + date.getDate();
      }
    });
    
    const moistureData = readings.map(r => r.soil_raw);
    const tempData = readings.map(r => r.temp_c);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Soil Moisture',
        data: moistureData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        beginAtZero: true,
        max: 1023,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  return (
    <div className={`history-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* Sidebar Navigation - Always Visible */}
      <nav className="nav-sidebar">
        <Link to={`/${isTVMode ? '?tv=1' : ''}`} className="nav-item">
          <img src={healthIcon} alt="Health" />
          <span>Health</span>
        </Link>
        <Link to={`/details${isTVMode ? '?tv=1' : ''}`} className="nav-item">
          <img src={detailsIcon} alt="Details" />
          <span>Details</span>
        </Link>
        <Link to={`/history${isTVMode ? '?tv=1' : ''}`} className="nav-item active">
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
        {/* Range Selector */}
        <div className="range-selector">
          <button 
            onClick={() => setRange('24h')}
            className={`range-button ${range === '24h' ? 'active' : ''}`}
          >
            <div className={`radio ${range === '24h' ? 'selected' : ''}`}></div>
            <span>24 hrs</span>
          </button>
          <button 
            onClick={() => setRange('7d')}
            className={`range-button ${range === '7d' ? 'active' : ''}`}
          >
            <div className={`radio ${range === '7d' ? 'selected' : ''}`}></div>
            <span>7 days</span>
          </button>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="chart-card" tabIndex="0">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <h3>Last {range === '24h' ? '24 Hours' : '7 Days'}</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Logo */}
        <img src={logo} alt="UTO Labs" className="logo" />
      </div>

      {/* UtoBloom text */}
      <div className="app-name">UtoBloom</div>
    </div>
  );
}

export default History;
