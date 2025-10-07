import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../config/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const Messaging = ({ bookingId, providerId, customerId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchMessages();
    }
  }, [bookingId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/booking/${bookingId}`);
      setMessages(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/api/messages', {
        bookingId,
        content: newMessage,
        senderId: user._id
      });

      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (senderId) => {
    return senderId === user._id;
  };

  if (loading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }

  return (
    <Card className="mt-6">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Messages</h3>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((message) => (
              <div 
                key={message._id} 
                className={`flex ${isOwnMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage(message.senderId) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage(message.senderId) ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="flex items-center"
          >
            <i className="fas fa-paper-plane mr-2"></i> Send
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Messaging;