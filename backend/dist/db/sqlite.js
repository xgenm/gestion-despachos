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
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
let db = null;
const initializeTables = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!db)
        return;
    try {
        // Tabla de Despachos
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        despachoNo TEXT,
        fecha DATE,
        hora TIME,
        camion TEXT,
        placa TEXT,
        color TEXT,
        ficha TEXT,
        materials TEXT, 
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
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Equipos
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Operarios
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS operators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);
        // Tabla de Empresas (Clientes que facturan)
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )
    `);
        // Tabla de Clientes
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        companyId INTEGER REFERENCES companies(id)
      )
    `);
        // Tabla de Administradores (Usuarios con autenticación)
        yield db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee' NOT NULL
      )
    `);
        console.log('✓ Tablas SQLite inicializadas correctamente');
    }
    catch (err) {
        console.error('Error al inicializar las tablas:', err);
    }
});
const getConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (db)
        return db;
    try {
        db = yield (0, sqlite_1.open)({
            filename: path_1.default.join(process.cwd(), 'gestion-despachos.db'),
            driver: sqlite3_1.default.Database,
        });
        yield db.configure('busyTimeout', 5000);
        console.log('✓ Conexión a SQLite establecida correctamente');
        yield initializeTables();
        return db;
    }
    catch (err) {
        console.error('Error al conectar a SQLite:', err);
        throw err;
    }
});
exports.default = { open: getConnection, connect: getConnection };
