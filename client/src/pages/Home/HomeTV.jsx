import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import PlantVisualization from '../../components/PlantVisualization';
import { HomeIcon, HistoryIcon, DetailsIcon, SettingsIcon } from '../../components/NavIcon';
import logo from '../../icons/uto-labs-logo4x.png';
import StatusIndicator from '../../components/StatusIndicator';
import QRCodeModal from '../../components/QRCodeModal';
import AIResponsesFeed from '../../components/AIResponsesFeed';
import { useAIAssistant } from '../../hooks/useAIAssistant';

/**
 * TV LAYOUT - Identical visual to Desktop but with D-pad navigation
 * Same Figma design (node 32-804) + focus management for ALL content
 */
function HomeTV({ plant, status, lastReading, chartData, loading, statusConfig }) {
  const plantData = { plant, status, lastReading };
  const { aiStatus, hasCamera, responses, showQR, apiError, videoRef, startAI, stopAI, toggleQR, clearResponses, takeSnapshot } = useAIAssistant(plantData, 'tv');
  
  // QR code points to mobile web UI on local network
  // This allows mobile devices to access the full app with camera support
  const localIP = window.location.hostname || 'localhost';
  const qrUrl = `http://${localIP}:5173`;

  const handleAIClick = () => {
    if (aiStatus === 'idle') {
      startAI(); // This will automatically show QR in TV mode
    } else if (aiStatus === 'active') {
      stopAI();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 0, right: 0, top: 10, bottom: 0 } },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: { 
        display: true,
        ticks: { color: '#fff', font: { size: 14 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: { 
        display: true,
        beginAtZero: true,
        max: 1023,
        ticks: { 
          color: '#fff',
          font: { size: 14 },
          stepSize: 200
        },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    },
    elements: {
      point: { 
        radius: 0,
        hoverRadius: 5,
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed'
      },
      line: { 
        borderWidth: 2,
        tension: 0.4,
        borderColor: '#7c3aed',
        fill: true,
        backgroundColor: 'rgba(124, 58, 237, 0.1)'
      }
    }
  };

  // D-pad Navigation Handler - NOW INCLUDES ALL CONTENT
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;

      // Get ALL focusable elements: header, status, metrics, sidebar, plant, action tiles
      const header = document.querySelector('.figma-header');
      const statusCard = document.querySelector('.figma-status-card');
      const metricTiles = Array.from(document.querySelectorAll('.figma-metric-tile'));
      const plantArea = document.querySelector('.figma-plant-area');
      const sidebarBtns = Array.from(document.querySelectorAll('.figma-nav-btn'));
      const actionTiles = Array.from(document.querySelectorAll('.figma-action-tile'));
      
      const allFocusable = [header, statusCard, ...metricTiles, plantArea, ...sidebarBtns, ...actionTiles].filter(Boolean);

      const currentIndex = allFocusable.findIndex(el => el === document.activeElement);

      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();

        // Nothing focused? Start at header
        if (currentIndex === -1) {
          allFocusable[0]?.focus();
          return;
        }

        // Simple up/down navigation through all content
        if (key === 'ArrowDown' && currentIndex < allFocusable.length - 1) {
          allFocusable[currentIndex + 1]?.focus();
        } else if (key === 'ArrowUp' && currentIndex > 0) {
          allFocusable[currentIndex - 1]?.focus();
        }
        
        // Horizontal navigation for action tiles
        const currentElement = allFocusable[currentIndex];
        if (actionTiles.includes(currentElement)) {
          const actionIndex = actionTiles.indexOf(currentElement);
          if (key === 'ArrowRight' && actionIndex < actionTiles.length - 1) {
            actionTiles[actionIndex + 1]?.focus();
          } else if (key === 'ArrowLeft' && actionIndex > 0) {
            actionTiles[actionIndex - 1]?.focus();
          }
        }
      }

      // Enter key to activate
      if (key === 'Enter') {
        e.preventDefault();
        document.activeElement?.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Set initial focus to header
    const header = document.querySelector('.figma-header');
    header?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="figma-desktop-layout figma-tv-mode">
      {/* CENTERED LOGO */}
      <div className="figma-logo-container">
        <img src={logo} alt="Uto Labs" className="figma-logo" />
      </div>
      
      <div className="figma-layout-wrapper">
        {/* LEFT SIDEBAR - Vertical Pill Navigation */}
        <div className="figma-sidebar-nav">
          <Link to="/?tv=1" className="figma-nav-btn active" tabIndex={0}>
            <HomeIcon />
          </Link>
          <Link to="/history?tv=1" className="figma-nav-btn" tabIndex={0}>
            <HistoryIcon />
          </Link>
          <Link to="/details?tv=1" className="figma-nav-btn" tabIndex={0}>
            <DetailsIcon />
          </Link>
          <Link to="/onboarding?tv=1" className="figma-nav-btn" tabIndex={0}>
            <SettingsIcon />
          </Link>
        </div>

        {/* MAIN CONTENT */}
        <div className="figma-main-content">
          {/* HEADER - NOW FOCUSABLE */}
          <div className="figma-header" tabIndex={0}>
            <div className="figma-header-left">
              <h1 className="figma-title">Uto Bloom</h1>
              <p className="figma-subtitle">
                {plant?.common_name || 'Monstera'} • {plant?.location || 'Living Room'}
              </p>
            </div>
            <div className="figma-status-badge">
              <div className="figma-badge-dot" />
              <span className="figma-badge-text">
                {plant?.common_name || 'Monstera'} • Active
              </span>
            </div>
            <div className="figma-timestamp">
              Last updated {lastReading?.last_seen 
                ? new Date(lastReading.last_seen).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : '09:24 PM'}
            </div>
          </div>

          {/* STATUS ROW - NOW FOCUSABLE */}
          <div className="figma-status-row">
            <StatusIndicator 
              status={status} 
              statusConfig={statusConfig}
            />
          </div>

          {/* METRICS + PLANT SECTION */}
          <div className="figma-metrics-plant-container">
            {/* 4 COLORED Metric Tiles - Left Column - ALL FOCUSABLE */}
            <div className="figma-metrics-column">
              {/* PURPLE AI Assistant Tile */}
              <div 
                className="figma-metric-tile purple-tile" 
                tabIndex={0}
                onClick={handleAIClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="figma-metric-icon-circle">
                  <span className="figma-metric-icon">✨</span>
                </div>
                <p className="figma-metric-label">AI Assistant</p>
                <p className="figma-metric-value" style={{ fontSize: '0.75rem' }}>
                  {aiStatus === 'idle' && 'Press to start'}
                  {aiStatus === 'connecting' && 'Starting...'}
                  {aiStatus === 'active' && 'Active'}
                  {aiStatus === 'error' && 'Error'}
                </p>
              </div>

              {/* BLUE Moisture Tile */}
              <div className={`figma-metric-tile blue-tile ${lastReading?.soil_raw ? 'has-data' : ''}`} tabIndex={0}>
                <div className="figma-metric-icon-circle">
                  <span className="figma-metric-icon">💧</span>
                </div>
                <p className="figma-metric-label">Moisture</p>
                <p className="figma-metric-value">
                  {lastReading?.soil_raw ? `${Math.round((lastReading.soil_raw / 1023) * 100)}%` : 'Not Connected'}
                </p>
                {lastReading?.soil_raw && (
                  <div className="bubble-container">
                    <div className="bubble bubble-1"></div>
                    <div className="bubble bubble-2"></div>
                    <div className="bubble bubble-3"></div>
                  </div>
                )}
              </div>

              {/* ORANGE Temperature Tile */}
              <div className="figma-metric-tile orange-tile" tabIndex={0}>
                <div className="figma-metric-icon-circle">
                  <span className="figma-metric-icon">🌡️</span>
                </div>
                <p className="figma-metric-label">Temperature</p>
                <p className="figma-metric-value">
                  {lastReading?.temperature?.toFixed(1) || '22.5'}°C
                </p>
              </div>

              {/* GREEN Battery Tile */}
              <div className="figma-metric-tile green-tile" tabIndex={0}>
                <div className="figma-metric-icon-circle">
                  <span className="figma-metric-icon">🔋</span>
                </div>
                <p className="figma-metric-label">Battery</p>
                <p className="figma-metric-value">
                  {lastReading?.battery_level?.toFixed(0) || '87'}%
                </p>
              </div>
            </div>

            {/* Large Plant Visualization - Right Side - FOCUSABLE */}
            <div className="figma-plant-area" tabIndex={0}>
              <div className="figma-plant-container">
                <PlantVisualization 
                  species={plant?.species_key || 'monstera'} 
                  health={(lastReading?.soil_raw || 512) / 1023}
                  height={420}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION TILES - 3 columns with gradient cards */}
          <div className="figma-action-tiles">
            {/* PURPLE Health Tile */}
            <Link to="/details?tv=1" className="figma-action-tile purple-tile" tabIndex={0}>
              <div className="figma-action-icon-circle">
                <span className="figma-action-icon">🌿</span>
              </div>
              <p className="figma-action-label">Health</p>
              <p className="figma-action-sublabel">View plant details</p>
            </Link>

            {/* GRAY Chart Tile with CHART - Wider for better TV display */}
            <div className="figma-action-tile chart-tile figma-tv-chart" tabIndex={0}>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <p className="figma-chart-title">Last 8 Hours<br/>Moisture Trend</p>
              {chartData && (
                <div className="figma-chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* CYAN History Tile */}
            <Link to="/history?tv=1" className="figma-action-tile cyan-tile" tabIndex={0}>
              <div className="figma-action-icon-circle">
                <span className="figma-action-icon">📊</span>
              </div>
              <p className="figma-action-label">History</p>
              <p className="figma-action-sublabel">View trends</p>
            </Link>
          </div>

          {/* AI RESPONSES FEED - Full Width Row */}
          {responses.length > 0 && (
            <div className="content-full ai-responses-container" tabIndex={0}>
              <button className="ai-responses-close" onClick={clearResponses}>×</button>
              <div className="ai-responses-header">
                <h3 className="ai-responses-title">
                  🤖 AI Assistant Insights
                </h3>
                <div 
                  className={`ai-camera-led ${aiStatus === 'active' ? 'active' : 'inactive'}`}
                  onClick={aiStatus !== 'active' ? startAI : undefined}
                  title={aiStatus === 'active' ? 'Camera connected' : 'Click to restart camera'}
                  style={{ cursor: aiStatus !== 'active' ? 'pointer' : 'default' }}
                />
                <button 
                  className="ai-snapshot-button" 
                  onClick={takeSnapshot}
                  disabled={aiStatus !== 'active'}
                  title="Take snapshot and analyze"
                >
                  📸 Analyze Now
                </button>
                <span className="ai-responses-count">{responses.length}/10</span>
              </div>
              <AIResponsesFeed responses={responses} />
            </div>
          )}
        </div>
      </div>

      {/* Hidden video element for camera */}
      <video ref={videoRef} className="ai-video-hidden" playsInline />

      {/* QR Code Modal */}
      <QRCodeModal isOpen={showQR} onClose={toggleQR} url={qrUrl} />
    </div>
  );
}

export default HomeTV;
