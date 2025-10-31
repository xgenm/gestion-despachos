import { Router, Request } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import authenticateToken from '../middleware/authMiddleware';
import { logManualAction } from '../middleware/auditMiddleware';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const router = Router();

// Usuario de prueba para desarrollo
const devUser = {
  id: 1,
  username: 'admin',
  password: 'admin123',
  role: 'admin' // Por defecto, el usuario de desarrollo es admin
};

// Almacenamiento simulado de usuarios en desarrollo
let devUsers: any[] = [devUser];
let nextDevUserId = 2;

// Registro de administrador (solo para crear el primer usuario)
router.post('/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { username, password, role = 'employee' } = req.body;
    const createdBy = req.user?.id; // ID del usuario que está creando este empleado
    
    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
    }
    
    // Validar rol
    if (role !== 'admin' && role !== 'employee') {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "employee"' });
    }
    
    // Verificar si la autenticación está deshabilitada para desarrollo
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    
    if (disableAuth) {
      // En modo desarrollo sin base de datos, crear un usuario simulado
      // Verificar si el usuario ya existe
      const existingUser = devUsers.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
      
      const user = { id: nextDevUserId++, username, password, role };
      devUsers.push(user);
      
      // Generar token
      const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secret,
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        message: 'Usuario creado exitosamente (modo desarrollo)',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    }
    
    // Verificar si el usuario ya existe (en modo con BD real)
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    
    // Crear nuevo usuario con el campo created_by
    const user = await UserModel.createUser(username, password, role, createdBy);
    
    // Registrar en auditoría
    if (createdBy) {
      await logManualAction(
        createdBy,
        req.user?.username || 'unknown',
        'CREATE',
        'user',
        user.id,
        { username, role },
        req
      );
    }
    
    // Generar token
    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_by: user.created_by
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener lista de usuarios
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    
    if (disableAuth) {
      // En modo desarrollo, retornar lista de usuarios simulados
      const users = devUsers.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role
      }));
      return res.json(users);
    }
    
    // En modo con BD real, obtener todos los usuarios
    const users = await UserModel.getAllUsers();
    const usersResponse = users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      created_by: u.created_by,
      created_at: u.created_at
    }));
    
    res.json(usersResponse);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario
router.delete('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUserId = req.user?.id;
    
    // Validar que no se pueda auto-eliminar
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }
    
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    
    if (disableAuth) {
      // En modo desarrollo, eliminar usuario simulado
      const userIndex = devUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // No permitir eliminar al admin principal
      if (devUsers[userIndex].id === 1) {
        return res.status(400).json({ error: 'No se puede eliminar el usuario administrador principal' });
      }
      
      devUsers.splice(userIndex, 1);
      return res.json({ message: 'Usuario eliminado exitosamente' });
    }
    
    // En modo con BD real, eliminar usuario
    const deleted = await UserModel.deleteUser(userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Registrar en auditoría
    if (currentUserId && req.user) {
      await logManualAction(
        currentUserId,
        req.user.username,
        'DELETE',
        'user',
        userId,
        { deletedUser: userId },
        req
      );
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
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
      // En modo desarrollo sin base de datos, buscar usuario en la lista de desarrollo
      const user = devUsers.find(u => u.username === username);
      
      if (user && user.password === password) {
        // Generar token
        const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          secret,
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Inicio de sesión exitoso (modo desarrollo)',
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
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
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;