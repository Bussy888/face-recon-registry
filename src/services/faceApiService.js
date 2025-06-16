import jsonServerInstance from "../api/jsonInstance";

export const fetchUsersWithPayments = async () => {
  try {
    const response = await jsonServerInstance.get('/socios/get-users-with-payments');
    return response.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const registerEntry = async (codigo_socio) => {
  try {
    await jsonServerInstance.post('/socios/register-entry', { codigo_socio });
  } catch (error) {
    console.error('Error registrando entrada:', error);
  }
};
