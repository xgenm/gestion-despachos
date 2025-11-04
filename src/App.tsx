import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Navbar.css';

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

// Backend: https://gestion-despachos.onrender.com/api
// Frontend: Vercel
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
          <Navbar expand="lg" className="modern-navbar">
            <Container fluid className="px-3 px-md-4">
              <Navbar.Brand href="/" className="navbar-brand-modern">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="d-none d-md-inline">Sistema de Despachos</span>
                <span className="d-inline d-md-none">Despachos</span>
              </Navbar.Brand>
              
              <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </Navbar.Toggle>
              
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link 
                    href="#" 
                    onClick={() => setActiveView('dispatch')}
                    className={activeView === 'dispatch' ? 'active' : ''}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="9" x2="15" y2="9"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    Despachos
                  </Nav.Link>
                  
                  {isAdmin && (
                    <>
                      <Nav.Link 
                        href="#" 
                        onClick={() => setActiveView('invoicing')}
                        className={activeView === 'invoicing' ? 'active' : ''}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        Facturación
                      </Nav.Link>
                      
                      <NavDropdown 
                        title={
                          <span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                              <circle cx="12" cy="12" r="3"/>
                              <path d="M12 1v6m0 6v6m-5.2-9.8L11 12l4.2-4.2M6.8 17.2L11 13l4.2 4.2M1 12h6m6 0h6"/>
                            </svg>
                            Gestión
                          </span>
                        }
                        id="basic-nav-dropdown"
                        className="modern-dropdown"
                      >
                        <NavDropdown.Item href="#" onClick={() => setActiveView('admin')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M12 2v20M2 12h20"/>
                          </svg>
                          Administración
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#" onClick={() => setActiveView('employees')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"/>
                          </svg>
                          Empleados
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#" onClick={() => setActiveView('companies')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          </svg>
                          Empresas
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#" onClick={() => setActiveView('clients')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          Clientes
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#" onClick={() => setActiveView('products')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          Precios de Productos
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#" onClick={() => setActiveView('admins')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          Administradores
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#" onClick={() => setActiveView('reports')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                          </svg>
                          Reportes Avanzados
                        </NavDropdown.Item>
                      </NavDropdown>
                    </>
                  )}
                </Nav>
                
                <Nav>
                  <Button variant="outline-primary" onClick={logout} className="logout-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span className="d-none d-md-inline">Cerrar Sesión</span>
                    <span className="d-inline d-md-none">Salir</span>
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