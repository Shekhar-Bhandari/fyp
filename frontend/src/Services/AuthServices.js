import api from './api';

const AuthServices = {
  loginUser: async (data) => {
    return await api.post('/auth/login', data); // login endpoint
  },
  registerUser: async (data) => {
    return await api.post('/auth/register', data); // register endpoint
  },
};

export default AuthServices;
