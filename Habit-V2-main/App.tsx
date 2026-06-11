import React, { useState, useEffect } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import Layout from './components/Layout';
import Home from './screens/Home';
import Stats from './screens/Stats';
import Gamification from './screens/Gamification';
import Settings from './screens/Settings';
import Tasks from './screens/Tasks';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { settings } = useHabits();

  // Sincronización de Modo Oscuro
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  // Sincronización de Tamaño de Fuente
  useEffect(() => {
    if (settings.fontSize === 'large') {
      document.documentElement.classList.add('font-large');
    } else {
      document.documentElement.classList.remove('font-large');
    }
  }, [settings.fontSize]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'tasks': return <Tasks />;
      case 'stats': return <Stats />;
      case 'rewards': return <Gamification />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
};

export default App;