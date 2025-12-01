import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = (file) => {
        setLoading(true);
        setError(null);

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            setLoading(false);
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                setLoading(false);
                if (results.errors.length > 0) {
                    setError('Error parsing CSV file. Please check the format.');
                    console.error(results.errors);
                } else {
                    onDataLoaded(results.data);
                }
            },
            error: (err) => {
                setLoading(false);
                setError('Failed to read file.');
                console.error(err);
            }
        });
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div
            className={`glass-panel ${isDragging ? 'dragging' : ''}`}
            style={{
                padding: '60px',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '40px auto',
                border: isDragging ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                transition: 'all 0.3s ease'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>
                <UploadCloud size={64} />
            </div>

            <h2 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Upload your CSV</h2>
            <p style={{ marginBottom: '30px' }}>Drag and drop your file here, or click to browse</p>

            <input
                type="file"
                id="csvInput"
                accept=".csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />

            <label htmlFor="csvInput" className="glass-button">
                {loading ? 'Processing...' : 'Select File'}
            </label>

            {error && (
                <div style={{
                    marginTop: '20px',
                    color: '#ff453a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
