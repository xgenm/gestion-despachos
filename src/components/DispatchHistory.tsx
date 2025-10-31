import React, { useState } from 'react';
import { Table, Card, Button } from 'react-bootstrap';
import { Dispatch } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import DispatchDetailModal from './DispatchDetailModal';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  dispatches: Dispatch[];
  onDelete?: (id: number) => void;
}

// Función para obtener el nombre del material
const getMaterialName = (id: string) => {
  const materials: Record<string, string> = {
    'arenaLavada': 'Arena lavada',
    'arenaSinLavar': 'Arena sin lavar',
    'grava': 'Grava',
    'subBase': 'Sub-base',
    'gravaArena': 'Grava Arena',
    'granzote': 'Granzote',
    'gravillin': 'Gravillín',
    'cascajoGris': 'Cascajo gris (Relleno)',
    'base': 'Base',
    'rellenoAmarillento': 'Relleno amarillento'
  };
  return materials[id] || id;
};

// Función para obtener el precio del material
const getMaterialPrice = (id: string) => {
  const prices: Record<string, number> = {
    'arenaLavada': 1500,
    'arenaSinLavar': 1200,
    'grava': 1800,
    'subBase': 1000,
    'gravaArena': 1600,
    'granzote': 2000,
    'gravillin': 2200,
    'cascajoGris': 800,
    'base': 1100,
    'rellenoAmarillento': 700
  };
  return prices[id] || 0;
};

