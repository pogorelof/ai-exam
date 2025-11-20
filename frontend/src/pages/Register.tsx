import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: 'student', // Default role
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      // Exclude confirm_password from the payload
      const { confirm_password, ...payload } = formData;
      
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        params.append(key, value);
      });

      await api.post('/auth/register', params);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map((e: any) => e.msg).join(', '));
      } else if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else {
        setError('Ошибка регистрации');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <h1>Регистрация</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="Имя"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Фамилия"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Подтвердите пароль"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
          <div style={{ marginBottom: '10px', width: '100%' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '10px', color: 'var(--primary-color)' }}>Кто вы?</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.role === 'student'}
                  onChange={() => handleRoleChange('student')}
                  className="custom-checkbox"
                />
                Студент
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.role === 'teacher'}
                  onChange={() => handleRoleChange('teacher')}
                  className="custom-checkbox"
                />
                Преподаватель
              </label>
            </div>
          </div>
          <button type="submit">Зарегистрироваться</button>
        </form>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
