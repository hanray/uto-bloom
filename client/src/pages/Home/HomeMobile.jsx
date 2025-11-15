import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import PlantVisualization from '../../components/PlantVisualization';
import MobileMenu from '../../components/MobileMenu';
import logo from '../../icons/uto-labs-logo4x.png';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusIndicator from '../../components/StatusIndicator';
import AIResponsesFeed from '../../components/AIResponsesFeed';
import { useAIAssistant } from '../../hooks/useAIAssistant';

/**
 * MOBILE LAYOUT - Single column stacked design with slide-out menu
 * Adapted from Figma design for mobile viewport
 */
function HomeMobile({ plant, status, lastReading, chartData, loading, statusConfig }) {
  const plantData = { plant, status, lastReading };
  const { aiStatus, hasCamera, responses, apiError, isAnalyzing, analysisProgress, videoRef, startAI, stopAI, clearResponses, takeSnapshot } = useAIAssistant(plantData, 'mobile');

  const handleAIClick = () => {
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
        ticks: { color: '#fff', maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
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
    <div className="figma-mobile-layout">
      {/* SLIDE-OUT MENU */}
      <MobileMenu currentPage="/" />

      {/* HEADER */}
      <div className="figma-mobile-header">
        <div className="figma-logo-container">
          <img src={logo} alt="Uto Labs" className="figma-logo" />
        </div>
      </div>

      {/* TITLE */}
      <div className="figma-mobile-title-section">
        <h1 className="figma-title">Uto Bloom</h1>
        <p className="figma-subtitle">
          {plant?.common_name || 'Monstera'} • {plant?.location || 'Living Room'}
        </p>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="figma-mobile-content">
        {/* Status Card */}
        <StatusIndicator 
          status={status} 
          statusConfig={statusConfig}
          className="status-indicator--mobile"
        />
        <p className={`ai-status-indicator ${aiStatus}`} style={{ textAlign: 'center' }}>
          <span className="ai-status-dot"></span>
          {aiStatus === 'idle' && `Last updated ${lastReading?.last_seen 
              ? new Date(lastReading.last_seen).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              : '09:24 PM'}`}
          {aiStatus === 'connecting' && 'AI Assistant connecting...'}
          {aiStatus === 'active' && 'AI Assistant active • Analyzing'}
          {aiStatus === 'error' && 'AI error • Check permissions'}
        </p>

        {/* Metrics Grid */}
        <div className="figma-mobile-plant-area">
          <div className="figma-mobile-plant-container">
            <PlantVisualization 
              species={plant?.species_key || 'monstera'} 
              health={(lastReading?.soil_raw || 512) / 1023}
              height={280}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="figma-mobile-metrics">
          <div className="figma-mobile-metric-tile purple-tile" onClick={handleAIClick} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {aiStatus === 'active' && (
              <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="figma-mobile-metric-icon">✨</div>
              <p className="figma-mobile-metric-label">AI Assistant</p>
              <p className="figma-mobile-metric-value" style={{ fontSize: '0.75rem' }}>
                {aiStatus === 'idle' ? 'Tap to Start' : aiStatus === 'active' ? 'Camera Ready' : aiStatus}
              </p>
              {aiStatus === 'active' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); takeSnapshot(); }}
                  disabled={isAnalyzing}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: isAnalyzing ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isAnalyzing ? '⏳ Analyzing...' : '📸 Analyze Plant'}
                </button>
              )}
            </div>
          </div>

          <div className={`figma-mobile-metric-tile blue-tile ${lastReading?.soil_raw ? 'has-data' : ''}`}>
            <div className="figma-mobile-metric-icon">💧</div>
            <p className="figma-mobile-metric-label">Moisture</p>
            <p className="figma-mobile-metric-value">
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

          <div className="figma-mobile-metric-tile orange-tile">
            <div className="figma-mobile-metric-icon">🌡️</div>
            <p className="figma-mobile-metric-label">Temperature</p>
            <p className="figma-mobile-metric-value">
              {lastReading?.temperature?.toFixed(1) || '22.5'}°C
            </p>
          </div>

          <div className="figma-mobile-metric-tile green-tile">
            <div className="figma-mobile-metric-icon">🔋</div>
            <p className="figma-mobile-metric-label">Battery</p>
            <p className="figma-mobile-metric-value">
              {lastReading?.battery_level?.toFixed(0) || '87'}%
            </p>
          </div>
        </div>

        {/* Chart Area */}
        <div className="figma-mobile-chart-card">
          <p className="figma-mobile-chart-title">Last 8 Hours<br/>Moisture Trend</p>
          {chartData ? (
            <div className="figma-mobile-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="figma-mobile-chart-placeholder">
              <LoadingSpinner size="sm" text="Loading chart..." />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="figma-mobile-actions">
          <Link to="/details" className="figma-mobile-action-btn purple-tile">
            <div className="figma-mobile-action-icon">✨</div>
            <div className="figma-mobile-action-text">
              <p className="figma-mobile-action-label">Health</p>
              <p className="figma-mobile-action-desc">View Details</p>
            </div>
          </Link>

          <Link to="/history" className="figma-mobile-action-btn cyan-tile">
            <div className="figma-mobile-action-icon">📈</div>
            <div className="figma-mobile-action-text">
              <p className="figma-mobile-action-label">History</p>
              <p className="figma-mobile-action-desc">View Trends</p>
            </div>
          </Link>
        </div>

        {/* ANALYSIS PROGRESS INDICATOR */}
        {analysisProgress && (
          <div className="ai-progress-indicator" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(124, 58, 237, 0.95)',
            padding: '24px 32px',
            borderRadius: '16px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            zIndex: 9999,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5)'
          }}>
            {analysisProgress}
          </div>
        )}

        {/* AI RESPONSES FEED */}
        {responses.length > 0 && (
          <div className="ai-responses-container">
            <button className="ai-responses-close" onClick={clearResponses}>×</button>
            <div className="ai-responses-header">
              <h3 className="ai-responses-title">🤖 AI Insights</h3>
              <span className="ai-responses-count">{responses.length}/10</span>
            </div>
            <AIResponsesFeed responses={responses} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeMobile;
