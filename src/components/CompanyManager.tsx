import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Row, Col, Modal } from 'react-bootstrap';

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3002/api');

const CompanyManager: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCompany 
        ? `${API_URL}/companies/${editingCompany.id}` 
        : `${API_URL}/companies`;
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchCompanies();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error("Error saving company:", errorData.error);
      }
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta empresa?')) {
      try {
        const response = await fetch(`${API_URL}/companies/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchCompanies();
        } else {
          const errorData = await response.json();
          console.error("Error deleting company:", errorData.error);
        }
      } catch (error) {
        console.error("Error deleting company:", error);
      }
    }
  };

  const resetForm = () => {
    setEditingCompany(null);
    setFormData({ name: '', address: '', phone: '', email: '' });
    setShowModal(false);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>Gestión de Empresas</span>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Agregar Empresa
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <ListGroup>
          {companies.map(company => (
            <ListGroup.Item key={company.id} className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{company.name}</strong>
                {company.address && <div>Dirección: {company.address}</div>}
                {company.phone && <div>Teléfono: {company.phone}</div>}
                {company.email && <div>Email: {company.email}</div>}
              </div>
              <div>
                <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(company)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(company.id)}>
                  Eliminar
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      {/* Modal para agregar/editar empresa */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCompany ? 'Editar Empresa' : 'Agregar Nueva Empresa'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Empresa *</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange} 
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleInputChange} 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control 
                type="text" 
                name="phone"
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingCompany ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default CompanyManager;