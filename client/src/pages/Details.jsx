// REQ: BR-UX-002 (Explain status changes)
// REQ: FR-UI-002 (Details view explains status changes with timestamps)

import React, { useState, useEffect } from 'react';

/**
 * Details Page - Detailed plant status with explanations
 * Shows current values, thresholds, and reason for status
 */
function Details() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch detailed status from API
    // TODO: Include current readings, thresholds, calibration
    // TODO: Get status change history
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading details...</div>;
  }

  return (
    <div className="details-page">
      <h1>Plant Details</h1>
      
      {/* TODO: Current status with explanation */}
      <section className="current-status">
        <h2>Current Status</h2>
        <p>Status explanation (stub)</p>
      </section>
      
      {/* TODO: Current readings */}
      <section className="readings">
        <h2>Current Readings</h2>
        <div className="reading-item">
          <span>Soil Moisture:</span>
          <span>-- (raw)</span>
        </div>
        <div className="reading-item">
          <span>Temperature:</span>
          <span>-- °C</span>
        </div>
      </section>
      
      {/* TODO: Thresholds and bands */}
      <section className="thresholds">
        <h2>Thresholds</h2>
        <p>Threshold visualization (stub)</p>
      </section>
      
      {/* TODO: Status change log */}
      <section className="status-history">
        <h2>Recent Status Changes</h2>
        <p>Changed to [status] at [time] because [reason]</p>
      </section>
      
      {/* TODO: Device metadata */}
      <section className="device-info">
        <h2>Device Information</h2>
        <p>Node ID: --</p>
        <p>Last seen: --</p>
        <p>Calibrated: --</p>
      </section>
    </div>
  );
}

export default Details;
