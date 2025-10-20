// REQ: BR-UX-004 (Charts should show trends cleanly)
// REQ: FR-UI-003 (History view with 24h and 7d charts)

import React, { useState, useEffect } from 'react';

/**
 * History Page - Trend charts for 24h and 7d
 * Displays moisture and temperature trends over time
 */
function History() {
  const [range, setRange] = useState('24h');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch history data from API
    // TODO: Handle 24h vs 7d range selection
    // TODO: Apply data smoothing/aggregation
    // TODO: Hide/de-emphasize outliers
    
    setLoading(false);
  }, [range]);

  if (loading) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="history-page">
      <h1>History</h1>
      
      {/* TODO: Range selector */}
      <div className="range-selector">
        <button 
          onClick={() => setRange('24h')}
          className={range === '24h' ? 'active' : ''}
        >
          24 Hours
        </button>
        <button 
          onClick={() => setRange('7d')}
          className={range === '7d' ? 'active' : ''}
        >
          7 Days
        </button>
      </div>
      
      {/* TODO: Moisture chart */}
      <section className="chart-section">
        <h2>Soil Moisture</h2>
        <div className="chart-container">
          Chart for {range} (stub)
        </div>
      </section>
      
      {/* TODO: Temperature chart (if available) */}
      <section className="chart-section">
        <h2>Temperature</h2>
        <div className="chart-container">
          Temperature chart (stub)
        </div>
      </section>
      
      {/* TODO: TV-optimized layout (large fonts, readable from 2-3m) */}
      {/* TODO: Phone-optimized layout (touch-friendly, scrollable) */}
    </div>
  );
}

export default History;
