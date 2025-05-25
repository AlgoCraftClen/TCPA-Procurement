import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar?: string;
  user_id: string;
}

interface MessageContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        try {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        } catch (error) {
          console.error('Error processing new message:', error);
        }
      })
      .subscribe((status, err) => {
        if (err) console.error('Subscription error:', err);
        console.log('Subscription status:', status);
      });

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const newMessage = {
      id: uuidv4(),
      content,
      sender: user.email || 'Anonymous',
      timestamp: new Date().toISOString(),
      user_id: user.id
    };
    
    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    
    const { error } = await supabase
      .from('messages')
      .insert(newMessage);
    
    if (error) {
      // Rollback optimistic update if Supabase fails
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
      throw error;
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .match({ id });

    if (error) {
      throw error;
    }

    setMessages(prev => prev.filter(message => message.id !== id));
  };

  return (
    <MessageContext.Provider value={{ messages, sendMessage, deleteMessage, setMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};