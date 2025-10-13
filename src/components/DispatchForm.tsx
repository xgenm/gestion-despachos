import React, { useState, useMemo } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { Dispatch } from '../types';

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
  recibi: '',
};

interface Props {
  onSubmit: (dispatch: Omit<Dispatch, 'id'>) => void;
}

const DispatchForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, { selected: boolean; quantity: number }>>({});

  const total = useMemo(() => {
    return Object.keys(selectedMaterials).reduce((acc, key) => {
      const material = materialsData.find(m => m.id === key);
      if (material && selectedMaterials[key].selected) {
        return acc + (material.price * selectedMaterials[key].quantity);
      }
      return acc;
    }, 0);
  }, [selectedMaterials]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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
    const newDispatch: Omit<Dispatch, 'id'> = {
      ...formData,
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
        <Card.Title>Nuevo Despacho</Card.Title>
        <Form onSubmit={handleSubmit}>
          {/* ... form fields are unchanged ... */}
          <Row className="mb-3">
            <Form.Group as={Col} controlId="despachoNo">
              <Form.Label>Despacho Nº</Form.Label>
              <Form.Control type="text" value={formData.despachoNo} onChange={handleInputChange} />
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
            <Form.Group as={Col} controlId="camion">
              <Form.Label>Camión</Form.Label>
              <Form.Control type="text" value={formData.camion} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="placa">
              <Form.Label>Placa</Form.Label>
              <Form.Control type="text" value={formData.placa} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="color">
              <Form.Label>Color</Form.Label>
              <Form.Control type="text" value={formData.color} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="ficha">
              <Form.Label>Ficha</Form.Label>
              <Form.Control type="text" value={formData.ficha} onChange={handleInputChange} />
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
            <Form.Group as={Col} controlId="cliente">
              <Form.Label>Cliente</Form.Label>
              <Form.Control type="text" value={formData.cliente} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="celular">
              <Form.Label>Celular</Form.Label>
              <Form.Control type="text" value={formData.celular} onChange={handleInputChange} />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="recibi">
              <Form.Label>Recibido</Form.Label>
              <Form.Control type="text" value={formData.recibi} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="total">
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
