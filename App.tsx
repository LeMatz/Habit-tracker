
import React, { useState } from 'react';
import { HabitProvider } from './context/HabitContext';
import Layout from './components/Layout';
import Home from './screens/Home';
import Stats from './screens/Stats';
import Gamification from './screens/Gamification';
import Tips from './screens/Tips';
import Settings from './screens/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'stats':
        return <Stats />;
      case 'rewards':
        return <Gamification />;
      case 'tips':
        return <Tips />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <HabitProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </HabitProvider>
  );
};

export default App;
