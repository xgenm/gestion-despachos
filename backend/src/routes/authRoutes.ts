import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const router = Router();

// Registro de administrador (solo para crear el primer usuario)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
    }
    
    // Verificar si la autenticación está deshabilitada para desarrollo
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    
    if (disableAuth) {
      // En modo desarrollo sin base de datos, crear un usuario simulado
      const user = { id: 1, username, password };
      
      // Generar token
      const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secret,
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        message: 'Usuario creado exitosamente (modo desarrollo)',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    
    // Crear nuevo usuario
    const user = await UserModel.createUser(username, password);
    
    // Generar token
    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secret,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
    }
    
    // Verificar si la autenticación está deshabilitada para desarrollo
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    
    if (disableAuth) {
      // En modo desarrollo sin base de datos, permitir cualquier login
      const user = { id: 1, username };
      
      // Generar token
      const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secret,
        { expiresIn: '24h' }
      );
      
      return res.json({
        message: 'Inicio de sesión exitoso (modo desarrollo)',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    }
    
    // Buscar usuario
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Validar contraseña
    const isValidPassword = await UserModel.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token
    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secret,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;