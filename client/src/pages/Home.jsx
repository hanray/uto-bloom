// REQ: BR-UX-001 (Home must be readable at a glance)
// REQ: FR-UI-001 (Home shows image, status, last updated, 24h mini-chart)
// REQ: BR-ST-001 (Display "Need water" status)
// REQ: BR-ST-002 (Display "I'm doing great" status)
// REQ: BR-ST-003 (Display temperature alerts)
// REQ: BR-ST-004 (Display "In need of care!" status)

import React, { useState, useEffect } from 'react';

/**
 * Home Page - Main plant status overview
 * Shows at-a-glance status, image, and 24h mini-chart
 */
function Home() {
  const [plantStatus, setPlantStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch current plant status from API
    // TODO: Subscribe to WebSocket for live updates
    // TODO: Check if data is stale (> 30 min)
    // TODO: Display stale badge if needed
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading plant status...</div>;
  }

  return (
    <div className="home-page">
      <h1>My Plant</h1>
      
      {/* TODO: Plant image */}
      <div className="plant-image">
        <img src="/placeholder-plant.jpg" alt="Plant" />
      </div>
      
      {/* TODO: Status pill with appropriate color/icon */}
      <div className="status-badge">
        Status: Unknown (stub)
      </div>
      
      {/* TODO: Last updated timestamp */}
      <div className="last-updated">
        Last updated: --
      </div>
      
      {/* TODO: 24h moisture mini-chart */}
      <div className="mini-chart">
        24h Chart (stub)
      </div>
      
      {/* TODO: Quick action buttons */}
      <div className="actions">
        <button>View Details</button>
        <button>View History</button>
      </div>
    </div>
  );
}

export default Home;
