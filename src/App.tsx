/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import HealthRecord from './pages/HealthRecord';
import FoodCheck from './pages/FoodCheck';
import HospitalSearch from './pages/HospitalSearch';
import SymptomChecker from './pages/SymptomChecker';
import WalkMap from './pages/WalkMap';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/health" element={<PageWrapper><HealthRecord /></PageWrapper>} />
        <Route path="/food" element={<PageWrapper><FoodCheck /></PageWrapper>} />
        <Route path="/hospital" element={<PageWrapper><HospitalSearch /></PageWrapper>} />
        <Route path="/symptom" element={<PageWrapper><SymptomChecker /></PageWrapper>} />
        <Route path="/walk" element={<PageWrapper><WalkMap /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function WeatherBackground({ isNight, isDashboard }: { isNight: boolean; isDashboard: boolean }) {
  const bgClass = isNight 
    ? 'bg-gradient-to-b from-[#0B1021] via-[#1B2745] to-[#2B3B60]' 
    : 'bg-gradient-to-b from-[#2980B9] via-[#6DD5FA] to-[#87CEEB]';

  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isDashboard ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: 0 }}
    >
      <div className={`absolute inset-0 ${bgClass}`}></div>
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  );
}

export default function App() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    // 6:00 to 17:59 is Light mode, 18:00 to 5:59 is Dark mode
    const night = hour < 6 || hour >= 18;
    setIsNight(night);
    if (night) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-main font-sans selection:bg-gold/30 atmosphere-glow transition-colors duration-500 relative">
        <RouteWatcher isNight={isNight} />
        <div className="relative z-10">
          <AnimatedRoutes />
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}

function RouteWatcher({ isNight }: { isNight: boolean }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  return <WeatherBackground isNight={isNight} isDashboard={isDashboard} />;
}
