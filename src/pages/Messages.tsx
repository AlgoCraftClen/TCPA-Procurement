import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Send, Image, Paperclip, SmilePlus, Trash2, Edit } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  user_id: string;
  avatar?: string;
  isTemp?: boolean;
}

const Messages: React.FC = () => {
  const { messages, sendMessage, deleteMessage, setMessages } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{id: string; email?: string}|null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email
        });
      }
    };
    fetchUser();
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Add temporary local message immediately
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        sender: user?.email || 'You',
        timestamp: new Date().toISOString(),
        user_id: user?.id || ''
      };
      
      setMessages((prev: Message[]) => [...prev, tempMessage]);
      setNewMessage('');
      
      // Scroll to bottom to show new message
      setTimeout(scrollToBottom, 100);
      
      // Send to Supabase
      await sendMessage(newMessage);
      
      // Remove temp message and replace with confirmed one
      setMessages((prev: Message[]) => prev.filter(m => m.id !== tempMessage.id));
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Team Chat</h1>
          <p className="text-sm text-gray-500">Collaborate with your team members</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.user_id === user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <img
                src={message.avatar || `https://ui-avatars.com/api/?name=${message.sender}`}
                alt={message.sender}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div
                className={`flex flex-col ${
                  message.user_id === user?.id ? 'items-end' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </span>
                  {message.user_id === user?.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`mt-1 px-4 py-2 rounded-lg max-w-md ${
                    message.user_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Add emoji"
                >
                  <SmilePlus size={18} />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Upload image"
                >
                  <Image size={18} />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isLoading || !newMessage.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              <Send size={18} />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;