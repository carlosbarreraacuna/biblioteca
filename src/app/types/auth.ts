import api from '../../lib/axios';

export async function login(username: string, password: string) {
  const response = await api.post('/login', {
    username,
    password,
  });

  return response.data;
}

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    console.error('Error en logoutUser:', error);
    throw error; // Re-lanzar el error para manejarlo en el cliente
  }
};