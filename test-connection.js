const { default: fetch } = require('node-fetch');

async function testConnection() {
  try {
    console.log('Probando conexión con el backend...');
    
    // Primero probamos el endpoint de prueba
    const testResponse = await fetch('http://localhost:3002/api/test');
    const testData = await testResponse.json();
    console.log('Endpoint de prueba:', testData);
    
    // Ahora probamos el endpoint de login con una solicitud POST
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Respuesta del login:', loginData);
    
    if (loginResponse.ok) {
      console.log('¡Inicio de sesión exitoso!');
      console.log('Token:', loginData.token);
    } else {
      console.log('Error en el login:', loginData.error);
    }
  } catch (error) {
    console.log('Error de conexión:', error.message);
  }
}

testConnection();