import './StatusIndicator.css';

/**
 * StatusIndicator - Design System Component
 * Status message bar with emoji and text based on Figma design
 * Matches node 52-212 from Figma Design System
 * 
 * @param {string} status - Status key: 'great', 'fine', 'need_water', 'cold', 'hot', 'care', 'stale'
 * @param {object} statusConfig - Status configuration with emoji, text, and color
 * @param {string} apiError - Optional API error message to display
 * @param {number} lastUpdated - Optional timestamp of last update
 * @param {string} className - Optional additional CSS classes
 */
function StatusIndicator({ status, statusConfig, apiError, lastUpdated, className = '' }) {
  // Map status to Figma design colors
  const getStatusStyles = (statusKey) => {
    const statusMap = {
      great: { background: '#10b981', textColor: '#ffffff' }, // emerald-500
      fine: { background: '#3b82f6', textColor: '#ffffff' }, // blue-500
      need_water: { background: '#314841', textColor: '#ffffff' }, // dark teal
      cold: { background: '#60a5fa', textColor: '#ffffff' }, // blue-400
      hot: { background: '#f97316', textColor: '#ffffff' }, // orange-500
      care: { background: '#c32828', textColor: '#ffffff' }, // red
      stale: { background: '#6b7280', textColor: '#ffffff' } // gray-500
    };
    
    return statusMap[statusKey] || statusMap.stale;
  };

  const styles = getStatusStyles(status);

  // Format last updated time
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div 
      className={`status-indicator ${className}`}
      style={{ backgroundColor: apiError ? '#ef4444' : styles.background }}
    >
      {apiError ? (
        <>
          <span className="status-indicator__emoji">⚠️</span>
          <div className="status-indicator__content">
            <span className="status-indicator__text" style={{ color: styles.textColor }}>
              Trouble talking to API. Last error received:
            </span>
            <span className="status-indicator__error" style={{ color: styles.textColor }}>
              {apiError}
            </span>
            {lastUpdated && (
              <span className="status-indicator__timestamp" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          {statusConfig?.emoji && (
            <span className="status-indicator__emoji">
              {statusConfig.emoji}
            </span>
          )}
          <div className="status-indicator__content">
            <span className="status-indicator__text" style={{ color: styles.textColor }}>
              {statusConfig?.text || 'Status unknown'}
            </span>
            {lastUpdated && (
              <span className="status-indicator__timestamp" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StatusIndicator;
