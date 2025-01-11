// app/page.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(7);
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button 
        onClick={createRoom}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg"
      >
        Create New Chat Room
      </button>
    </div>
  );
}