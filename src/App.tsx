import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Importar contexto
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar vistas
import AdminView from './views/AdminView';
import EnhancedAdminView from './views/EnhancedAdminView';
import InvoicingView from './views/InvoicingView';
import DispatchView from './views/DispatchView';
import EmployeeManagementView from './views/EmployeeManagementView';
import Login from './components/Login';

// Importar componentes
import CompanyManager from './components/CompanyManager';
import ClientManager from './components/ClientManager';
import ProductPriceManager from './components/ProductPriceManager';
import AdminUserManager from './components/AdminUserManager';
import AdvancedReportsView from './components/AdvancedReportsView';

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Componente para proteger rutas de administrador
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [activeView, setActiveView] = useState('dispatch');

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand href="/">Sistema de Despachos</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link 
                    href="#" 
                    onClick={() => setActiveView('dispatch')}
                    active={activeView === 'dispatch'}
                  >
                    Despachos
                  </Nav.Link>
                  
                  {/* Solo mostrar Facturación y Gestión a administradores */}
                  {isAdmin && (
                    <>
                      <Nav.Link 
                        href="#" 
                        onClick={() => setActiveView('invoicing')}
                        active={activeView === 'invoicing'}
                      >
                        Facturación
                      </Nav.Link>
                      <NavDropdown title="Gestión" id="basic-nav-dropdown">
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('admin')}
                        >
                          Administración
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('employees')}
                        >
                          Empleados
                        </NavDropdown.Item>
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('companies')}
                        >
                          Empresas
                        </NavDropdown.Item>
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('clients')}
                        >
                          Clientes
                        </NavDropdown.Item>
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('products')}
                        >
                          Precios de Productos
                        </NavDropdown.Item>
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('admins')}
                        >
                          Administradores
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item 
                          href="#" 
                          onClick={() => setActiveView('reports')}
                        >
                          Reportes Avanzados
                        </NavDropdown.Item>
                      </NavDropdown>
                    </>
                  )}
                </Nav>
                <Nav>
                  <Button variant="outline-light" onClick={logout}>
                    Cerrar Sesión
                  </Button>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        )}

        <Container className="mt-4">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  {activeView === 'dispatch' && <DispatchView />}
                  {isAdmin && (
                    <>
                      {activeView === 'admin' && <AdminView />}
                      {activeView === 'invoicing' && <InvoicingView />}
                      {activeView === 'employees' && <EmployeeManagementView />}
                      {activeView === 'companies' && <CompanyManager />}
                      {activeView === 'clients' && <ClientManager />}
                      {activeView === 'products' && <ProductPriceManager />}
                      {activeView === 'admins' && <AdminUserManager />}
                      {activeView === 'reports' && <AdvancedReportsView />}
                    </>
                  )}
                  {!isAdmin && activeView !== 'dispatch' && <DispatchView />}
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;