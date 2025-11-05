import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { Dispatch } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const InvoicingView: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<number[]>([]);

  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://gestion-despachos.onrender.com/api' : 'http://localhost:3002/api');

  // Cargar despachos desde el backend
  const fetchDispatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/dispatches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const formattedData = data.data.map((d: any) => ({
        ...d, 
        materials: typeof d.materials === 'string' ? JSON.parse(d.materials) : d.materials,
        id: Number(d.id),
        userId: Number(d.userId),
        equipmentId: Number(d.equipmentId),
        operatorId: Number(d.operatorId),
        total: Number(d.total)
      }));
      setDispatches(formattedData);
    } catch (error) {
      console.error("Error fetching dispatches:", error);
    }
  }, [API_URL]);

  // Cargar empresas desde el backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/companies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCompanies(data.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
    fetchDispatches();
  }, [API_URL, fetchDispatches]);

  const clients = useMemo(() => Array.from(new Set(dispatches.map(d => d.cliente))), [dispatches]);

  const clientDispatches = useMemo(() => dispatches.filter(d => d.cliente === selectedClient), [dispatches, selectedClient]);

  const handleCheckboxChange = (dispatchId: number) => {
    setSelectedDispatchIds(prev => 
      prev.includes(dispatchId) ? prev.filter(id => id !== dispatchId) : [...prev, dispatchId]
    );
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const selectedData = clientDispatches.filter(d => selectedDispatchIds.includes(d.id));
    const totalFactura = selectedData.reduce((sum, d) => sum + d.total, 0);
    
    // Obtener información de la empresa seleccionada
    const company = companies.find(c => c.id === selectedCompany) || {
      name: 'Empresa no especificada',
      address: '',
      phone: '',
      email: ''
    };

    // Encabezado de la factura
    doc.setFontSize(20);
    doc.text('Factura', 14, 22);
    doc.setFontSize(12);
    doc.text(`Cliente: ${selectedClient}`, 14, 32);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 42);
    
    // Información de la empresa
    doc.setFontSize(14);
    doc.text(company.name, 190, 22, { align: 'right' });
    doc.setFontSize(10);
    if (company.address) doc.text(company.address, 190, 28, { align: 'right' });
    if (company.phone) doc.text(`Tel: ${company.phone}`, 190, 34, { align: 'right' });
    if (company.email) doc.text(company.email, 190, 40, { align: 'right' });

    // Tabla de despachos usando autoTable
    autoTable(doc, {
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
    <Container>
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
            <Col md={6}>
              <Form.Group controlId="companySelector">
                <Form.Label>Seleccione la Empresa que Factura</Form.Label>
                <Form.Select 
                  onChange={(e) => setSelectedCompany(Number(e.target.value))} 
                  value={selectedCompany}
                  disabled={companies.length === 0}
                >
                  <option value={0}>-- Seleccione una Empresa --</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </Form.Select>
                {companies.length === 0 && (
                  <Form.Text className="text-muted">
                    No hay empresas disponibles. Agregue empresas en la sección de Administración.
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {selectedClient && (
            <>
              <h5>Despachos de: <strong>{selectedClient}</strong></h5>
              {clientDispatches.length > 0 ? (
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
              ) : (
                <p>No hay despachos registrados para este cliente.</p>
              )}
              <Button 
                variant="danger"
                onClick={handleGeneratePDF} 
                disabled={selectedDispatchIds.length === 0 || selectedCompany === 0}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Generar Factura PDF
              </Button>
            </>
          )}
          
          {!selectedClient && (
            <div>
              {clients.length > 0 ? (
                <p>Seleccione un cliente del menú desplegable para ver sus despachos y generar una factura.</p>
              ) : (
                <p>No hay clientes con despachos registrados. Cree algunos despachos primero.</p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvoicingView;