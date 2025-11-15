import MobileMenu from '../../components/MobileMenu';
import logo from '../../icons/uto-labs-logo4x.png';
import StatusIndicator from '../../components/StatusIndicator';
import LoadingSpinner from '../../components/LoadingSpinner';

function DetailsMobile({ plant, details, loading }) {
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading details..." />;
  }

  return (
    <div className="figma-mobile-layout">
      {/* SLIDE-OUT MENU */}
      <MobileMenu currentPage="/details" />

      {/* HEADER */}
      <div className="figma-mobile-header">
        <div className="figma-logo-container">
          <img src={logo} alt="Uto Labs" className="figma-logo" />
        </div>
      </div>

      {/* TITLE */}
      <div className="figma-mobile-title-section">
        <h1 className="figma-title">Plant Details</h1>
        <p className="figma-subtitle">{plant?.common_name || 'My Plant'}</p>
      </div>

      {/* CONTENT */}
      <div className="figma-mobile-content">
        {/* Card Grid */}
        <div className="details-mobile-grid">
          {/* Current Status Card */}
          <div className="details-card status-card">
            <div className="details-card-header">
              <h3 className="details-card-title">Current Status</h3>
            </div>
            <div className="details-card-content">
              <StatusIndicator state={details?.status || 'unknown'} />
            </div>
          </div>

          {/* Current Readings Card */}
          <div className="details-card">
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

          {/* Recent Status Changes Card */}
          <div className="details-card">
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

          {/* Device Information Card */}
          <div className="details-card">
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
      </div>
    </div>
  );
}

export default DetailsMobile;
