"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
dotenv_1.default.config();
// Configuración de la base de datos PostgreSQL
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Deshabilitar SSL para desarrollo local
});
// Función para inicializar las tablas
const initializeTables = () => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    try {
        client = yield pool.connect();
        // Tabla de Despachos
        yield client.query(`
      CREATE TABLE IF NOT EXISTS dispatches (
        id SERIAL PRIMARY KEY,
        despachoNo TEXT,
        fecha DATE,
        hora TIME,
        camion TEXT,
        placa TEXT,
        color TEXT,
        ficha TEXT,
        materials TEXT, -- JSON string
        cliente TEXT,
        celular TEXT,
        recibido TEXT,
        total DECIMAL(10, 2),
        userId INTEGER,
        equipmentId INTEGER,
        operatorId INTEGER
      )
    `);
        // Tabla de Usuarios (Empresas)
        yield client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Equipos
        yield client.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Operarios
        yield client.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Empresas (Clientes que facturan)
        yield client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )
    `);
        // Tabla de Clientes
        yield client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        companyId INTEGER REFERENCES companies(id)
      )
    `);
        // Inicializar tabla de administradores
        yield User_1.UserModel.createTable();
        console.log('Tablas inicializadas correctamente');
    }
    catch (err) {
        console.error('Error al inicializar las tablas:', err);
        console.log('La aplicación continuará ejecutándose. Las tablas se crearán cuando se establezca la conexión a la base de datos.');
    }
    finally {
        if (client) {
            client.release();
        }
    }
});
// Inicializar tablas cuando se inicie la aplicación
// No esperamos a que se complete para no bloquear el inicio del servidor
initializeTables().catch(err => {
    console.error('Error durante la inicialización de tablas:', err);
});
// Función para verificar la conexión a la base de datos
const checkDatabaseConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        yield client.query('SELECT NOW()');
        client.release();
        console.log('Conexión a la base de datos establecida correctamente');
        return true;
    }
    catch (err) {
        console.error('No se pudo conectar a la base de datos:', err);
        return false;
    }
});
// Verificar la conexión cada 30 segundos si falla inicialmente
const startConnectionChecker = () => {
    const checkConnection = () => __awaiter(void 0, void 0, void 0, function* () {
        const isConnected = yield checkDatabaseConnection();
        if (!isConnected) {
            console.log('Reintentando conexión en 30 segundos...');
            setTimeout(checkConnection, 30000);
        }
        else {
            // Si la conexión se establece, intentar inicializar las tablas
            initializeTables().catch(err => {
                console.error('Error al inicializar tablas después de conectar:', err);
            });
        }
    });
    checkConnection();
};
// Iniciar el verificador de conexión
startConnectionChecker();
exports.default = pool;
//# sourceMappingURL=database.js.map