import React, { useState, useEffect, useCallback } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import DispatchForm from './components/DispatchForm';
import DispatchHistory from './components/DispatchHistory';
import InvoicingView from './views/InvoicingView';
import AdminView from './views/AdminView';
import EnhancedAdminView from './views/EnhancedAdminView';
import { Dispatch } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

function App() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [key, setKey] = useState('dispatches');

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
    } catch (error) {
      console.error("Error fetching dispatches:", error);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const addDispatch = async (dispatch: Omit<Dispatch, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/dispatches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dispatch),
      });
      if (response.ok) {
        fetchDispatches();
      }
    } catch (error) {
      console.error("Error adding dispatch:", error);
    }
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
    <Container className="mt-5">
      <h1 className="mb-1">Mina "SALUDALSA"</h1>
      <p className="text-muted">Código 6700</p>
      <Tabs
        id="main-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k || 'dispatches')}
        className="mb-3"
      >
        <Tab eventKey="dispatches" title="Despachos">
          <DispatchForm onSubmit={addDispatch} />
          <DispatchHistory dispatches={dispatches} onDelete={deleteDispatch} />
        </Tab>
        <Tab eventKey="invoicing" title="Facturación">
          <InvoicingView dispatches={dispatches} />
        </Tab>
        <Tab eventKey="admin" title="Administración">
          <AdminView />
        </Tab>
        <Tab eventKey="enhanced-admin" title="Administración Avanzada">
          <EnhancedAdminView />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default App;