import React, { useState, useMemo } from 'react';
import { Card, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { Dispatch } from '../types';
import * as XLSX from 'xlsx';

interface Props {
  dispatches: Dispatch[];
  companies: { id: number; name: string }[];
}

const AdvancedReports: React.FC<Props> = ({ dispatches, companies }) => {
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  });
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'client'>('day');

  // Filtrar despachos
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(dispatch => {
      if (selectedCompany > 0 && dispatch.userId !== selectedCompany) return false;
      if (dateFilter.from && dispatch.fecha < dateFilter.from) return false;
      if (dateFilter.to && dispatch.fecha > dateFilter.to) return false;
      return true;
    });
  }, [dispatches, selectedCompany, dateFilter]);

  // Agrupar datos
  const groupedData = useMemo(() => {
    if (groupBy === 'day') {
      return filteredDispatches.reduce((acc: Record<string, Dispatch[]>, dispatch) => {
        const day = dispatch.fecha;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(dispatch);
        return acc;
      }, {});
    } else if (groupBy === 'month') {
      return filteredDispatches.reduce((acc: Record<string, Dispatch[]>, dispatch) => {
        const month = dispatch.fecha.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(dispatch);
        return acc;
      }, {});
    } else {
      // groupBy === 'client'
      return filteredDispatches.reduce((acc: Record<string, Dispatch[]>, dispatch) => {
        const client = dispatch.cliente || 'Sin cliente';
        if (!acc[client]) {
          acc[client] = [];
        }
        acc[client].push(dispatch);
        return acc;
      }, {});
    }
  }, [filteredDispatches, groupBy]);

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheetData = Object.keys(groupedData).map(key => {
      const groupDispatches = groupedData[key];
      const total = groupDispatches.reduce((sum, d) => sum + d.total, 0);
      
      if (groupBy === 'day') {
        return {
          'Fecha': key,
          'Cantidad de Despachos': groupDispatches.length,
          'Total Facturado': total.toFixed(2)
        };
      } else if (groupBy === 'month') {
        return {
          'Mes': key,
          'Cantidad de Despachos': groupDispatches.length,
          'Total Facturado': total.toFixed(2)
        };
      } else {
        // groupBy === 'client'
        const ultimoDespacho = groupDispatches.length > 0 
          ? new Date(Math.max(...groupDispatches.map(d => new Date(d.fecha).getTime()))).toLocaleDateString()
          : 'N/A';
        
        return {
          'Cliente': key,
          'Cantidad de Despachos': groupDispatches.length,
          'Total Facturado': total.toFixed(2),
          'Último Despacho': ultimoDespacho
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    
    let sheetName = '';
    if (groupBy === 'day') sheetName = 'Despachos_por_Dia';
    else if (groupBy === 'month') sheetName = 'Despachos_por_Mes';
    else sheetName = 'Despachos_por_Cliente';
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `Reporte_${sheetName}.xlsx`);
  };

  // Agrupar por cliente para la tabla de clientes
  const groupedByClient = useMemo(() => {
    return filteredDispatches.reduce((acc: Record<string, Dispatch[]>, dispatch) => {
      const client = dispatch.cliente || 'Sin cliente';
      if (!acc[client]) {
        acc[client] = [];
      }
      acc[client].push(dispatch);
      return acc;
    }, {});
  }, [filteredDispatches]);

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>Reportes Avanzados</span>
          <Button variant="success" onClick={exportToExcel} disabled={Object.keys(groupedData).length === 0}>
            <i className="bi bi-file-earmark-excel me-2"></i>
            Exportar a Excel
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Filtros */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Empresa</Form.Label>
              <Form.Select 
                value={selectedCompany} 
                onChange={(e) => setSelectedCompany(Number(e.target.value))}
              >
                <option value={0}>Todas las empresas</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Fecha Desde</Form.Label>
              <Form.Control 
                type="date" 
                value={dateFilter.from} 
                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Fecha Hasta</Form.Label>
              <Form.Control 
                type="date" 
                value={dateFilter.to} 
                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button 
              variant="secondary" 
              onClick={() => setDateFilter({ from: '', to: '' })}
            >
              Limpiar
            </Button>
          </Col>
        </Row>

        {/* Selector de agrupación */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Agrupar por:</Form.Label>
              <Form.Select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'month' | 'client')}
              >
                <option value="day">Día</option>
                <option value="month">Mes</option>
                <option value="client">Cliente</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Tabla de resultados */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {groupBy === 'day' && (
                <>
                  <th>Fecha</th>
                  <th>Cantidad de Despachos</th>
                  <th>Total Facturado</th>
                </>
              )}
              {groupBy === 'month' && (
                <>
                  <th>Mes</th>
                  <th>Cantidad de Despachos</th>
                  <th>Total Facturado</th>
                </>
              )}
              {groupBy === 'client' && (
                <>
                  <th>Cliente</th>
                  <th>Cantidad de Despachos</th>
                  <th>Total Facturado</th>
                  <th>Último Despacho</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedData).map(key => {
              const groupDispatches = groupedData[key];
              const total = groupDispatches.reduce((sum, d) => sum + d.total, 0);
              
              if (groupBy === 'day') {
                return (
                  <tr key={key}>
                    <td>{new Date(key).toLocaleDateString()}</td>
                    <td>{groupDispatches.length}</td>
                    <td>{total.toFixed(2)}</td>
                  </tr>
                );
              } else if (groupBy === 'month') {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{groupDispatches.length}</td>
                    <td>{total.toFixed(2)}</td>
                  </tr>
                );
              } else {
                // groupBy === 'client'
                const ultimoDespacho = groupDispatches.length > 0 
                  ? new Date(Math.max(...groupDispatches.map(d => new Date(d.fecha).getTime()))).toLocaleDateString()
                  : 'N/A';
                
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{groupDispatches.length}</td>
                    <td>{total.toFixed(2)}</td>
                    <td>{ultimoDespacho}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </Table>

        {/* Tabla de clientes */}
        <h5 className="mt-4">Resumen por Clientes</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total Despachos</th>
              <th>Total Facturado</th>
              <th>Último Despacho</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedByClient).map(clientName => {
              const clientDispatches = groupedByClient[clientName];
              const totalFacturado = clientDispatches.reduce((sum, d) => sum + d.total, 0);
              const ultimoDespacho = clientDispatches.length > 0 
                ? new Date(Math.max(...clientDispatches.map(d => new Date(d.fecha).getTime()))).toLocaleDateString()
                : 'N/A';
              
              return (
                <tr key={clientName}>
                  <td>{clientName}</td>
                  <td>{clientDispatches.length}</td>
                  <td>{totalFacturado.toFixed(2)}</td>
                  <td>{ultimoDespacho}</td>
                  <td>
                    <Button variant="info" size="sm">Facturar</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default AdvancedReports;