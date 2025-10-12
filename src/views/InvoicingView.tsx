import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { Dispatch } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extender la interfaz de jsPDF para incluir autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface Props {
  dispatches: Dispatch[];
}

const InvoicingView: React.FC<Props> = ({ dispatches }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<string[]>([]);

  const clients = useMemo(() => Array.from(new Set(dispatches.map(d => d.cliente))), [dispatches]);

  const clientDispatches = useMemo(() => dispatches.filter(d => d.cliente === selectedClient), [dispatches, selectedClient]);

  const handleCheckboxChange = (dispatchId: string) => {
    setSelectedDispatchIds(prev => 
      prev.includes(dispatchId) ? prev.filter(id => id !== dispatchId) : [...prev, dispatchId]
    );
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const selectedData = clientDispatches.filter(d => selectedDispatchIds.includes(d.id));
    const totalFactura = selectedData.reduce((sum, d) => sum + d.total, 0);

    // Encabezado de la factura
    doc.setFontSize(20);
    doc.text('Factura', 14, 22);
    doc.setFontSize(12);
    doc.text(`Cliente: ${selectedClient}`, 14, 32);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 42);

    doc.setFontSize(10);
    doc.text('Mina "SALUDALSA" (CÓDIGO 6700)', 190, 22, { align: 'right' });
    doc.text('San Cristobal (RD)', 190, 28, { align: 'right' });

    // Tabla de despachos
    doc.autoTable({
      startY: 50,
      head: [['Nº Despacho', 'Fecha', 'Placa', 'Total (RD$)']],
      body: selectedData.map(d => [d.despachoNo, new Date(d.fecha).toLocaleDateString(), d.placa, d.total.toFixed(2)]),
      foot: [['Total General', '', '', totalFactura.toFixed(2)]],
      theme: 'grid',
      footStyles: { fontStyle: 'bold' },
    });

    doc.save(`Factura_${selectedClient.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>Generación de Facturas</Card.Title>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="clientSelector">
              <Form.Label>Seleccione un Cliente</Form.Label>
              <Form.Select onChange={(e) => { setSelectedClient(e.target.value); setSelectedDispatchIds([]); }} value={selectedClient}>
                <option value="">-- Seleccione --</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {selectedClient && (
          <>
            <h5>Despachos de: <strong>{selectedClient}</strong></h5>
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Sel.</th>
                  <th>Nº Despacho</th>
                  <th>Fecha</th>
                  <th>Total (RD$)</th>
                </tr>
              </thead>
              <tbody>
                {clientDispatches.map(dispatch => (
                  <tr key={dispatch.id}>
                    <td className="text-center">
                      <Form.Check 
                        type="checkbox" 
                        checked={selectedDispatchIds.includes(dispatch.id)}
                        onChange={() => handleCheckboxChange(dispatch.id)}
                      />
                    </td>
                    <td>{dispatch.despachoNo}</td>
                    <td>{new Date(dispatch.fecha).toLocaleDateString()}</td>
                    <td>{dispatch.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button 
              variant="danger"
              onClick={handleGeneratePDF} 
              disabled={selectedDispatchIds.length === 0}
            >
              <i className="bi bi-file-earmark-pdf me-2"></i>
              Generar Factura PDF
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default InvoicingView;