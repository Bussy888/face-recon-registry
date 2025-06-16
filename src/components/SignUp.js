import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom'; // Cambié useHistory por useNavigate
const SignUp = () => {
  const [codigo, setCodigo] = useState('');
  const [socioValido, setSocioValido] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const initializeFaceApi = async () => {
    try {
      await faceapi.tf.setBackend('webgl');
      await faceapi.tf.ready();
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CPU backend');
      await faceapi.tf.setBackend('cpu');
      await faceapi.tf.ready();
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  };

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('Error accessing camera: ', err);
          alert('No se pudo acceder a la cámara.');
        });
    } else {
      alert('Tu navegador no soporta acceso a la cámara.');
    }
  };

  useEffect(() => {
    initializeFaceApi();
  }, []);

  const verificarSocio = async () => {
    if (!codigo) {
      alert('Por favor, ingresa el código.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/socios/verify-socio/${codigo}`);
      const data = await res.json();

      if (res.ok) {
        if (data.face_descriptor) {
          alert('Este socio ya tiene un face descriptor registrado.');
          return;
        }
        setSocioValido(true);
        setIsCameraActive(true);
        startVideo();
      } else {
        alert('Socio no encontrado.');
      }
    } catch (error) {
      console.error('Error al verificar socio:', error);
    }
  };

  const handleCapture = async () => {
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if (detections) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/png');
      setImageSrc(image);
      setIsCameraActive(false);

      setFaceDescriptor(Array.from(detections.descriptor));
    } else {
      alert('No se detectó ninguna cara, intenta nuevamente.');
    }
  };

  const handleGuardar = async () => {
    if (!faceDescriptor) {
      alert('No hay face descriptor capturado.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/socios/update-face-descriptor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, face_descriptor: faceDescriptor }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Face descriptor guardado exitosamente.');
        await registerEntry(codigo);
        navigate('/'); // Redirige al inicio

      } else {
        alert('Error al guardar face descriptor: ' + data.message);
      }
    } catch (error) {
      console.error('Error guardando descriptor:', error);
    }
  };

  const registerEntry = async (codigo_socio) => {
    try {
      const response = await fetch('http://localhost:5000/api/socios/register-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_socio }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Entrada registrada con éxito:', data);
        alert('Entrada registrada exitosamente.');
      } else {
        console.error('Error al registrar la entrada:', data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud de registro de entrada:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black to-neutral-700 p-4">
      {!socioValido ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Verificar Socio</h2>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Carnet de Identidad"
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={verificarSocio}
            className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            Verificar
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          {isCameraActive ? (
            <div className="text-center">
              <video ref={videoRef} autoPlay muted className="w-full h-auto rounded-lg mb-4"></video>
              <button
                onClick={handleCapture}
                className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
              >
                Capturar Imagen
              </button>
            </div>
          ) : (
            <>
              {imageSrc && (
  <>
    <img src={imageSrc} alt="Captured" className="w-full h-auto rounded-lg mb-4" />
    <div className="flex gap-4">
      <button
        onClick={handleGuardar}
        className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
      >
        Guardar Face Descriptor
      </button>
      <button
        onClick={() => {
          setImageSrc(null);
          setIsCameraActive(true);
          setFaceDescriptor(null);
        }}
        className="flex-1 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600"
      >
        Volver a tomar foto
      </button>
    </div>
  </>
)}

            </>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default SignUp;
