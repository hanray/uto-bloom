import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Slide-out side menu for mobile devices
 * Activated by tapping a white glowing tab on the left edge
 */
function MobileMenu({ currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/history', icon: '📊', label: 'History' },
    { path: '/details', icon: 'ℹ️', label: 'Details' },
    { path: '/onboarding', icon: '🌱', label: 'Change Plant' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* MENU TAB - White with soft glow */}
      <button 
        className="figma-mobile-menu-tab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className="figma-menu-tab-icon">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* OVERLAY - Dark backdrop when menu is open */}
      {isOpen && (
        <div 
          className="figma-mobile-menu-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDE MENU - Slides in from left */}
      <div className={`figma-mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="figma-mobile-menu-header">
          <h2 className="figma-mobile-menu-title">Menu</h2>
        </div>
        
        <nav className="figma-mobile-menu-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`figma-mobile-menu-item ${currentPage === item.path ? 'active' : ''}`}
            >
              <span className="figma-mobile-menu-icon">{item.icon}</span>
              <span className="figma-mobile-menu-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

export default MobileMenu;
