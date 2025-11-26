import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const CreateQuestion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [questionNumbers, setQuestionNumbers] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/question/create', {
        name,
        is_test: true,
        class_id: Number(id),
        question_numbers: questionNumbers,
      });

      if (response.data && response.data.theme_id) {
        // Navigate to the new question page (same as TestPage logic)
        // Using replace to prevent going back to the form
        navigate(`/test/${response.data.theme_id}`, { replace: true });
      } else {
        // Fallback if theme_id is missing (though unexpected per specs)
        // Navigate back to class details
         navigate(`/class/${id}`);
      }
    } catch (err: any) {
      console.error('Error creating questions:', err);
      setError(err.response?.data?.detail || 'Не удалось создать вопросы. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-color)',
      padding: '2rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px', 
        backgroundColor: 'white', 
        padding: '2.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: 'var(--primary-color)',
          fontSize: '1.8rem'
        }}>
          Создание новых вопросов
        </h2>

        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Название темы/теста
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Например: Как правильно спать"
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #ccc',
                fontSize: '1rem',
                boxSizing: 'border-box' 
              }}
            />
          </div>

          {/* Is Test Field (Disabled, Default Yes) */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Это тест?
            </label>
            <select
              disabled
              value="true"
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #ccc',
                fontSize: '1rem',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
                boxSizing: 'border-box' 
              }}
            >
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </div>

          {/* Question Numbers Field */}
          <div className="form-group">
            <label htmlFor="questionNumbers" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Количество вопросов
            </label>
            <input
              id="questionNumbers"
              type="number"
              min="1"
              max="20"
              value={questionNumbers}
              onChange={(e) => setQuestionNumbers(parseInt(e.target.value))}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #ccc',
                fontSize: '1rem',
                boxSizing: 'border-box' 
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '14px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Создание...' : 'Создать вопросы'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to={`/class/${id}`} style={{ color: '#666', textDecoration: 'none' }}>
            Отмена
          </Link>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ 
              width: '50px', 
              height: '50px', 
              border: '5px solid #f3f3f3', 
              borderTop: '5px solid var(--primary-color)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h3 style={{ color: 'var(--primary-color)' }}>Генерация вопросов...</h3>
            <p style={{ color: '#666' }}>Это может занять некоторое время</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CreateQuestion;

