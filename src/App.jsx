import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [data, setData] = useState(null);

  return (
    <div className="app-wrapper">
      {/* Background blobs for premium feel */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="page-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
            <img
              src={`${import.meta.env.BASE_URL}Logo-guruwe-p.png`}
              alt="GuruWeb Logo"
              style={{ height: '60px', objectFit: 'contain' }}
            />
            <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }}></div>
            <h1>Guru Metrics</h1>
          </div>
          <p>Plataforma de inteligencia para análisis profesional de CSV</p>
        </motion.header>

        <main>
          <AnimatePresence mode="wait">
            {!data ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <FileUpload onDataLoaded={setData} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Dashboard data={data} onReset={() => setData(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
