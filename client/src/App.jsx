// REQ: Main App component with routing

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Details from './pages/Details'
import History from './pages/History'
import Onboarding from './pages/Onboarding'
import './App.css'

function App() {
  // Check if user has completed onboarding
  const hasSelectedPlant = localStorage.getItem('selectedPlant')

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={hasSelectedPlant ? <Home /> : <Navigate to="/onboarding" />} 
          />
          <Route path="/details" element={<Details />} />
          <Route path="/history" element={<History />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
