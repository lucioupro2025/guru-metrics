import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { parseCajaReport } from '../utils/csvParser';

const FileUpload = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
            setError('Por favor, sube un archivo CSV válido.');
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const cajaData = parseCajaReport(content);

            if (cajaData) {
                setSuccess(true);
                setTimeout(() => {
                    onDataLoaded(cajaData);
                }, 800);
            } else {
                // Fallback to standard CSV parsing
                Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            setError('Error al analizar el archivo CSV. Por favor, verifica el formato.');
                            setLoading(false);
                            console.error(results.errors);
                        } else {
                            setSuccess(true);
                            setTimeout(() => {
                                onDataLoaded(results.data);
                            }, 800);
                        }
                    },
                    error: (err) => {
                        setLoading(false);
                        setError('Error al leer el archivo.');
                        console.error(err);
                    }
                });
            }
        };
        reader.onerror = () => {
            setLoading(false);
            setError('Error al leer el archivo.');
        };
        reader.readAsText(file);
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel ${isDragging ? 'dragging' : ''}`}
            style={{
                padding: '80px 40px',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto',
                border: isDragging ? '2px dashed var(--accent-color)' : '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
                    >
                        {success ? (
                            <>
                                <CheckCircle2 size={72} color="#30d158" />
                                <h3>¡Datos Analizados!</h3>
                                <p>Preparando tu tablero...</p>
                            </>
                        ) : (
                            <>
                                <Loader2 size={72} className="animate-spin" color="var(--accent-color)" />
                                <h3>Analizando Datos</h3>
                                <p>Extrayendo métricas de tu CSV...</p>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                padding: '24px',
                                background: 'rgba(0, 118, 255, 0.1)',
                                borderRadius: '30px',
                                color: 'var(--accent-color)'
                            }}>
                                <UploadCloud size={48} />
                            </div>
                        </div>

                        <h2>Sube tu conjunto de datos</h2>
                        <p style={{ maxWidth: '400px', margin: '12px auto 32px' }}>
                            Analiza reportes de ventas, datos de clientes o cualquier métrica.
                            Arrastra y suelta tu CSV aquí.
                        </p>

                        <input
                            type="file"
                            id="csvInput"
                            accept=".csv"
                            onChange={handleFileInput}
                            style={{ display: 'none' }}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <label htmlFor="csvInput" className="glass-button">
                                Seleccionar Archivo
                            </label>

                            <button
                                className="glass-button secondary-button"
                                onClick={() => {
                                    // Could load sample data here
                                    setError("¡Función de datos de ejemplo próximamente!");
                                }}
                            >
                                Usar Datos de Ejemplo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginTop: '24px',
                        color: '#ff453a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        background: 'rgba(255, 69, 58, 0.1)',
                        borderRadius: '12px'
                    }}
                >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FileUpload;
