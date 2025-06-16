import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useLocation } from 'react-router-dom';

const InvitadosPage = () => {
  const location = useLocation();
  const { codigoSocio } = location.state || {};

  const [cantidad, setCantidad] = useState(1);
  const navigate = useNavigate();

  const handleIncrement = () => {
    setCantidad(prev => prev + 1);
  };

  const handleDecrement = () => {
    setCantidad(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    // Aceptar solo números positivos mayores o iguales a 1
    if (/^\d*$/.test(value)) { // solo dígitos
      const num = Number(value);
      if (num >= 1 || value === '') {
        setCantidad(value === '' ? '' : num);
      }
    }
  };

  const handleBlur = () => {
    // Si el input queda vacío, poner 1 por defecto
    if (cantidad === '') setCantidad(1);
  };

  const handleSubmit = async () => {
    if (!cantidad || cantidad < 1) {
      alert('Por favor ingresa una cantidad válida (mayor o igual a 1)');
      return;
    }

    const response = await fetch('http://localhost:5000/api/socios/register-invitado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_socio: codigoSocio, cantidad_invitados: cantidad }),
    });

    if (response.ok) {
      alert('¡Invitados registrados correctamente!');
      navigate('/');
    } else {
      alert('Hubo un error al registrar los invitados');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-black to-neutral-700">
      <div className="text-center bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cantidad de Invitados</h2>
        <div className="flex justify-center items-center space-x-4">
          <button onClick={handleDecrement} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md">
            -
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={cantidad}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-20 text-center text-2xl font-semibold border border-gray-400 rounded-lg"
          />
          <button onClick={handleIncrement} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md">
            +
          </button>
        </div>
        <button onClick={handleSubmit} className="mt-6 px-10 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md">
          Registrar Invitados
        </button>
      </div>
    </div>
  );
};

export default InvitadosPage;
