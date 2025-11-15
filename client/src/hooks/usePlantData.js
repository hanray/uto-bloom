import { useState, useEffect } from 'react';

/**
 * Shared plant data fetching and WebSocket logic
 * Used across all layout variants (Desktop, Mobile, TV)
 * 
 * @returns {Object} Plant data and handlers
 */
export function usePlantData() {
  const [plant, setPlant] = useState(null);
  const [status, setStatus] = useState('unknown');
  const [lastReading, setLastReading] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('monstera');

  useEffect(() => {
    loadPlantData();
    const ws = setupWebSocket();
    
    const interval = setInterval(loadPlantData, 60000); // Refresh every minute
    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const loadPlantData = async () => {
    try {
      const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
      setPlant(selectedPlant);
      
      // Fetch latest node status
      const nodeResponse = await fetch(`/api/nodes/pot-01`);
      if (nodeResponse.ok) {
        const nodeData = await nodeResponse.json();
        setLastReading(nodeData);
        setStatus(nodeData.status || 'unknown');
        setIsInitialLoad(false);
      }
      
      // Fetch 24h history for mini chart
      const historyResponse = await fetch(`/api/history?device_id=pot-01&range=24h`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        updateChartData(historyData.readings || []);
      }
      
    } catch (error) {
      console.error('Error loading plant data:', error);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = 3000;
    const wsUrl = `${protocol}//${wsHost}:${wsPort}/live`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const reading = JSON.parse(event.data);
      if (reading.device_id === 'pot-01') {
        setLastReading(reading);
        loadPlantData();
      }
    };
    
    ws.onerror = (error) => {
      console.log('WebSocket connection failed:', error);
      console.log('Attempted URL:', wsUrl);
    };
    
    ws.onopen = () => console.log('WebSocket connected');
    
    return ws;
  };

  const updateChartData = (readings) => {
    if (!readings.length) return;
    
    const now = Date.now() / 1000;
    const oneHourAgo = now - 3600;
    const oneHourAhead = now + 3600;
    
    const filteredReadings = readings.filter(r => 
      r.ts >= oneHourAgo && r.ts <= oneHourAhead
    );
    
    const dataToShow = filteredReadings.length > 0 ? filteredReadings : readings.slice(-10);
    
    const labels = dataToShow.map(r => {
      const date = new Date(r.ts * 1000);
      const hours = date.getHours();
      const mins = date.getMinutes();
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    });
    
    const data = dataToShow.map(r => r.soil_raw);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Soil Moisture',
        data,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      need_water: { emoji: '💧', text: "I'm in need of water.", color: '#ef4444' },
      great: { emoji: '🌟', text: "I'm doing great!", color: '#0da271' },
      fine: { emoji: '✅', text: "I'm doing fine.", color: '#3b82f6' },
      cold: { emoji: '🥶', text: "I'm cold.", color: '#60a5fa' },
      hot: { emoji: '🔥', text: "I'm hot.", color: '#f97316' },
      care: { emoji: '🆘', text: "I'm in need of care!", color: '#dc2626' },
      stale: { emoji: '⚠️', text: 'Connection lost.', color: '#6b7280' }
    };
    return configs[status] || { emoji: '❓', text: 'Unknown', color: '#9ca3af' };
  };

  const isStale = () => {
    if (isInitialLoad) return false;
    if (!lastReading?.last_seen) return true;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000); // Changed to 5 minutes for more accurate detection
    const lastSeenTime = new Date(lastReading.last_seen).getTime();
    
    // Only mark as stale if truly no data for 5 minutes
    return lastSeenTime < fiveMinutesAgo;
  };

  const toggleSpecies = () => {
    setSelectedSpecies(prev => prev === 'monstera' ? 'generic-plant' : 'monstera');
  };

  const statusConfig = getStatusConfig(isStale() ? 'stale' : status);

  return {
    plant,
    status,
    lastReading,
    chartData,
    loading,
    selectedSpecies,
    statusConfig,
    toggleSpecies,
    isStale: isStale()
  };
}
