import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { usePlantData } from '../hooks/usePlantData';
import HomeDesktop from './Home/HomeDesktop';
import HomeMobile from './Home/HomeMobile';
import HomeTV from './Home/HomeTV';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function Home() {
  const { isTVMode, isMobile } = useDeviceDetection();
  const plantData = usePlantData();
  
  if (plantData.loading) {
    return <LoadingSpinner fullScreen text="Loading plant data..." />;
  }
  
  if (isTVMode) return <HomeTV {...plantData} />;
  if (isMobile) return <HomeMobile {...plantData} />;
  return <HomeDesktop {...plantData} />;
}

export default Home;
