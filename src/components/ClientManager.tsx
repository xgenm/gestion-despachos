import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, ListGroup, Form, Button, Row, Col, Modal } from 'react-bootstrap';

interface Client {
  id: number;
  name: string;
  companyId: number;
}

interface Company {
  id: number;
  name: string;
}

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://gestion-despachos.onrender.com/api' : 'http://localhost:3002/api');

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyId: 0
  });

  useEffect(() => {
    fetchClients();
    fetchCompanies();
  }, []);

  const fetchClients = async () => {
    try {
      // En una implementación completa, habría una ruta específica para clientes
      // Por ahora simulamos con datos locales o una implementación futura
      console.log("Funcionalidad de clientes pendiente de implementar completamente");
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'companyId' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // En una implementación completa, se conectaría con una API de clientes
      console.log("Guardando cliente:", formData);
      resetForm();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      companyId: client.companyId
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este cliente?')) {
      try {
        // En una implementación completa, se conectaría con una API de clientes
        console.log("Eliminando cliente:", id);
        fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({ name: '', companyId: 0 });
    setShowModal(false);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>Gestión de Clientes</span>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Agregar Cliente
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <ListGroup>
          <ListGroup.Item className="text-muted">
            Funcionalidad de gestión de clientes pendiente de implementar completamente.
            Los clientes se asociarán a empresas y podrán ser facturados.
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>

      {/* Modal para agregar/editar cliente */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Cliente *</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange as any} 
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Empresa *</Form.Label>
              <Form.Select 
                name="companyId"
                value={formData.companyId} 
                onChange={handleInputChange as any} 
                required
              >
                <option value={0}>Seleccione una empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingClient ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ClientManager;