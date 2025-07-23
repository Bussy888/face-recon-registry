import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Container,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Grid
} from '@mui/material';
import { fetchUsersWithPayments, registerEntry } from '../services/faceApiService';
import { useNavigate } from 'react-router-dom';

const CodeSignIn = () => {
  const [codigo, setCodigo] = useState('');
  const [userData, setUserData] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const checkCurrentPayment = (pagos) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    return pagos.some(p => p.año === currentYear && p.mes === currentMonth && p.pagado);
  };

  const handleSubmit = async () => {
    if (!codigo) return;

    setLoading(true);
    setNotFound(false);

    const users = await fetchUsersWithPayments();
    const user = users.find(u => u.codigo === codigo);

    if (!user) {
      setNotFound(true);
      setUserData(null);
      setAccessStatus(null);
      setLoading(false);
      return;
    }

    const pagoAlDia = checkCurrentPayment(user.pagos);
    const now = new Date().toISOString();

    if (pagoAlDia) {
      await registerEntry(user.codigo);
    }

    user.lastSignIn = now;
    setUserData(user);
    setAccessStatus(pagoAlDia ? 'granted' : 'denied');
    setLoading(false);
  };

  const reset = () => {
    setCodigo('');
    setUserData(null);
    setAccessStatus(null);
    setNotFound(false);
    navigate('/');
  };

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
          {!userData ? (
            <>

              <Typography variant="h6" mb={2}>
                Ingrese su Código de Estudiante
              </Typography>

              <TextField
                variant="outlined"
                label="Código"
                fullWidth
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                value={codigo}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, '');
                  setCodigo(onlyNums);
                }}
              />
              <Grid container justifyContent="center" mt={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                    disabled={loading || !codigo}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                  >
                    Volver al Inicio
                  </Button>
                </Grid>
              </Grid>

              {notFound && (
                <Typography color="error" mt={2}>
                  Código no encontrado. Verifique e intente nuevamente.
                </Typography>
              )}
            </>
          ) : (
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
                onClick={reset}
                sx={{ mt: 3 }}
              >
                Continuar
              </Button>

            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default CodeSignIn;
