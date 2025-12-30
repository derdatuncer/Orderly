import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

const Login = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!password.trim()) {
      message.warning('Lütfen şifre giriniz');
      return;
    }

    setLoading(true);
    try {
      const user = await login(password);
      
      // Rol'e göre yönlendir
      if (user.role === 'admin') {
        navigate('/admin/tables');
      } else if (user.role === 'waiter') {
        navigate('/waiter/tables');
      } else if (user.role === 'kitchen') {
        navigate('/kitchen/tickets');
      } else {
        message.error('Geçersiz rol');
      }
    } catch (error) {
      message.error('Geçersiz şifre');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }, [password, navigate, message]);

  useEffect(() => {
    // Klavye desteği
    const handleKeyPress = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        setPassword(prev => prev + e.key);
      } else if (e.key === 'Enter') {
        if (password.trim()) {
          handleLogin();
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setPassword(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [password, handleLogin]);

  const handleNumberClick = (num) => {
    setPassword(prev => prev + num);
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPassword('');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h1>Orderly</h1>
          <p>Şifrenizi giriniz</p>
        </div>

        <div className="password-display">
          <Input
            type="password"
            value={password}
            readOnly
            placeholder="Şifre"
            className="password-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />
        </div>

        <div className="keypad-container">
          <div className="keypad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                className="keypad-button"
                onClick={() => handleNumberClick(num.toString())}
                disabled={loading}
              >
                {num}
              </Button>
            ))}
            <Button
              className="keypad-button"
              onClick={() => handleNumberClick('0')}
              disabled={loading}
            >
              0
            </Button>
          </div>
          <div className="keypad-actions">
            <Button
              className="keypad-button action-button"
              onClick={handleBackspace}
              disabled={loading || !password}
            >
              ←
            </Button>
            <Button
              type="primary"
              className="keypad-button action-button login-button"
              onClick={handleLogin}
              loading={loading}
              disabled={!password}
            >
              Giriş
            </Button>
            <Button
              className="keypad-button action-button"
              onClick={handleClear}
              disabled={loading || !password}
            >
              Temizle
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
