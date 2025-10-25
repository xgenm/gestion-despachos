import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Row, Col } from 'react-bootstrap';

interface AdminManagerProps {
  title: string;
  apiEndpoint: string;
}

interface DataItem {
  id: number;
  name: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const AdminManager: React.FC<AdminManagerProps> = ({ title, apiEndpoint }) => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/${apiEndpoint}`)
      .then(res => res.json())
      .then(data => setItems(data.data));
  }, [apiEndpoint]);

  const handleAddItem = () => {
    fetch(`${API_URL}/${apiEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItemName }),
    })
      .then(res => res.json())
      .then(newItem => {
        setItems(prev => [...prev, newItem]);
        setNewItemName('');
      });
  };

  const handleDeleteItem = (id: number) => {
    fetch(`${API_URL}/${apiEndpoint}/${id}`, { method: 'DELETE' })
      .then(() => {
        setItems(prev => prev.filter(item => item.id !== id));
      });
  };

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <ListGroup>
          {items.map(item => (
            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
              {item.name}
              <Button variant="danger" size="sm" onClick={() => handleDeleteItem(item.id)}>
                <i className="bi bi-trash"></i>
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <hr />
        <Form.Group as={Row}>
          <Col sm={9}>
            <Form.Control 
              type="text" 
              placeholder={`Nuevo ${title}...`} 
              value={newItemName} 
              onChange={e => setNewItemName(e.target.value)} 
            />
          </Col>
          <Col sm={3}>
            <Button onClick={handleAddItem} className="w-100">Añadir</Button>
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default AdminManager;