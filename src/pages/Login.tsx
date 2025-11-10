import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a nova página de autenticação
    navigate('/auth');
  }, [navigate]);

  return null;
};

export default Login;
