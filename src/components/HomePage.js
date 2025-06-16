import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Importamos el archivo CSS

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Logo en la parte superior */}
      <img
        src="/logo.png"
        alt="Logo de la Empresa"
        className="homepage-logo"
      />

      <div className="homepage-buttons">
        <Link to="/signup">
          <button className="homepage-button">Registrarme Por Primera Vez</button>
        </Link>

        <Link to="/signin">
          <button className="homepage-button">Registrarme</button>
        </Link>
        
        <Link to="/invitados">
          <button className="homepage-button">Solo Invitados</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
