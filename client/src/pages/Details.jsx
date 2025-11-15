// REQ: BR-UX-002 (Explain status changes)
// REQ: FR-UI-002 (Details view explains status changes with timestamps)

import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import DetailsDesktop from './Details/DetailsDesktop';
import DetailsMobile from './Details/DetailsMobile';

function Details() {
  const [plant, setPlant] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isTVMode, isMobile } = useDeviceDetection();

  useEffect(() => {
    loadPlantData();
  }, []);

  const loadPlantData = async () => {
    try {
      const selectedPlant = JSON.parse(localStorage.getItem('selectedPlant'));
      setPlant(selectedPlant);
      
      // Fetch node details
      const response = await fetch('/api/nodes/pot-01');
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      need_water: { emoji: '💧', text: "I'm in need of water.", color: '#ef4444' },
      great: { emoji: '🌟', text: "I'm doing great!", color: '#10b981' },
      fine: { emoji: '✅', text: "I'm doing fine.", color: '#3b82f6' },
      cold: { emoji: '🥶', text: "I'm cold.", color: '#60a5fa' },
      hot: { emoji: '🔥', text: "I'm hot.", color: '#f97316' },
      care: { emoji: '🆘', text: "I'm in need of care!", color: '#dc2626' },
      stale: { emoji: '⚠️', text: 'Connection lost.', color: '#6b7280' }
    };
    return configs[status] || { emoji: '❓', text: 'Unknown', color: '#9ca3af' };
  };

  const status = details?.status || 'unknown';
  const statusConfig = getStatusConfig(status);
  const props = { plant, details, loading, isTVMode, status, statusConfig };

  if (isMobile) return <DetailsMobile {...props} />;
  return <DetailsDesktop {...props} />;
}

export default Details;
