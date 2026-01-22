import { useState } from 'react';
import TextsList from './components/TextsList';
import TextDetail from './components/TextDetail';
import GradeHistory from './components/GradeHistory';
import { Page } from './types';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('texts');
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);

  const handleSelectText = (id: number) => {
    setSelectedTextId(id);
    setCurrentPage('text-detail');
  };

  const handleBack = () => {
    setSelectedTextId(null);
    setCurrentPage('texts');
  };

  return (
    <div className="app">
      <div className="app-container">
        <nav className="nav-bar">
          <button
            className={`nav-btn ${currentPage === 'texts' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('texts'); setSelectedTextId(null); }}
          >
            Texts
          </button>
          <button
            className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentPage('history')}
          >
            Grade History
          </button>
        </nav>

        <main className="main-content">
          {currentPage === 'texts' && (
            <TextsList onSelectText={handleSelectText} />
          )}
          {currentPage === 'text-detail' && selectedTextId && (
            <TextDetail textId={selectedTextId} onBack={handleBack} />
          )}
          {currentPage === 'history' && (
            <GradeHistory />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
