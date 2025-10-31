import React, { useState, useMemo, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { Dispatch } from '../types';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

interface AdminData {
  id: number;
  name: string;
}

const initialFormState = {
  despachoNo: '',
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
  camion: '',
  placa: '',
  color: '',
  ficha: '',
  cliente: '',
  celular: '',
  userId: 0,
  equipmentId: 0,
  operatorId: 0,
};

const materialsData = [
    { id: 'arenaLavada', label: 'Arena lavada', price: 1500 },
    { id: 'arenaSinLavar', label: 'Arena sin lavar', price: 1200 },
    { id: 'grava', label: 'Grava', price: 1800 },
    { id: 'subBase', label: 'Sub-base', price: 1000 },
    { id: 'gravaArena', label: 'Grava Arena', price: 1600 },
    { id: 'granzote', label: 'Granzote', price: 2000 },
    { id: 'gravillin', label: 'Gravillín', price: 2200 },
    { id: 'cascajoGris', label: 'Cascajo gris (Relleno)', price: 800 },
    { id: 'base', label: 'Base', price: 1100 },
    { id: 'rellenoAmarillento', label: 'Relleno amarillento', price: 700 },
  ];

interface Props {
  onSubmit: (dispatch: Omit<Dispatch, 'id'>) => void;
}

const DispatchForm: React.FC<Props> = ({ onSubmit }) => {
  const { user } = useAuth(); // Obtener usuario logueado
  const [formData, setFormData] = useState(initialFormState);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, { selected: boolean; quantity: number }>>({});
  const [users, setUsers] = useState<AdminData[]>([]);
  const [equipment, setEquipment] = useState<AdminData[]>([]);
  const [operators, setOperators] = useState<AdminData[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No hay token de autenticación. Redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Cargar datos con manejo de errores 401
    fetch(`${API_URL}/users`, { headers })
      .then(res => {
        if (res.status === 401) {
          console.error('❌ Token expirado o inválido. Redirigiendo al login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => setUsers(data.data || []))
      .catch(err => {
        if (err.message !== 'Unauthorized') {
          console.error('Error al cargar usuarios:', err);
        }
      });

    fetch(`${API_URL}/equipment`, { headers })
      .then(res => res.status === 401 ? Promise.reject('Unauthorized') : res.json())
      .then(data => setEquipment(data.data || []))
      .catch(err => err !== 'Unauthorized' && console.error('Error al cargar equipos:', err));

    fetch(`${API_URL}/operators`, { headers })
      .then(res => res.status === 401 ? Promise.reject('Unauthorized') : res.json())
      .then(data => setOperators(data.data || []))
      .catch(err => err !== 'Unauthorized' && console.error('Error al cargar operarios:', err));
  }, []);

  // Auto-seleccionar el usuario logueado en "Atendido por" (garantizar que siempre tenga valor)
  useEffect(() => {
    if (user && user.id) {
      setFormData(prev => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  const total = useMemo(() => {
    return Object.keys(selectedMaterials).reduce((acc, key) => {
      const material = materialsData.find(m => m.id === key);
      if (material && selectedMaterials[key].selected) {
        return acc + (material.price * selectedMaterials[key].quantity);
      }
      return acc;
    }, 0);
  }, [selectedMaterials]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    // Convertir a número si es un campo de ID
    const numericFields = ['userId', 'equipmentId', 'operatorId'];
    const finalValue = numericFields.includes(id) ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [materialId]: { selected: !prev[materialId]?.selected, quantity: prev[materialId]?.quantity || 0 },
    }));
  };

  const handleQuantityChange = (materialId: string, quantity: string) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [materialId]: { ...prev[materialId], quantity: parseFloat(quantity) || 0 },
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedMaterials({});
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Asegurar que userId tenga un valor válido antes de enviar
    const finalUserId = formData.userId || user?.id || 1; // Fallback a admin si no hay usuario
    
    const newDispatch: Omit<Dispatch, 'id'> = {
      ...formData,
      userId: finalUserId,
      materials: Object.keys(selectedMaterials)
        .filter(key => selectedMaterials[key].selected && selectedMaterials[key].quantity > 0)
        .map(key => ({ id: key, quantity: selectedMaterials[key].quantity })),
      total,
    };
    onSubmit(newDispatch);
    resetForm();
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Nuevo Ticket</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="despachoNo">
              <Form.Label>Ticket Nº</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.despachoNo} 
                onChange={handleInputChange}
                readOnly={user?.role === 'employee'}
                placeholder={user?.role === 'employee' ? 'Se asignará automáticamente' : '7 dígitos numéricos (ej: 0000001)'}
                maxLength={7}
                pattern="[0-9]{7}"
              />
              {user?.role === 'employee' && <Form.Text className="text-muted">El número se generará automáticamente (7 dígitos)</Form.Text>}
            </Form.Group>
            <Form.Group as={Col} controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" value={formData.fecha} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="hora">
              <Form.Label>Hora</Form.Label>
              <Form.Control type="time" value={formData.hora} onChange={handleInputChange} />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="userId">
              <Form.Label>Atendido por</Form.Label>
              <Form.Select value={formData.userId} onChange={handleInputChange} disabled={user?.role === 'employee'}>
                  <option value={0}>-- Seleccione --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Form.Select>
              {user?.role === 'employee' && <Form.Text className="text-muted">Automáticamente asignado a tu usuario</Form.Text>}
            </Form.Group>
            <Form.Group as={Col} controlId="equipmentId">
              <Form.Label>Equipo</Form.Label>
              <Form.Select value={formData.equipmentId} onChange={handleInputChange}>
                  <option value={0}>-- Seleccione --</option>
                  {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="operatorId">
              <Form.Label>Operario</Form.Label>
              <Form.Select value={formData.operatorId} onChange={handleInputChange}>
                  <option value={0}>-- Seleccione --</option>
                  {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Form.Select>
            </Form.Group>
          </Row>

          <hr />

          <Row className="mb-3">
            <Form.Group as={Col} controlId="placa">
              <Form.Label>Placa</Form.Label>
              <Form.Control type="text" value={formData.placa} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group as={Col} controlId="camion">
              <Form.Label>Camión</Form.Label>
              <Form.Control type="text" value={formData.camion} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group as={Col} controlId="color">
              <Form.Label>Color</Form.Label>
              <Form.Control type="text" value={formData.color} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="ficha">
              <Form.Label>Ficha</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.ficha} 
                onChange={handleInputChange}
                placeholder="Alfanumérico"
              />
            </Form.Group>
          </Row>

          <hr />

          <h5>Materiales</h5>
          <Row>
            {materialsData.map(material => (
              <Col md={6} key={material.id} className="mb-2">
                <InputGroup>
                  <InputGroup.Checkbox 
                    checked={selectedMaterials[material.id]?.selected || false}
                    onChange={() => handleMaterialSelect(material.id)} 
                  />
                  <InputGroup.Text>{material.label}</InputGroup.Text>
                  {selectedMaterials[material.id]?.selected && (
                    <Form.Control
                      type="number"
                      placeholder="M³"
                      value={selectedMaterials[material.id]?.quantity || ''}
                      onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                    />
                  )}
                </InputGroup>
              </Col>
            ))}
          </Row>

          <hr />

          <Row className="mb-3">
            <Form.Group as={Col} md={6} controlId="cliente">
              <Form.Label>Cliente</Form.Label>
              <Form.Control type="text" value={formData.cliente} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="celular">
              <Form.Label>Celular</Form.Label>
              <Form.Control type="text" value={formData.celular} onChange={handleInputChange} />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md={6} controlId="total">
              <Form.Label>Total a Pagar (RD$)</Form.Label>
              <Form.Control type="number" readOnly value={total.toFixed(2)} />
            </Form.Group>
          </Row>

          <Button variant="primary" type="submit">
            Guardar Despacho
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DispatchForm;