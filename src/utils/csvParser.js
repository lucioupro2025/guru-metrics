import Papa from 'papaparse';

/**
 * Custom parser for "REPORTE DE CIERRE DE CAJA" format
 */
export const parseCajaReport = (csvContent) => {
    const results = Papa.parse(csvContent, {
        header: false,
        skipEmptyLines: false // Keep empty lines to detect sections if needed, though we'll check content
    });
    
    const rows = results.data;

    // Check if it's actually a Caja Report
    if (!rows.length || !String(rows[0][0]).includes("REPORTE DE CIERRE DE CAJA")) {
        return null;
    }

    const result = {
        type: 'caja_report',
        header: String(rows[0][0]),
        info: {},
        metrics: {},
        payments: [],
        arqueo: {},
        ranking: [],
        repartidores: [],
        orders: [],
        totalVentasBrutas: 0
    };

    let currentSection = 'info';

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

        const firstCell = String(row[0]).trim();

        // Section Detection
        const cellUpper = firstCell.toUpperCase();
        
        if (cellUpper.includes("TOTAL VENDIDO POR")) {
            currentSection = 'payments';
            i++; // Skip header "Metodo","Total"
            continue;
        }
        if (cellUpper.includes("ARQUEO DE CAJA")) {
            currentSection = 'arqueo';
            continue;
        }
        if (cellUpper.includes("RANKING DE PRODUCTOS VENDIDOS")) {
            currentSection = 'ranking';
            i++; // Skip header "Producto","Cantidad Vendida","Recaudacion Estimada"
            continue;
        }
        if (cellUpper.includes("DETALLE DE PEDIDOS")) {
            currentSection = 'orders';
            i++; // Skip header "ID","Cliente","Monto","Metodo","Estado","Repartidor","Factura Nro","CAE"
            continue;
        }
        if (cellUpper.includes("RENDIMIENTO DE REPARTIDORES")) {
            currentSection = 'repartidores';
            i++; // Skip header "Repartidor","Envios Realizados"
            continue;
        }
        if (cellUpper.includes("DESEMPE") || cellUpper.includes("TRICAS DE")) {
            currentSection = 'metrics';
            continue;
        }

        // Parse sections
        if (currentSection === 'info' || currentSection === 'metrics') {
            if (row.length >= 2) {
                const key = String(row[0]).trim();
                const value = String(row[1]).trim();
                if (currentSection === 'info') result.info[key] = value;
                else result.metrics[key] = value;
            }
        } else if (currentSection === 'payments') {
            if (firstCell === "TOTAL VENTAS BRUTAS") {
                result.totalVentasBrutas = parseFloat(row[1]) || 0;
            } else if (row.length >= 2) {
                result.payments.push({
                    metodo: firstCell,
                    total: parseFloat(row[1]) || 0
                });
            }
        } else if (currentSection === 'arqueo') {
            if (row.length >= 2) {
                const val = parseFloat(row[1]);
                result.arqueo[firstCell] = isNaN(val) ? row[1] : val;
            }
        } else if (currentSection === 'ranking') {
            if (row.length >= 3) {
                result.ranking.push({
                    producto: firstCell,
                    cantidad: parseInt(row[1]) || 0,
                    recaudacion: parseFloat(row[2]) || 0
                });
            }
        } else if (currentSection === 'repartidores') {
            if (row.length >= 2) {
                result.repartidores.push({
                    repartidor: firstCell,
                    envios: parseInt(row[1]) || 0
                });
            }
        } else if (currentSection === 'orders') {
            if (row.length >= 3) {
                result.orders.push({
                    ID: firstCell,
                    Cliente: String(row[1]),
                    Monto: parseFloat(row[2]) || 0,
                    Metodo: String(row[3] || ''),
                    Estado: String(row[4] || ''),
                    Repartidor: String(row[5] || ''),
                    Factura: String(row[6] || ''),
                    CAE: String(row[7] || '')
                });
            }
        }
    }

    // Post-processing for Caja Report
    if (result.type === 'caja_report') {
        // The original "Diferencia" in CSV typically compares Real vs Expected Cash,
        // but users often declare TOTAL money (Cash + Transfers) in "Total Real Declarado".
        // The true balance is Total Real Declarado minus Total Ventas Brutas.
        const totalReal = parseFloat(result.arqueo['Total Real Declarado']);
        if (!isNaN(totalReal) && result.totalVentasBrutas) {
            result.arqueo.Diferencia = totalReal - result.totalVentasBrutas;
        }
    }

    return result;
};

