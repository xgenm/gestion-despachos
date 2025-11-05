import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const AdminUserManager: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('employee'); // Por defecto es empleado
  const [message, setMessage] = useState<{type: string, text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!username || !password || !confirmPassword) {
      setMessage({type: 'danger', text: 'Todos los campos son requeridos'});
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({type: 'danger', text: 'Las contraseñas no coinciden'});
      return;
    }
    
    if (password.length < 6) {
      setMessage({type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres'});
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({type: 'success', text: `Usuario ${role === 'admin' ? 'administrador' : 'empleado'} creado exitosamente`});
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setRole('employee'); // Resetear a empleado por defecto
      } else {
        setMessage({type: 'danger', text: data.error || 'Error al crear usuario'});
      }
    } catch (error) {
      setMessage({type: 'danger', text: 'Error de conexión con el servidor'});
      console.error('Error al registrar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>Gestión de Usuarios</Card.Header>
      <Card.Body>
        {message && <Alert variant={message.type}>{message.text}</Alert>}
        
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Nombre de usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Text className="text-muted">
              La contraseña debe tener al menos 6 caracteres.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirme contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Rol</Form.Label>
            <Form.Select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={user?.role !== 'admin'} // Solo los administradores pueden crear otros administradores
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </Form.Select>
            {user?.role !== 'admin' && (
              <Form.Text className="text-muted">
                Solo los administradores pueden crear otros administradores.
              </Form.Text>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AdminUserManager;