import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
}

interface ClassItem {
  id: number;
  title: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Class creation state
  const [newClassTitle, setNewClassTitle] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const classesResponse = await api.get('/class');
      setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
    } catch (classError) {
      console.error('Error fetching classes:', classError);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        // Fetch user data first
        const userResponse = await api.get('/me');
        setUser(userResponse.data);
        
        // Fetch classes
        await fetchClasses();
        
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle.trim()) return;
    setCreateError(null);

    try {
      await api.post('/class/create', { title: newClassTitle });
      setNewClassTitle('');
      // Refresh class list
      await fetchClasses();
    } catch (err: any) {
      console.error('Error creating class:', err);
      setCreateError('Не удалось создать класс');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Загрузка...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-title">AI Exam</div>
        <div className="user-info">
          {user && <span className="user-name">{user.full_name}</span>}
          <button onClick={handleLogout}>Выход</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Sidebar (Left) */}
        <div className="sidebar-left">
          <h3>Ваши классы</h3>
          {classes.length === 0 ? (
            <p style={{ color: '#666' }}>Классов пока нет</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {classes.map((cls) => (
                <li key={cls.id} style={{ marginBottom: '10px' }}>
                  <Link 
                    to={`/class/${cls.id}`} 
                    style={{ 
                      display: 'block',
                      padding: '10px',
                      border: '1px solid #ddd',
                      color: 'var(--text-color)',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.color = 'var(--primary-color)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.color = 'var(--text-color)';
                    }}
                  >
                    {cls.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content (Right) */}
        <div className="content-right">
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            {user?.role === 'teacher' ? (
              <>
                <h2>Создать новый класс</h2>
                {createError && <div className="error-message">{createError}</div>}
                <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="Название класса" 
                    value={newClassTitle}
                    onChange={(e) => setNewClassTitle(e.target.value)}
                    required
                  />
                  <button type="submit">Создать класс</button>
                </form>
              </>
            ) : (
              <>
                <h2>Добро пожаловать, {user?.full_name}!</h2>
                <p>Выберите класс из меню слева, чтобы начать работу.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
