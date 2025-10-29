import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import DispatchForm from '../components/DispatchForm';
import DispatchFilter from '../components/DispatchFilter';
import DispatchHistory from '../components/DispatchHistory';
import { Dispatch } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const DispatchView: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);

  const fetchDispatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/dispatches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      setFilteredDispatches(formattedData);
    } catch (error) {
      console.error("Error fetching dispatches:", error);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const handleFilter = (filtered: Dispatch[]) => {
    setFilteredDispatches(filtered);
  };

  const handleCreateDispatch = async (newDispatch: Omit<Dispatch, 'id'>) => {
    try {
      // Guardar cliente automáticamente si no existe
      if (newDispatch.cliente && newDispatch.cliente.trim()) {
        try {
          await fetch(`${API_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newDispatch.cliente,
              companyId: 1 // Default company
            }),
          }).catch(() => {}); // Ignorar si ya existe
        } catch (error) {
          console.log('Cliente ya existe o error al crear');
        }
      }

      // Guardar camión automáticamente si no existe
      if (newDispatch.camion && newDispatch.camion.trim()) {
        try {
          // Crear una tabla o endpoint para camiones si no existe
          // Por ahora solo registramos el intento
          console.log('Registrando camión:', newDispatch.camion);
        } catch (error) {
          console.log('Error al registrar camión');
        }
      }

      // Crear el despacho
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/dispatches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newDispatch,
          materials: JSON.stringify(newDispatch.materials)
        }),
      });
      
      if (response.ok) {
        // Actualizar la lista de despachos
        fetchDispatches();
      } else {
        const errorData = await response.json();
        console.error("Error creating dispatch:", errorData.error);
      }
    } catch (error) {
      console.error("Error creating dispatch:", error);
    }
  };

  const deleteDispatch = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/dispatches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchDispatches();
      } else {
        const errorData = await response.json();
        console.error("Error deleting dispatch:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting dispatch:", error);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <DispatchForm onSubmit={handleCreateDispatch} />
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={12}>
          <DispatchFilter dispatches={dispatches} onFilter={handleFilter} />
          <DispatchHistory dispatches={filteredDispatches} onDelete={deleteDispatch} />
        </Col>
      </Row>
    </Container>
  );
};

export default DispatchView;