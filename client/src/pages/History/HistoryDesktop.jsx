import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import logo from '../../icons/uto-labs-logo4x.png';
import LoadingSpinner from '../../components/LoadingSpinner';

function HistoryDesktop({ plant, range, setRange, chartData, loading, isTVMode = false }) {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading history..." />;
  }

  return (
    <div className={`app-layout history-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* LEFT SIDEBAR - Vertical Pill Navigation */}
      <nav className="app-nav figma-sidebar-nav">
        <button onClick={() => navigate('/')} className="figma-nav-btn">🏠</button>
        <button onClick={() => navigate('/history')} className="figma-nav-btn active">📊</button>
        <button onClick={() => navigate('/details')} className="figma-nav-btn">ℹ️</button>
        <button onClick={() => navigate('/onboarding')} className="figma-nav-btn">🌱</button>
      </nav>

      {/* MAIN CONTENT GRID */}
      <main className="app-content">
        {/* HEADER - Row 1 - Reusable Header Component */}
        <header className="page-header figma-header">
          <div className="figma-header-left">
            <h1 className="figma-title">History</h1>
            <p className="figma-subtitle">{plant?.common_name || 'My Plant'}</p>
          </div>
        </header>

        {/* CHART - Row 2, Full Width */}
        <div className="content-full history-chart-card">
          {/* Range Selector - Radio Style */}
          <div className="history-range-selector">
            <label className="history-range-option">
              <input 
                type="radio" 
                name="range" 
                checked={range === '24h'}
                onChange={() => setRange('24h')}
              />
              <span className="history-range-label">24 hrs</span>
            </label>
            <label className="history-range-option">
              <input 
                type="radio" 
                name="range" 
                checked={range === '7d'}
                onChange={() => setRange('7d')}
              />
              <span className="history-range-label">7 days</span>
            </label>
          </div>

          {/* Chart */}
          {chartData && (
            <div className="history-chart-wrapper">
              <Line data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1f2129',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    borderColor: '#374151',
                    borderWidth: 1
                  }
                },
                scales: {
                  x: {
                    grid: { 
                      color: '#374151',
                      drawBorder: false
                    },
                    ticks: { 
                      color: '#9ca3af',
                      maxTicksLimit: 8,
                      maxRotation: 0,
                      autoSkip: true
                    }
                  },
                  y: {
                    beginAtZero: true,
                    max: 1023,
                    grid: { 
                      color: '#374151',
                      drawBorder: false
                    },
                    ticks: { 
                      color: '#9ca3af',
                      stepSize: 200
                    }
                  }
                },
                elements: {
                  point: { 
                    radius: 0,
                    hoverRadius: 6,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#8b5cf6',
                    borderWidth: 2
                  },
                  line: { 
                    borderWidth: 2,
                    tension: 0.4,
                    borderColor: '#8b5cf6',
                    fill: false
                  }
                }
              }} />
            </div>
          )}
        </div>
      </main>

      {/* FOOTER - Logo */}
      <footer className="app-footer">
        <img src={logo} alt="Uto Labs" className="figma-logo" />
      </footer>
    </div>
  );
}

export default HistoryDesktop;
