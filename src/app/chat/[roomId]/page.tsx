'use client';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, Message } from '~/app/types/chat';
import { useParams } from "next/navigation";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;


export default function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const { roomId } = useParams() as { roomId: string };
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();

  // Handle username input
  useEffect(() => {
    if (!username) {
      const name = prompt('Enter your username:') || 'Anonymous';
      setUsername(name);
    }
  }, [username]);

  // Socket connection and room management
  useEffect(() => {
    // Create socket connection with CORS credentials
    socketRef.current = io('http://localhost:80', {
      withCredentials: true,
      transports: ['websocket'], // Ensure WebSocket transport to avoid polling issues
    });
  
    const socket = socketRef.current;
  
    if (roomId) {
      setMessages([]); // Clear messages when changing rooms
      socket.emit('join-room', roomId);
      console.log(`Joined room: ${roomId}`);
    }
  
    // Handle previous messages
    const handlePreviousMessages = (previousMessages: Message[]) => {
      console.log('Previous messages:', previousMessages);
      setMessages(previousMessages);
    };
  
    // Handle incoming messages
    const handleReceiveMessage = (data: Message) => {
      console.log('Received message:', data);
      setMessages(prev => [...prev, data]);
    };
  
    // Register event listeners
    socket.on('previous-messages', handlePreviousMessages);
    socket.on('receive-message', handleReceiveMessage);
  
    // Error handling
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  
    // Cleanup function to prevent memory leaks
    return () => {
      socket.off('previous-messages', handlePreviousMessages);
      socket.off('receive-message', handleReceiveMessage);
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, [roomId]);
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.emit('send-message', {
      message,
      sender: username,
      roomId
    });

    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Chat Room: {roomId}</h1>
      <div className="h-96 overflow-y-auto border rounded p-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <span className="font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
}