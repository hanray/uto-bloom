import { Line } from 'react-chartjs-2';
import MobileMenu from '../../components/MobileMenu';
import logo from '../../icons/uto-labs-logo4x.png';
import LoadingSpinner from '../../components/LoadingSpinner';

function HistoryMobile({ plant, range, setRange, chartData, loading }) {
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading history..." />;
  }

  return (
    <div className="figma-mobile-layout">
      {/* SLIDE-OUT MENU */}
      <MobileMenu currentPage="/history" />

      {/* HEADER */}
      <div className="figma-mobile-header">
        <div className="figma-logo-container">
          <img src={logo} alt="Uto Labs" className="figma-logo" />
        </div>
      </div>

      {/* TITLE */}
      <div className="figma-mobile-title-section">
        <h1 className="figma-title">History</h1>
        <p className="figma-subtitle">{plant?.common_name || 'My Plant'}</p>
      </div>

      {/* CONTENT */}
      <div className="figma-mobile-content">
        {/* Chart Card */}
        <div className="history-chart-card" style={{ maxWidth: '100%' }}>
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
            <div style={{ height: '300px', position: 'relative' }}>
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
                      maxTicksLimit: 6,
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
                    hoverRadius: 5,
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
      </div>
    </div>
  );
}

export default HistoryMobile;
