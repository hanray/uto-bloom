import { useState } from 'react';
import './SearchBar.css';

/**
 * SearchBar - Design System Component
 * Search input with icon and clear button
 * Based on Figma Design System search specs
 * 
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Controlled value
 * @param {function} onChange - Change handler
 * @param {function} onClear - Clear handler (optional)
 * @param {string} variant - 'primary' (default), 'compact', or 'minimal'
 */
function SearchBar({ 
  placeholder = 'Search...', 
  value = '', 
  onChange, 
  onClear,
  variant = 'primary',
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(value);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) onChange(e);
  };
  
  const handleClear = () => {
    setInternalValue('');
    if (onClear) onClear();
    if (onChange) onChange({ target: { value: '' } });
  };
  
  const displayValue = onChange ? value : internalValue;
  const variantClass = `search-bar--${variant}`;
  
  return (
    <div className={`search-bar ${variantClass} ${className}`}>
      {/* Search Icon */}
      <svg 
        className="search-bar__icon" 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Input Field */}
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
      />
      
      {/* Clear Button */}
      {displayValue && (
        <button 
          className="search-bar__clear" 
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M15 5L5 15M5 5l10 10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
