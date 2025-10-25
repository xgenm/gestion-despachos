import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Dispatch } from '../types';

interface DispatchFilterProps {
  dispatches: Dispatch[];
  onFilter: (filtered: Dispatch[]) => void;
}

const DispatchFilter: React.FC<DispatchFilterProps> = ({ dispatches, onFilter }) => {
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleFilter = () => {
    let filtered: Dispatch[] = [];
    
    switch (filterType) {
      case 'day':
        filtered = dispatches.filter(d => d.fecha === selectedDate);
        break;
      case 'month':
        const [year, month] = selectedDate.split('-');
        filtered = dispatches.filter(d => {
          const [dYear, dMonth] = d.fecha.split('-');
          return dYear === year && dMonth === month;
        });
        break;
      case 'year':
        const selectedYear = selectedDate.split('-')[0];
        filtered = dispatches.filter(d => d.fecha.startsWith(selectedYear));
        break;
    }
    
    onFilter(filtered);
  };

  const handleReset = () => {
    onFilter(dispatches);
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <h5>Filtrar Despachos</h5>
      <Row>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Tipo de Filtro</Form.Label>
            <Form.Select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as 'day' | 'month' | 'year')}
            >
              <option value="day">Por Día</option>
              <option value="month">Por Mes</option>
              <option value="year">Por Año</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              {filterType === 'day' && 'Fecha'}
              {filterType === 'month' && 'Mes'}
              {filterType === 'year' && 'Año'}
            </Form.Label>
            <Form.Control
              type={filterType === 'year' ? 'text' : filterType === 'month' ? 'month' : 'date'}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <div>
            <Button variant="primary" className="me-2" onClick={handleFilter}>
              Filtrar
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Resetear
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DispatchFilter;