const DispatchHistory: React.FC<Props> = ({ dispatches, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const { isAdmin } = useAuth(); // Obtener rol del usuario

  const handleExport = () => {
    // Crear datos detallados para exportar
    const worksheetData = dispatches.map(d => {
      // Calcular detalles de materiales
      const materialDetails = d.materials.map(material => {
        const materialName = getMaterialName(material.id);
        const price = getMaterialPrice(material.id);
        const total = price * material.quantity;
        return `${materialName}: ${material.quantity} m³ (RD$ ${price.toFixed(2)} x ${material.quantity} = RD$ ${total.toFixed(2)})`;
      }).join('\n');
      
      return {
        'Nº DESPACHO': d.despachoNo,
        'FECHA': d.fecha,
        'HORA': d.hora,
        'CLIENTE': d.cliente.toUpperCase(),
        'CAMIÓN': d.camion || 'NO ESPECIFICADO',
        'PLACA': d.placa || 'NO ESPECIFICADO',
        'COLOR': d.color || 'NO ESPECIFICADO',
        'FICHA': d.ficha || 'NO ESPECIFICADO',
        'MATERIALES': materialDetails,
        'TOTAL (RD$)': d.total.toFixed(2),
        'RECIBIDO POR': d.recibido.toUpperCase(),
        'ATENDIDO POR': d.userName || 'NO ESPECIFICADO',
        'EQUIPO': d.equipmentName || 'NO ESPECIFICADO',
        'OPERARIO': d.operatorName || 'NO ESPECIFICADO',
        'CELULAR': d.celular || 'NO ESPECIFICADO'
      };
    });

    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Aplicar formato a la hoja
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Establecer ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // Nº DESPACHO
      { wch: 12 }, // FECHA
      { wch: 10 }, // HORA
      { wch: 25 }, // CLIENTE
      { wch: 15 }, // CAMIÓN
      { wch: 12 }, // PLACA
      { wch: 12 }, // COLOR
      { wch: 12 }, // FICHA
      { wch: 50 }, // MATERIALES
      { wch: 15 }, // TOTAL
      { wch: 20 }, // RECIBIDO POR
      { wch: 20 }, // ATENDIDO POR
      { wch: 15 }, // EQUIPO
      { wch: 15 }, // OPERARIO
      { wch: 15 }  // CELULAR
    ];
    
    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DESPACHOS");
    
    // Aplicar estilos a los encabezados
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // Aplicar formato a las celdas de totales
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const address = XLSX.utils.encode_cell({ r: R, c: 9 }); // Columna de TOTAL
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E7E6E6" } },
        alignment: { horizontal: "right" }
      };
    }
    
    // Guardar archivo
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, "HISTORIAL_DESPACHOS.xlsx");
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  const handleDelete = async (id: number) => {
    if (onDelete) {
      onDelete(id);
    } else {
      // Implementación por defecto si no se proporciona onDelete
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
      try {
        const response = await fetch(`${API_URL}/dispatches/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar el despacho');
        }
        
        // Recargar la página para reflejar los cambios
        window.location.reload();
      } catch (error) {
        console.error("Error eliminando despacho:", error);
        alert("Error al eliminar el despacho");
      }
    }
  };

  const handleViewDetails = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setShowModal(true);
  };

  const handlePrintPDF = (dispatch: Dispatch) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Encabezado
    doc.setFontSize(16);
    doc.text('Mina "SALUDALSA"', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Código 6700', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(`Despacho #${dispatch.despachoNo}`, 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Información del despacho
    doc.setFontSize(10);
    const info = [
      `Fecha: ${new Date(dispatch.fecha).toLocaleDateString()}`,
      `Hora: ${dispatch.hora}`,
      `Cliente: ${dispatch.cliente}`,
      `Recibido por: ${dispatch.recibido}`,
      `Camión: ${dispatch.camion || 'No especificado'}`,
      `Placa: ${dispatch.placa || 'No especificado'}`,
      `Color: ${dispatch.color || 'No especificado'}`,
      `Ficha: ${dispatch.ficha || 'No especificado'}`
    ];
    
    info.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Tabla de materiales
    const tableData = dispatch.materials.map(material => [
      getMaterialName(material.id),
      material.quantity.toString(),
      `RD$ ${getMaterialPrice(material.id).toFixed(2)}`,
      `RD$ ${(getMaterialPrice(material.id) * material.quantity).toFixed(2)}`
    ]);

    tableData.push([
      'TOTAL',
      '',
      '',
      `RD$ ${dispatch.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      head: [['Material', 'Cantidad (m³)', 'Precio Unitario', 'Total']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      margin: { left: 20, right: 20 },
      didDrawPage: (data: any) => {
        if (data.pageCount > 1) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(`Página ${data.pageNumber}`, pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }
      }
    });

    // Guardar PDF
    doc.save(`Despacho_${dispatch.despachoNo}.pdf`);
  };

  const handlePrint = (dispatch: Dispatch) => {
    // Crear una ventana de impresión
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Despacho #${dispatch.despachoNo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .info-section { margin-bottom: 20px; }
              .materials-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .materials-table th, .materials-table td { border: 1px solid #000; padding: 8px; text-align: left; }
              .total-row { font-weight: bold; }
              .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Mina "SALUDALSA"</h1>
              <h2>Código 6700</h2>
              <h3>Despacho #${dispatch.despachoNo}</h3>
            </div>
            
            <div class="info-section">
              <p><strong>Fecha:</strong> ${new Date(dispatch.fecha).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> ${dispatch.hora}</p>
              <p><strong>Cliente:</strong> ${dispatch.cliente}</p>
              <p><strong>Recibido por:</strong> ${dispatch.recibido}</p>
            </div>
            
            <div class="info-section">
              <p><strong>Camión:</strong> ${dispatch.camion || 'No especificado'}</p>
              <p><strong>Placa:</strong> ${dispatch.placa || 'No especificado'}</p>
              <p><strong>Color:</strong> ${dispatch.color || 'No especificado'}</p>
              <p><strong>Ficha:</strong> ${dispatch.ficha || 'No especificado'}</p>
            </div>
            
            <table class="materials-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad (m³)</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${dispatch.materials.map(material => {
                  const materialName = getMaterialName(material.id);
                  const price = getMaterialPrice(material.id);
                  const total = price * material.quantity;
                  return `
                    <tr>
                      <td>${materialName}</td>
                      <td>${material.quantity}</td>
                      <td>RD$ ${price.toFixed(2)}</td>
                      <td>RD$ ${total.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total General:</td>
                  <td>RD$ ${dispatch.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="signature-section">
              <div>
                <p>___________________________</p>
                <p>Firma del Cliente</p>
              </div>
              <div>
                <p>___________________________</p>
                <p>Firma del Responsable</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Historial de Despachos</Card.Title>
          <Button variant="success" onClick={handleExport} disabled={dispatches.length === 0}>
            <i className="bi bi-file-earmark-excel me-2"></i>
            Exportar a Excel
          </Button>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nº Despacho</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Placa</th>
              <th>Total (RD$)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map(dispatch => (
              <tr key={dispatch.id}>
                <td>{dispatch.despachoNo}</td>
                <td>{formatDate(dispatch.fecha)}</td>
                <td>{dispatch.cliente}</td>
                <td>{dispatch.placa}</td>
                <td>{dispatch.total.toFixed(2)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Button variant="primary" size="sm" className="me-1" title="Ver detalles" onClick={() => handleViewDetails(dispatch)}>
                    Ver
                  </Button>
                  <Button variant="warning" size="sm" className="me-1" title="Imprimir" onClick={() => handlePrint(dispatch)}>
                    Imprimir
                  </Button>
                  <Button variant="info" size="sm" className="me-1" title="Descargar PDF" onClick={() => handlePrintPDF(dispatch)}>
                    PDF
                  </Button>
                  {/* Solo mostrar botón de eliminar a administradores */}
                  {isAdmin && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(dispatch.id)}>
                      Eliminar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>

      {/* Modal para ver detalles del despacho */}
      <DispatchDetailModal 
        dispatch={selectedDispatch}
        show={showModal}
        onHide={() => setShowModal(false)}
        onPrint={handlePrint}
      />
    </Card>
  );
};

export default DispatchHistory;