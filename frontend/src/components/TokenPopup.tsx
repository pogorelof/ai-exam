import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

interface TokenPopupProps {
  onClose: () => void;
}

const TokenPopup: React.FC<TokenPopupProps> = ({ onClose }) => {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch existing token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await api.get('/ai/token/get');
        // Assuming response.data is { token: "..." }
        if (response.data && response.data.token) {
          setCurrentToken(response.data.token);
        }
      } catch (err: any) {
        // If 404 or specific "no token" message
        if (err.response && err.response.data && err.response.data.detail === "You don`t have openai token") {
           setCurrentToken(null);
        } else {
           console.error("Error fetching token:", err);
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/ai/token/save', { token: newToken });
      setMessage({ text: 'Токен успешно сохранен', type: 'success' });
      setCurrentToken(newToken); // Optimistically update
      setNewToken('');
    } catch (err) {
      console.error("Error saving token:", err);
      setMessage({ text: 'Не удалось сохранить токен', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={popupRef}
      style={{
        position: 'absolute',
        top: '60px', // Adjust based on header height
        right: '20px',
        width: '300px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '20px',
        zIndex: 1000,
        border: '1px solid #e0e0e0'
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#333' }}>OpenAI Настройки</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: 600, color: '#555' }}>Текущий токен: </span>
        {fetchLoading ? (
          <span style={{ color: '#888' }}>Загрузка...</span>
        ) : currentToken ? (
          <div style={{ 
            marginTop: '5px', 
            wordBreak: 'break-all', 
            backgroundColor: '#f5f5f5', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#333',
            maxHeight: '60px',
            overflowY: 'auto'
          }}>
            {currentToken.substring(0, 10)}...{currentToken.substring(currentToken.length - 5)}
          </div>
        ) : (
          <span style={{ color: '#d32f2f', fontStyle: 'italic' }}>Токен не установлен</span>
        )}
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
          Добавить/сменить токен
        </label>
        <input
          type="text"
          value={newToken}
          onChange={(e) => setNewToken(e.target.value)}
          placeholder="sk-..."
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '0.9rem',
            boxSizing: 'border-box',
            marginBottom: '10px'
          }}
        />
        <button
          onClick={handleSave}
          disabled={loading || !newToken.trim()}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || !newToken.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !newToken.trim()) ? 0.7 : 1,
            fontSize: '0.9rem'
          }}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {message && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          borderRadius: '4px', 
          backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          fontSize: '0.85rem',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default TokenPopup;

