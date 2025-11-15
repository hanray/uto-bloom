import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import PlantVisualization from '../../components/PlantVisualization';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusIndicator from '../../components/StatusIndicator';
import { HomeIcon, HistoryIcon, DetailsIcon, SettingsIcon } from '../../components/NavIcon';
import AIResponsesFeed from '../../components/AIResponsesFeed';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import logo from '../../icons/uto-labs-logo4x.png';

/**
 * DESKTOP LAYOUT - Built from Figma node 32-804
 * Layout structure:
 * - Left sidebar: Vertical pill navigation with 4 buttons
 * - Top: Header with title, subtitle, status badge, timestamp
 * - Top section: White status card + COLORED metric tiles (blue, orange, green) + large plant viz
 * - Bottom: Purple "Health" tile + Gray chart tile with animated bubbles + Cyan "History" tile
 */
function HomeDesktop({ plant, status, lastReading, chartData, loading, statusConfig }) {
  const plantData = { plant, status, lastReading };
  const { aiStatus, hasCamera, responses, apiError, videoRef, startAI, stopAI, clearResponses, takeSnapshot } = useAIAssistant(plantData, 'desktop');

  const handleAIClick = () => {
    // Don't allow interaction while initializing
    if (aiStatus === 'initializing') {
      console.log('⏳ Still initializing, please wait...');
      return;
    }
    
    if (aiStatus === 'idle') {
      startAI();
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
        ticks: { color: '#fff', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: { 
        display: true,
        beginAtZero: true,
        max: 1023,
        ticks: { 
          color: '#fff',
          stepSize: 200
        },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    },
    elements: {
      point: { 
        radius: 0,
        hoverRadius: 4,
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
  return (
    <div className={`app-layout ${false ? 'tv-mode' : ''}`}>
      {/* LEFT SIDEBAR - Vertical Pill Navigation */}
      <nav className="app-nav figma-sidebar-nav">
        <Link to="/" className="figma-nav-btn active">🏠</Link>
        <Link to="/history" className="figma-nav-btn">📊</Link>
        <Link to="/details" className="figma-nav-btn">ℹ️</Link>
        <Link to="/onboarding" className="figma-nav-btn">🌱</Link>
      </nav>

      {/* MAIN CONTENT GRID */}
      <main className="app-content">
        {/* HEADER - Row 1 - Reusable Header Component */}
        <header className="page-header figma-header">
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
          <div className={`ai-status-indicator ${aiStatus}`}>
            <span className="ai-status-dot"></span>
            {aiStatus === 'initializing' && 'Initializing AI Assistant...'}
            {aiStatus === 'idle' && `Last updated ${lastReading?.last_seen 
              ? new Date(lastReading.last_seen).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              : '09:24 PM'}`}
            {aiStatus === 'connecting' && 'AI Assistant connecting...'}
            {aiStatus === 'active' && 'AI Assistant active • Analyzing plant'}
            {aiStatus === 'error' && 'AI Assistant error • Check status bar'}
          </div>
        </header>

        {/* STATUS ROW - Full Width */}
        <div className="content-full figma-status-row">
          <StatusIndicator 
            status={status} 
            statusConfig={statusConfig}
            apiError={apiError}
            lastUpdated={lastReading?.timestamp}
          />
        </div>

        {/* METRICS + PLANT SECTION */}
        <div className="content-full figma-metrics-plant-container">
          {/* 4 COLORED Metric Tiles - Left Column */}
          <div className="figma-metrics-column">
            {/* PURPLE AI Assistant Tile */}
            <div className="figma-metric-tile purple-tile" onClick={handleAIClick} style={{ cursor: 'pointer' }}>
              <div className="figma-metric-icon-circle">
                <span className="figma-metric-icon">✨</span>
              </div>
              <p className="figma-metric-label">AI Assistant</p>
              <p className="figma-metric-value" style={{ fontSize: '0.75rem' }}>
                {aiStatus === 'initializing' && 'Initializing...'}
                {aiStatus === 'idle' && 'Click to start'}
                {aiStatus === 'connecting' && 'Starting...'}
                {aiStatus === 'active' && 'Active'}
                {aiStatus === 'error' && 'Error - Check status'}
              </p>
            </div>

            {/* BLUE Moisture Tile */}
            <div className={`figma-metric-tile blue-tile ${lastReading?.soil_raw ? 'has-data' : ''}`}>
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
            <div className="figma-metric-tile orange-tile">
              <div className="figma-metric-icon-circle">
                <span className="figma-metric-icon">🌡️</span>
              </div>
              <p className="figma-metric-label">Temperature</p>
              <p className="figma-metric-value">
                {lastReading?.temperature?.toFixed(1) || '22.5'}°C
              </p>
            </div>

            {/* GREEN Battery Tile */}
            <div className="figma-metric-tile green-tile">
              <div className="figma-metric-icon-circle">
                <span className="figma-metric-icon">🔋</span>
              </div>
              <p className="figma-metric-label">Battery</p>
              <p className="figma-metric-value">
                {lastReading?.battery_level?.toFixed(0) || '87'}%
              </p>
            </div>
          </div>

          {/* Plant Visualization - Right Side, Larger */}
          <div className="figma-plant-area">
            <div className="figma-plant-container">
              <PlantVisualization 
                species={plant?.species_key || 'monstera'} 
                health={(lastReading?.soil_raw || 512) / 1023}
              />
            </div>
          </div>
        </div>

        {/* AI RESPONSES FEED - Full Width Row */}
        {responses.length > 0 && (
          <div className="content-full ai-responses-container">
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
              <button className="ai-responses-close" onClick={clearResponses}>×</button>
            </div>
            <AIResponsesFeed responses={responses} />
          </div>
        )}

        {/* BOTTOM SECTION - Purple Health + Chart + Cyan History */}
        <div className="content-full figma-bottom-container">
          {/* PURPLE "Health" Tile */}
          <Link to="/details" className="figma-action-tile purple-tile">
            <div className="figma-action-icon-circle">
              <span className="figma-action-icon">✨</span>
            </div>
            <p className="figma-action-label">Health</p>
            <p className="figma-action-text">View Details</p>
          </Link>

          {/* CHART Tile with Animated Bubbles */}
          <div className="figma-chart-tile">
            <div className="figma-chart-bubbles">
              <div className="figma-chart-bubble"></div>
              <div className="figma-chart-bubble"></div>
              <div className="figma-chart-bubble"></div>
              <div className="figma-chart-bubble"></div>
              <div className="figma-chart-bubble"></div>
              <div className="figma-chart-bubble"></div>
            </div>
            <div className="figma-chart-header">
              <p className="figma-chart-title">Last 8 Hours<br/>Moisture Trend</p>
            </div>
            {chartData ? (
              <div className="figma-chart-content">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="figma-chart-placeholder">
                <LoadingSpinner size="sm" text="Loading chart data..." />
              </div>
            )}
          </div>

          {/* CYAN "History" Tile */}
          <Link to="/history" className="figma-action-tile cyan-tile">
            <div className="figma-action-icon-circle">
              <span className="figma-action-icon">📈</span>
            </div>
            <p className="figma-action-label">History</p>
            <p className="figma-action-text">View Trends</p>
          </Link>
        </div>
      </main>

      {/* FOOTER - Logo */}
      <footer className="app-footer">
        <img src={logo} alt="Uto Labs" className="figma-logo" />
      </footer>

      {/* Hidden video element for camera */}
      <video ref={videoRef} className="ai-video-hidden" playsInline />
    </div>
  );
}

export default HomeDesktop;
