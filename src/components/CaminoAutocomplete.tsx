import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface CaminoData {
  id: number;
  placa: string;
  marca: string;
  color: string;
  m3: number;
  ficha: string;
}

interface Props {
  placa: string;
  onPlacaChange: (placa: string) => void;
  onCaminoFound: (camino: CaminoData) => void;
  onCaminoNotFound: () => void;
  isReadOnly: boolean;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const CaminoAutocomplete: React.FC<Props> = ({ 
  placa, 
  onPlacaChange, 
  onCaminoFound, 
  onCaminoNotFound,
  isReadOnly 
}) => {
  const { user } = useAuth();
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCaminoForm, setShowNewCaminoForm] = useState(false);
  const [newCamino, setNewCamino] = useState({ marca: '', color: '', m3: '', ficha: '' });

  const handleSearchPlaca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim()) {
      setSearchMessage('Ingresa una placa');
      return;
    }

    setIsSearching(true);
    setSearchMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/camiones?placa=${placa.toUpperCase()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.found && result.data) {
        console.log('✅ Camión encontrado:', result.data);
        onCaminoFound(result.data);
        setSearchMessage(`✅ Camión encontrado: ${result.data.marca} - ${result.data.m3} m³`);
        setShowNewCaminoForm(false);
      } else {
        console.log('❌ Camión no encontrado');
        onCaminoNotFound();
        setSearchMessage('❌ Placa no encontrada. Puedes crear un nuevo camión.');
        setShowNewCaminoForm(user?.role === 'admin');
      }
    } catch (error) {
      console.error('Error buscando camión:', error);
      setSearchMessage('❌ Error al buscar camión');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateCamino = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCamino.m3 || isNaN(parseFloat(newCamino.m3))) {
      alert('M3 debe ser un número válido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/camiones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          placa: placa.toUpperCase(),
          marca: newCamino.marca,
          color: newCamino.color,
          m3: parseFloat(newCamino.m3),
          ficha: newCamino.ficha
        })
      });

      if (response.ok) {
        const caminoCreado = await response.json();
        console.log('✅ Camión creado:', caminoCreado);
        onCaminoFound(caminoCreado);
        setSearchMessage(`✅ Camión creado: ${caminoCreado.marca} - ${caminoCreado.m3} m³`);
        setShowNewCaminoForm(false);
        setNewCamino({ marca: '', color: '', m3: '', ficha: '' });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando camión:', error);
      alert('Error al crear camión');
    }
  };

  return (
    <div className="mb-3 p-3 bg-light rounded">
      <h5>Buscar/Crear Camión por Placa</h5>
      <Form onSubmit={handleSearchPlaca}>
        <Form.Group className="mb-3">
          <Form.Label>Placa</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: AA123BC"
            value={placa}
            onChange={(e) => onPlacaChange(e.target.value.toUpperCase())}
            readOnly={isReadOnly}
            disabled={isSearching}
            maxLength={10}
          />
          <Form.Text className="text-muted">Máximo 10 caracteres alfanuméricos</Form.Text>
        </Form.Group>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={!placa.trim() || isSearching || isReadOnly}
        >
          {isSearching ? 'Buscando...' : 'Buscar Camión'}
        </Button>
      </Form>

      {searchMessage && (
        <Alert 
          variant={searchMessage.includes('✅') ? 'success' : 'danger'} 
          className="mt-3"
        >
          {searchMessage}
        </Alert>
      )}

      {showNewCaminoForm && user?.role === 'admin' && (
        <Form onSubmit={handleCreateCamino} className="mt-3 p-3 border rounded bg-white">
          <h6>Crear Nuevo Camión</h6>
          <Form.Group className="mb-2">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Volvo, Mercedes"
              value={newCamino.marca}
              onChange={(e) => setNewCamino({ ...newCamino, marca: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Rojo"
              value={newCamino.color}
              onChange={(e) => setNewCamino({ ...newCamino, color: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>M³</Form.Label>
            <Form.Control
              type="number"
              placeholder="Capacidad del camión"
              step="0.1"
              value={newCamino.m3}
              onChange={(e) => setNewCamino({ ...newCamino, m3: e.target.value })}
              required
            />
            <Form.Text className="text-muted">Capacidad máxima en metros cúbicos</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ficha</Form.Label>
            <Form.Control
              type="text"
              placeholder="Alfanumérico"
              value={newCamino.ficha}
              onChange={(e) => setNewCamino({ ...newCamino, ficha: e.target.value })}
            />
          </Form.Group>
          <Button variant="success" type="submit" className="me-2">
            Crear Camión
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowNewCaminoForm(false)}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </div>
  );
};

export default CaminoAutocomplete;
