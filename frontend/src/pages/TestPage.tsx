import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

interface Option {
  text: string;
}

interface Question {
  text: string;
  options: Option[];
}

interface TestData {
  name: string;
  questions: Question[];
}

const TestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/question/${id}`);
        setTestData(response.data);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError('Не удалось загрузить тест');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Загрузка теста...</div>;
  }

  if (error || !testData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="error-message">{error || 'Тест не найден'}</div>
        <Link to="/" style={{ display: 'inline-block', marginTop: '1rem' }}>Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color)',
      padding: '2rem'
    }}>
      {/* Header Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Назад
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          color: 'var(--primary-color)'
        }}>
          {testData.name}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {testData.questions.map((question, qIndex) => (
            <div 
              key={qIndex}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                {qIndex + 1}. {question.text}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    disabled={true}
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      backgroundColor: '#f9f9f9',
                      cursor: 'not-allowed',
                      color: '#666',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;

