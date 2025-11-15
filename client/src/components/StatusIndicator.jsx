import './StatusIndicator.css';

/**
 * StatusIndicator - Design System Component
 * Status message bar with emoji and text based on Figma design
 * Matches node 52-212 from Figma Design System
 * 
 * @param {string} status - Status key: 'great', 'fine', 'need_water', 'cold', 'hot', 'care', 'stale'
 * @param {object} statusConfig - Status configuration with emoji, text, and color
 * @param {string} className - Optional additional CSS classes
 */
function StatusIndicator({ status, statusConfig, className = '' }) {
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

  return (
    <div 
      className={`status-indicator ${className}`}
      style={{ backgroundColor: styles.background }}
    >
      {statusConfig?.emoji && (
        <span className="status-indicator__emoji">
          {statusConfig.emoji}
        </span>
      )}
      <span className="status-indicator__text" style={{ color: styles.textColor }}>
        {statusConfig?.text || 'Status unknown'}
      </span>
    </div>
  );
}

export default StatusIndicator;
