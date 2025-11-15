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

  const props = { plant, details, loading, isTVMode };

  if (isMobile) return <DetailsMobile {...props} />;
  return <DetailsDesktop {...props} />;
}

export default Details;
