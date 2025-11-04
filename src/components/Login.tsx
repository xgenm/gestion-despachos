import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

  // Limpiar tokens inválidos al cargar el componente de login
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Tokens antiguos limpiados');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token y datos de usuario en el contexto
        login(data.token, data.user);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container fluid className="h-100 p-0">
        <Row className="h-100 align-items-center justify-content-center g-0">
          <Col xs={12} sm={11} md={8} lg={6} xl={5}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="login-icon mb-4">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4 login-alert">
                    <strong>Error:</strong> {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="username">
                    <div className="input-with-icon">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <Form.Control
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="login-input"
                        autoComplete="username"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <div className="input-with-icon">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <Form.Control
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                        autoComplete="current-password"
                      />
                    </div>
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      className="login-button"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;