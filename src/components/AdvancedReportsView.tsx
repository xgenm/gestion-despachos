import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Row, Col, Badge } from 'react-bootstrap';
import { Dispatch } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  client: string;
  truck: string;
  plate: string;
  employee: string;
  equipment: string;
  operator: string;
  minAmount: number;
  maxAmount: number;
}

const AdvancedReportsView: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    client: '',
    truck: '',
    plate: '',
    employee: '',
    equipment: '',
    operator: '',
    minAmount: 0,
    maxAmount: 999999
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

  // Cargar despachos, empleados, equipos y operarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [dispatchRes, employeeRes, equipmentRes, operatorRes] = await Promise.all([
          fetch(`${API_URL}/dispatches`, { headers }),
          fetch(`${API_URL}/auth/users`, { headers }),
          fetch(`${API_URL}/equipment`, { headers }),
          fetch(`${API_URL}/operators`, { headers })
        ]);

        if (dispatchRes.ok) {
          const data = await dispatchRes.json();
          setDispatches(data.data || []);
          setFilteredDispatches(data.data || []);
        }

        if (employeeRes.ok) {
          const data = await employeeRes.json();
          setEmployees(data);
        }

        if (equipmentRes.ok) {
          const data = await equipmentRes.json();
          setEquipment(data.data || []);
        }

        if (operatorRes.ok) {
          const data = await operatorRes.json();
          setOperators(data.data || []);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = dispatches;

    if (filters.dateFrom) {
      filtered = filtered.filter(d => new Date(d.fecha) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(d => new Date(d.fecha) <= new Date(filters.dateTo));
    }

    if (filters.client) {
      filtered = filtered.filter(d => d.cliente.toLowerCase().includes(filters.client.toLowerCase()));
    }

    if (filters.truck) {
      filtered = filtered.filter(d => d.camion && d.camion.toLowerCase().includes(filters.truck.toLowerCase()));
    }

    if (filters.plate) {
      filtered = filtered.filter(d => d.placa && d.placa.toLowerCase().includes(filters.plate.toLowerCase()));
    }

    if (filters.employee) {
      filtered = filtered.filter(d => d.userId && d.userId.toString() === filters.employee);
    }

    if (filters.equipment) {
      filtered = filtered.filter(d => d.equipmentId && d.equipmentId.toString() === filters.equipment);
    }

    if (filters.operator) {
      filtered = filtered.filter(d => d.operatorId && d.operatorId.toString() === filters.operator);
    }

    if (filters.minAmount > 0) {
      filtered = filtered.filter(d => d.total >= filters.minAmount);
    }

    if (filters.maxAmount < 999999) {
      filtered = filtered.filter(d => d.total <= filters.maxAmount);
    }

    setFilteredDispatches(filtered);
  }, [filters, dispatches]);

  const handleFilterChange = (field: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      client: '',
      truck: '',
      plate: '',
      employee: '',
      equipment: '',
      operator: '',
      minAmount: 0,
      maxAmount: 999999
    });
  };

  const exportToExcel = () => {
    const data = filteredDispatches.map(d => ({
      'Nº Despacho': d.despachoNo,
      'Fecha': new Date(d.fecha).toLocaleDateString(),
      'Cliente': d.cliente,
      'Camión': d.camion,
      'Placa': d.placa,
      'Color': d.color,
      'Ficha': d.ficha,
      'Recibido por': d.recibido,
      'Empleado': d.userName || 'N/A',
      'Equipo': d.equipmentName || 'N/A',
      'Operario': d.operatorName || 'N/A',
      'Total (RD$)': d.total.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `Reporte_Despachos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  const calculateTotals = () => {
    const sum = filteredDispatches.reduce((acc, d) => acc + d.total, 0);
    const count = filteredDispatches.length;
    const avg = count > 0 ? sum / count : 0;

    return { sum, count, avg };
  };

  const { sum, count, avg } = calculateTotals();

  if (loading) {
    return <div className="text-center mt-4"><p>Cargando datos...</p></div>;
  }

  return (
    <div>
      <h2 className="mb-4">Reportes Avanzados</h2>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filtros de Búsqueda</h5>
          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Filtrar por cliente"
                  value={filters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Camión</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Filtrar por camión"
                  value={filters.truck}
                  onChange={(e) => handleFilterChange('truck', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Placa</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Filtrar por placa"
                  value={filters.plate}
                  onChange={(e) => handleFilterChange('plate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Empleado</Form.Label>
                <Form.Select
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username || emp.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Equipo</Form.Label>
                <Form.Select
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Operario</Form.Label>
                <Form.Select
                  value={filters.operator}
                  onChange={(e) => handleFilterChange('operator', e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {operators.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Monto Mínimo (RD$)</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Monto Máximo (RD$)</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || 999999)}
                />
              </Form.Group>
            </Col>
            <Col md={12} lg={6} className="mb-3 d-flex gap-2 align-items-end">
              <Button variant="warning" onClick={resetFilters}>
                Limpiar Filtros
              </Button>
              <Button variant="success" onClick={exportToExcel}>
                Exportar a Excel
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Despachos Encontrados</h6>
              <h3>{count}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Total General</h6>
              <h3>RD$ {sum.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Promedio por Despacho</h6>
              <h3>RD$ {avg.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Carga Promedio</h6>
              <h3>{count > 0 ? ((sum / count) / 10).toFixed(0) : 0} m³</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Resultados */}
      <Card>
        <Card.Body>
          <h5 className="mb-3">Resultados ({count} despachos)</h5>
          {filteredDispatches.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Nº Despacho</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Camión</th>
                    <th>Placa</th>
                    <th>Empleado</th>
                    <th>Equipo</th>
                    <th>Operario</th>
                    <th>Total (RD$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispatches.map(dispatch => (
                    <tr key={dispatch.id}>
                      <td><Badge bg="primary">{dispatch.despachoNo}</Badge></td>
                      <td>{new Date(dispatch.fecha).toLocaleDateString()}</td>
                      <td>{dispatch.cliente}</td>
                      <td>{dispatch.camion}</td>
                      <td>{dispatch.placa}</td>
                      <td>{dispatch.userName || 'N/A'}</td>
                      <td>{dispatch.equipmentName || 'N/A'}</td>
                      <td>{dispatch.operatorName || 'N/A'}</td>
                      <td className="text-end"><strong>{dispatch.total.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted text-center mt-4">No hay despachos que coincidan con los filtros aplicados.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdvancedReportsView;
