import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Importamos el archivo CSS

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Logo en la parte superior */}
      <img
        src="/Logo-Transmite.png"
        alt="Logo de la Empresa"
        className="homepage-logo"
      />

      <div className="homepage-buttons">
        <Link to="/face-login">
          <button className="homepage-button">Usar Rostro</button>
        </Link>

        <Link to="/code-login">
          <button className="homepage-button">Usar Código</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
