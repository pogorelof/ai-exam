import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TokenPopup from '../components/TokenPopup';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
}

  interface ClassDetail {
    title: string;
    id: number;
    owner: User;
    members: User[];
  }
  
  interface TestItem {
    name: string;
    id: number;
  }
  
  interface RequestResponse {
  type: string;
  class_obj: {
    title: string;
    id: number;
  };
  students: User[];
}

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<User[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading'>('idle');
  
  const [isTokenPopupOpen, setIsTokenPopupOpen] = useState(false);

  const fetchClassDetail = async () => {
    try {
      // Fetch user info for header
      const meResponse = await api.get('/me');
      const user = meResponse.data;
      setCurrentUser(user);

      // Fetch class data
      const response = await api.get(`/class/${id}`);
      setClassData(response.data);

      // Fetch tests list
      try {
        const testsResponse = await api.get(`/question/class/${id}`);
        setTests(testsResponse.data);
      } catch (testErr) {
        console.error('Error fetching tests:', testErr);
      }

      // If user is owner (teacher), fetch requests
      if (user.role === 'teacher' && response.data.owner.id === user.id) {
        try {
          const requestsResponse = await api.get(`/class/request/show/${id}`);
          setRequests(requestsResponse.data.students || []);
        } catch (reqErr) {
          console.error('Error fetching requests:', reqErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить информацию о классе');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetail();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleJoinClass = async () => {
    if (!id) return;
    setJoinStatus('loading');
    try {
      await api.post(`/class/request/${id}`);
      setJoinStatus('success');
    } catch (err) {
      console.error('Error joining class:', err);
      setJoinStatus('error');
    }
  };

  const handleRequestAction = async (studentId: number, action: 'accept' | 'reject') => {
    if (!id) return;
    try {
      await api.post(`/class/request/${action}/${id}/${studentId}`);
      // Refresh data
      fetchClassDetail();
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      alert(`Не удалось ${action === 'accept' ? 'принять' : 'отклонить'} заявку`);
    }
  };

  const handleDeleteClass = async () => {
    if (!id || deleteConfirmation !== classData?.title) return;
    setDeleteStatus('loading');
    try {
      // The user query said endpoint is /class/delete/{class_id}
      // I'll try DELETE method as it's standard for deletion, but it might be POST if the backend follows the previous RPC pattern.
      // Given previous patterns (create, request, accept), it's highly likely standard REST DELETE or POST. 
      // I'll use api.delete() which sends a DELETE request.
      await api.delete(`/class/delete/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Не удалось удалить класс. Возможно, название введено неверно или произошла ошибка на сервере.');
      setDeleteStatus('idle');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Загрузка...</div>;
  }

  if (error || !classData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="error-message">{error || 'Класс не найден'}</div>
        <Link to="/">Вернуться на главную</Link>
      </div>
    );
  }

  const isMember = currentUser && classData.members.some(member => member.id === currentUser.id);
  const isOwner = currentUser && classData.owner.id === currentUser.id;
  const showJoinButton = currentUser && !isMember && !isOwner && currentUser.role === 'student';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="brand-title">AI Exam</Link>
        <div className="user-info">
          {/* Token Button (Only for Teacher) */}
          {isOwner && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={() => setIsTokenPopupOpen(!isTokenPopupOpen)}
                style={{ 
                  marginRight: '15px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--primary-color)',
                  color: 'var(--primary-color)',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Токен OpenAI
              </button>
              {isTokenPopupOpen && (
                <TokenPopup onClose={() => setIsTokenPopupOpen(false)} />
              )}
            </div>
          )}
          
          {currentUser && <span className="user-name">{currentUser.full_name}</span>}
          <button onClick={handleLogout}>Выход</button>
        </div>
      </header>

      <main className="dashboard-main" style={{ overflow: 'hidden' }}>
        {/* Sidebar - Participants */}
        <div className="sidebar-left" style={{ borderRight: '1px solid #ddd', paddingRight: '1rem', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
          
          {/* Members List */}
          <h3 style={{ flexShrink: 0 }}>Участники ({classData.members.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0, overflowY: 'auto', flex: requests.length > 0 ? '0 1 auto' : 1, maxHeight: requests.length > 0 ? '50%' : '100%' }}>
            {classData.members.length === 0 ? (
              <li style={{ color: '#666', padding: '8px 0' }}>Нет участников</li>
            ) : (
              classData.members.map((member) => (
                <li key={member.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e0e0e0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#555',
                    flexShrink: 0
                  }}>
                    {member.full_name.charAt(0)}
                  </div>
                  <span>{member.full_name}</span>
                </li>
              ))
            )}
          </ul>

          {/* Join Requests (Only for Owner) */}
          {isOwner && requests.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '10px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '150px' }}>
              <h3 style={{ color: 'var(--primary-color)', flexShrink: 0 }}>Заявки ({requests.length})</h3>
              <ul style={{ listStyle: 'none', padding: 0, overflowY: 'auto', flex: 1 }}>
                {requests.map((req) => (
                  <li key={req.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ marginBottom: '5px', fontWeight: 500 }}>{req.full_name}</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'accept')}
                        style={{ padding: '5px 10px', fontSize: '0.8rem', flex: 1 }}
                      >
                        Принять
                      </button>
                      <button 
                        onClick={() => handleRequestAction(req.id, 'reject')}
                        style={{ padding: '5px 10px', fontSize: '0.8rem', flex: 1, backgroundColor: '#d32f2f' }}
                      >
                        Отказать
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content - Class Info */}
        <div className="content-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Teacher Info in Corner */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            background: '#fff', 
            padding: '10px 15px', 
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            fontSize: '0.9rem',
            color: '#555'
          }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Преподаватель:</span> {classData.owner.full_name}
          </div>

          {/* Centered Title */}
          <h1 style={{ 
            fontSize: '3rem', 
            textTransform: 'uppercase', 
            color: 'var(--primary-color)', 
            textAlign: 'center',
            marginTop: '3rem',
            marginBottom: '2rem'
          }}>
            {classData.title}
          </h1>

          {/* Join Button or Content */}
          {showJoinButton ? (
            <div style={{ textAlign: 'center' }}>
              {joinStatus === 'success' ? (
                <div style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Заявка отправлена!
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleJoinClass} 
                    disabled={joinStatus === 'loading'}
                    style={{ padding: '15px 30px', fontSize: '1.2rem' }}
                  >
                    {joinStatus === 'loading' ? 'Отправка...' : 'Отправить заявку на вступление'}
                  </button>
                  {joinStatus === 'error' && (
                    <div className="error-message" style={{ marginTop: '10px' }}>
                      Не удалось отправить заявку
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Placeholder for future content (Only visible if member or owner) */
            <div style={{ 
              width: '100%', 
              maxWidth: '800px', 
              maxHeight: 'calc(100vh - 250px)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px', 
                width: '100%',
                padding: '5px', // Add padding for scrollbar space and box shadow visibility
                marginBottom: '20px' // Space before buttons
              }}>
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => navigate(`/test/${test.id}`)}
                      style={{
                        width: '100%',
                        padding: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: '80px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                        {test.name}
                      </span>
                    </button>
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#777', padding: '2rem', background: 'white', borderRadius: '8px' }}>
                    Список тестов пуст
                  </div>
                )}
              </div>
              
              {/* Teacher controls: Create Question & Delete Class */}
              {isOwner && (
                <div style={{ marginTop: 'auto', paddingTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                   <button 
                    onClick={() => navigate(`/class/${id}/create-question`)}
                    style={{ 
                      backgroundColor: 'var(--primary-color)',
                      color: 'white', 
                      fontSize: '0.9rem',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Создать вопросы
                  </button>
                  
                   <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    style={{ 
                      backgroundColor: '#d32f2f',
                      color: 'white', 
                      fontSize: '0.9rem',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить класс
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#d32f2f', marginTop: 0 }}>Удаление класса</h2>
            <p>Это действие необратимо. Пожалуйста, введите <strong>{classData.title}</strong>, чтобы подтвердить удаление.</p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Название класса"
              style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation('');
                }}
                style={{ backgroundColor: '#ccc', color: '#333' }}
              >
                Отмена
              </button>
              <button 
                onClick={handleDeleteClass}
                disabled={deleteConfirmation !== classData.title || deleteStatus === 'loading'}
                style={{ 
                  backgroundColor: '#d32f2f', 
                  opacity: (deleteConfirmation !== classData.title || deleteStatus === 'loading') ? 0.5 : 1,
                  cursor: (deleteConfirmation !== classData.title || deleteStatus === 'loading') ? 'not-allowed' : 'pointer'
                }}
              >
                {deleteStatus === 'loading' ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
