import React from 'react';
import { Table, Card, Button } from 'react-bootstrap';
import { Dispatch } from '../types';
import * as XLSX from 'xlsx';

interface Props {
  dispatches: Dispatch[];
}

const DispatchHistory: React.FC<Props> = ({ dispatches }) => {

  const handleExport = () => {
    const worksheetData = dispatches.map(d => ({
      'Nº Despacho': d.despachoNo,
      'Fecha': d.fecha,
      'Hora': d.hora,
      'Cliente': d.cliente,
      'Camión': d.camion,
      'Placa': d.placa,
      'Total (RD$)': d.total,
      'Recibido por': d.recibi,
      'Materiales': d.materials.map(m => `${m.id}: ${m.quantity} m³`).join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despachos");
    XLSX.writeFile(workbook, "HistorialDespachos.xlsx");
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
                <td>{new Date(dispatch.fecha).toLocaleDateString()}</td>
                <td>{dispatch.cliente}</td>
                <td>{dispatch.placa}</td>
                <td>{dispatch.total.toFixed(2)}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2">
                    <i className="bi bi-printer"></i>
                  </Button>
                  <Button variant="danger" size="sm">
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default DispatchHistory;
