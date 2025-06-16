import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { fetchUsersWithPayments, registerEntry } from '../services/faceApiService';

const SignIn = () => {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const videoRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const initializeFaceApi = async () => {
    try {
      await faceapi.tf.setBackend('webgl');
      await faceapi.tf.ready();
    } catch {
      await faceapi.tf.setBackend('cpu');
      await faceapi.tf.ready();
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    initializeFaceApi().then(startVideo);
  }, []);

  const checkCurrentPayment = (pagos) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    return pagos.some(p => p.año === currentYear && p.mes === currentMonth && p.pagado);
  };

  const handleFaceRecognition = async (detection) => {
    if (!detection?.descriptor) return;

    const users = await fetchUsersWithPayments();
    let matchFound = false;

    for (const user of users) {
      const descriptor = new Float32Array(Object.values(user.faceDescriptor || {}));
      if (descriptor.length !== 128) continue;

      const distance = faceapi.euclideanDistance(detection.descriptor, descriptor);
      if (distance < 0.6) {
        matchFound = true;
        const now = new Date().toISOString();
        user.lastSignIn = now;
        setUserData(user);
        setSignInSuccess(true);
        setIsCameraActive(false);

        const pagoAlDia = checkCurrentPayment(user.pagos);
        setAccessStatus(pagoAlDia ? 'granted' : 'denied');

        if (pagoAlDia) {
          await registerEntry(user.codigo);
        }

        break;
      }
    }

    if (!matchFound) {
      setNoMatchFound(true);
      setSignInSuccess(false);
      setUserData(null);
      setAccessStatus(null);
    }
  };

  const resetSignIn = () => {
    setIsCameraActive(false);
    setTimeout(() => {
      setSignInSuccess(false);
      setUserData(null);
      setAccessStatus(null);
      setNoMatchFound(false);
      setIsCameraActive(true);
      startVideo();
    }, 200);
  };

  const detectFace = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) handleFaceRecognition(detection);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isCameraActive) detectFace();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isCameraActive]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #000, #444)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4
    }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img
            src="/Logo-Transmite.png"
            alt="Logo"
            style={{
              maxWidth: isMobile ? '80%' : '60%',
              height: 'auto'
            }}
          />
        </Box>

        <Paper elevation={6} sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: '#fff'
        }}>
          {isCameraActive ? (
            <>
              <Box sx={{
                width: '100%',
                aspectRatio: '4/3',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#000'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Typography variant="h6" mt={2}>
                Detectando rostro...
              </Typography>
            </>
          ) : signInSuccess && userData ? (
            <>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={accessStatus === 'granted' ? 'green' : 'error'}
              >
                {accessStatus === 'granted' ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO'}
              </Typography>
              <Typography>
                {accessStatus === 'granted'
                  ? 'SU ASISTENCIA FUE REGISTRADA CON ÉXITO'
                  : 'SU ASISTENCIA NO SERÁ REGISTRADA'}
              </Typography>

              <Typography variant="h6" mt={2}>
                ¡Bienvenido, {userData.nombre} {userData.apellido}!
              </Typography>
              <Typography>
                Código de Estudiante: <strong>{userData.codigo}</strong>
              </Typography>
              <Typography>
                Carrera: <strong>{userData.tipoSocio}</strong>
              </Typography>
              <Typography>
                Último ingreso:{' '}
                <strong>
                  {new Date(userData.lastSignIn).toLocaleString('es-BO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </Typography>

              {accessStatus === 'denied' && (
                <Typography color="error" mt={2}>
                  Por favor, apersónese a pagar su cuota del mes actual para habilitar su ingreso.
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={resetSignIn}
                sx={{ mt: 3 }}
              >
                Continuar
              </Button>
            </>
          ) : noMatchFound ? (
            <>
              <Typography color="error">
                Rostro no reconocido. Por favor, intente nuevamente.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={resetSignIn}
                sx={{ mt: 2 }}
              >
                Reintentar
              </Button>
            </>
          ) : (
            <CircularProgress />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;
