import { useNavigate } from 'react-router-dom';
import logo from '../../icons/uto-labs-logo4x.png';
import StatusIndicator from '../../components/StatusIndicator';
import LoadingSpinner from '../../components/LoadingSpinner';

function DetailsDesktop({ plant, details, loading, isTVMode = false }) {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading details..." />;
  }

  return (
    <div className={`app-layout details-page ${isTVMode ? 'tv-mode' : ''}`}>
      {/* LEFT SIDEBAR */}
      <nav className="app-nav figma-sidebar-nav">
        <button onClick={() => navigate('/')} className="figma-nav-btn">🏠</button>
        <button onClick={() => navigate('/history')} className="figma-nav-btn">📊</button>
        <button onClick={() => navigate('/details')} className="figma-nav-btn active">ℹ️</button>
        <button onClick={() => navigate('/onboarding')} className="figma-nav-btn">🌱</button>
      </nav>

      {/* MAIN CONTENT GRID */}
      <main className="app-content">
        {/* HEADER - Row 1 - Reusable Header Component */}
        <header className="page-header figma-header">
          <div className="figma-header-left">
            <h1 className="figma-title">Details</h1>
            <p className="figma-subtitle">{plant?.common_name || 'My Plant'}</p>
          </div>
        </header>

        {/* CARD GRID - Row 2 */}
        <div className="page-main">
          {/* Current Status Card - Half width */}
          <div className="content-half details-card status-card">
            <div className="details-card-header">
              <h3 className="details-card-title">Current Status</h3>
            </div>
            <div className="details-card-content">
              <StatusIndicator state={details?.status || 'unknown'} />
            </div>
          </div>

          {/* Current Readings Card - Half width */}
          <div className="content-half details-card">
            <div className="details-card-header">
              <h3 className="details-card-title">Current Readings</h3>
            </div>
            <div className="details-card-content">
              <div className="details-row">
                <span className="details-label">Soil Moisture</span>
                <span className="details-value">{details?.soil_raw || '--'} (raw)</span>
              </div>
              <div className="details-divider"></div>
              <div className="details-row">
                <span className="details-label">Temperature</span>
                <span className="details-value">{details?.temp_c ? `${details.temp_c}°C` : '--'}</span>
              </div>
            </div>
          </div>

          {/* Recent Status Changes Card - Half width */}
          <div className="content-half details-card">
            <div className="details-card-header">
              <h3 className="details-card-title">Recent Status Changes</h3>
            </div>
            <div className="details-card-content">
              <div className="details-row">
                <span className="details-label">Last change</span>
                <span className="details-value">--</span>
              </div>
              <div className="details-divider"></div>
              <div className="details-row">
                <span className="details-label">Reason</span>
                <span className="details-value">--</span>
              </div>
            </div>
          </div>

          {/* Device Information Card - Half width */}
          <div className="content-half details-card">
            <div className="details-card-header">
              <h3 className="details-card-title">Device Information</h3>
            </div>
            <div className="details-card-content">
              <div className="details-row">
                <span className="details-label">Node ID</span>
                <span className="details-value">--</span>
              </div>
              <div className="details-divider"></div>
              <div className="details-row">
                <span className="details-label">Last seen</span>
                <span className="details-value">--</span>
              </div>
              <div className="details-divider"></div>
              <div className="details-row">
                <span className="details-label">Calibrated</span>
                <span className="details-value">--</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER - Logo */}
      <footer className="app-footer">
        <img src={logo} alt="Uto Labs" className="figma-logo" />
      </footer>
    </div>
  );
}

export default DetailsDesktop;
