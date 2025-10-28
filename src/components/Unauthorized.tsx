import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header>
          <h4>Acceso Denegado</h4>
        </Card.Header>
        <Card.Body>
          <p>No tienes permisos suficientes para acceder a esta sección.</p>
          <p>Por favor, contacta con un administrador si crees que deberías tener acceso.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Unauthorized;