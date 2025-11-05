import React, { useState } from 'react';
import { Card, Table, Form, Button } from 'react-bootstrap';

interface Product {
  id: string;
  name: string;
  price: number;
}

const initialProducts: Product[] = [
  { id: 'arenaLavada', name: 'Arena lavada', price: 1500 },
  { id: 'arenaSinLavar', name: 'Arena sin lavar', price: 1200 },
  { id: 'grava', name: 'Grava', price: 1800 },
  { id: 'subBase', name: 'Sub-base', price: 1000 },
  { id: 'gravaArena', name: 'Grava Arena', price: 1600 },
  { id: 'granzote', name: 'Granzote', price: 2000 },
  { id: 'gravillin', name: 'Gravillín', price: 2200 },
  { id: 'cascajoGris', name: 'Cascajo gris (Relleno)', price: 800 },
  { id: 'base', name: 'Base', price: 1100 },
  { id: 'rellenoAmarillento', name: 'Relleno amarillento', price: 700 },
];

const ProductPriceManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const handleEditPrice = (productId: string, currentPrice: number) => {
    setEditingId(productId);
    setNewPrice(currentPrice);
  };

  const handleSavePrice = (productId: string) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, price: newPrice } : product
      )
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice(parseFloat(e.target.value) || 0);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>Configuración de Precios de Productos</span>
          <Button variant="info" disabled>
            Guardar Todos los Precios
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio (RD$)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>
                  {editingId === product.id ? (
                    <Form.Control 
                      type="number" 
                      value={newPrice} 
                      onChange={handlePriceChange}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    product.price.toFixed(2)
                  )}
                </td>
                <td>
                  {editingId === product.id ? (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleSavePrice(product.id)}
                      >
                        Guardar
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleEditPrice(product.id, product.price)}
                    >
                      Editar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="mt-3">
          <small className="text-muted">
            Nota: Los precios se guardan localmente en esta vista. En una implementación completa, 
            se conectarían con una API para guardar los cambios permanentemente.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductPriceManager;