import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminManager from '../components/AdminManager';
import DispatchFilter from '../components/DispatchFilter';
import DispatchHistory from '../components/DispatchHistory';
import { Dispatch } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const AdminView: React.FC = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);

  const fetchDispatches = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dispatches`);
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

  const deleteDispatch = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/dispatches/${id}`, {
        method: 'DELETE',
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
        <Col md={4}>
          <AdminManager title="Usuarios" apiEndpoint="users" />
        </Col>
        <Col md={4}>
          <AdminManager title="Equipos" apiEndpoint="equipment" />
        </Col>
        <Col md={4}>
          <AdminManager title="Operarios" apiEndpoint="operators" />
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

export default AdminView;