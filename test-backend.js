const fetch = require('node-fetch');

const BACKEND_URL = 'https://agiletrucker-backend.onrender.com';

async function testBackend() {
  console.log('🧪 Testando conectividade com o backend...');
  
  try {
    // Teste 1: Endpoint raiz
    console.log('\n1. Testando endpoint raiz...');
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    console.log('Status:', rootResponse.status);
    const rootData = await rootResponse.json();
    console.log('Resposta:', rootData);
    
    // Teste 2: Endpoint de saúde
    console.log('\n2. Testando endpoint de saúde...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Resposta:', healthData);
    
    // Teste 3: Endpoint de teste
    console.log('\n3. Testando endpoint de teste...');
    const testResponse = await fetch(`${BACKEND_URL}/test`);
    console.log('Status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Resposta:', testData);
    
    console.log('\n✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error.message);
  }
}

testBackend();
