
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';


console.log("Iniciando aplicação...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  console.log("Root element encontrado, montando React...");

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
  console.log("React montado com sucesso (teoricamente).");
} catch (error) {
  console.error("ERRO FATAL NA INICIALIZAÇÃO:", error);
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Erro Fatal</h1><p>${error}</p></div>`;
}
