import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [data, setData] = useState(null);

  return (
    <div className="container animate-fade-in">
      <header style={{ padding: '40px 0', textAlign: 'center' }}>
        <h1>Guru Metrics</h1>
        <p>Professional Data Analytics & Visualization</p>
      </header>

      <main>
        {!data ? (
          <FileUpload onDataLoaded={setData} />
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
}

export default App;
