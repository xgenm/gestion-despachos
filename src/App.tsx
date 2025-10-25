import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Importar vistas
import AdminView from './views/AdminView';
import EnhancedAdminView from './views/EnhancedAdminView';
import InvoicingView from './views/InvoicingView';
import Login from './components/Login';

// Importar componentes
import DispatchHistory from './components/DispatchHistory';
import DispatchForm from './components/DispatchForm';
import CompanyManager from './components/CompanyManager';
import ClientManager from './components/ClientManager';
import ProductPriceManager from './components/ProductPriceManager';
import AdminUserManager from './components/AdminUserManager';
import AdvancedReports from './components/AdvancedReports';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('admin');

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      // Aquí normalmente verificarías la validez del token con el backend
      // Pero para simplificar, asumiremos que es válido
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
  };

  // Componente para proteger rutas
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="App">
        {isLoggedIn && (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand href="/">Sistema de Despachos</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link 
                    href="#" 
                    onClick={() => setActiveView('admin')}
                    active={activeView === 'admin'}
                  >
                    Administración
                  </Nav.Link>
                  <Nav.Link 
                    href="#" 
                    onClick={() => setActiveView('dispatch')}
                    active={activeView === 'dispatch'}
                  >
                    Despachos
                  </Nav.Link>
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
                </Nav>
                <Nav>
                  <Button variant="outline-light" onClick={handleLogout}>
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
              isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  {activeView === 'admin' && <AdminView />}
                  {activeView === 'dispatch' && (
                    <div>
                      <h2>Despachos</h2>
                      <p>Seleccione una opción del menú para gestionar los despachos.</p>
                    </div>
                  )}
                  {activeView === 'invoicing' && (
                    <div>
                      <h2>Facturación</h2>
                      <p>Seleccione una opción del menú para gestionar la facturación.</p>
                    </div>
                  )}
                  {activeView === 'companies' && <CompanyManager />}
                  {activeView === 'clients' && <ClientManager />}
                  {activeView === 'products' && <ProductPriceManager />}
                  {activeView === 'admins' && <AdminUserManager />}
                  {activeView === 'reports' && (
                    <div>
                      <h2>Reportes Avanzados</h2>
                      <p>Seleccione una opción del menú para ver reportes avanzados.</p>
                    </div>
                  )}
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;