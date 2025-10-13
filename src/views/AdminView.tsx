import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminManager from '../components/AdminManager';

const AdminView: React.FC = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <AdminManager title="Usuarios" apiEndpoint="users" />
        </Col>
        <Col md={4}>
          <AdminManager title="Equipos" apiEndpoint="equipment" />
        </Col>
        <Col md={4}>
          <AdminManager title="Operarios" apiEndpoint="operators" />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminView;
