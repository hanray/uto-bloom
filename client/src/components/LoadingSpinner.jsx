import './LoadingSpinner.css';

/**
 * LoadingSpinner - Design System Component
 * A reusable loading indicator following the Figma design system
 * 
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {string} text - Optional loading text to display
 * @param {boolean} fullScreen - Whether to center in full viewport (default: false)
 */
function LoadingSpinner({ size = 'md', text = 'Loading...', fullScreen = false }) {
  const spinnerClass = `loading-spinner loading-spinner--${size}`;
  const containerClass = fullScreen 
    ? 'loading-spinner-container loading-spinner-container--fullscreen' 
    : 'loading-spinner-container';

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
