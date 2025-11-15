// REQ: BR-UX-004 (Charts should show trends cleanly)
// REQ: FR-UI-003 (History view with 24h and 7d charts)

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import HistoryDesktop from './History/HistoryDesktop';
import HistoryMobile from './History/HistoryMobile';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

function History() {
  const [plant, setPlant] = useState(null);
  const [range, setRange] = useState('24h');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isTVMode, isMobile } = useDeviceDetection();

  useEffect(() => {
    loadPlantData();
    loadHistoryData(range);
  }, [range]);

  const loadPlantData = () => {
    const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
    setPlant(selectedPlant);
  };

  const loadHistoryData = async (timeRange) => {
    try {
      const response = await fetch('/api/history?device_id=pot-01&range=' + timeRange);
      if (response.ok) {
        const data = await response.json();
        updateChartData(data.readings || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (readings) => {
    if (!readings.length) return;
    
    const labels = readings.map(r => {
      const date = new Date(r.ts * 1000);
      if (range === '24h') {
        return date.getHours() + ':00';
      } else {
        return (date.getMonth() + 1) + '/' + date.getDate();
      }
    });
    
    const moistureData = readings.map(r => r.soil_raw);
    
    setChartData({
      labels,
      datasets: [{
        label: 'Soil Moisture',
        data: moistureData,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4
      }]
    });
  };

  const props = { plant, range, setRange, chartData, loading, isTVMode };

  if (isMobile) return <HistoryMobile {...props} />;
  return <HistoryDesktop {...props} />;
}

export default History;
