import React, { useEffect, useState, memo } from 'react';
import { io, Socket } from 'socket.io-client';

// Define a type for the progress data
interface ProgressData {
  completed: number;
  total: number;
  percent: number;
}

// Create a singleton socket instance outside component to prevent reconnections
let socket: Socket | null = null;

const getSocket = () => {
  if (!socket) {
    socket = io('https://localhost:4000', {
      transports: ['websocket'],
      rejectUnauthorized: false,
      withCredentials: true,
    });
    
    socket.on('connect', () => {
      console.log(`Socket connected: ${socket?.id}`);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection Error:', error);
    });
  }
  
  return socket;
};

// Use memo to prevent unnecessary re-renders
const ProgressComponent = memo(() => {
  const [progress, setProgress] = useState<ProgressData>({ completed: 0, total: 0, percent: 0 });

  useEffect(() => {
    const socketInstance = getSocket();
    
    // Only add event listener once
    const progressHandler = (data: ProgressData) => {
      setProgress(data);
    };
    
    socketInstance.on('progressUpdate', progressHandler);

    return () => {
      socketInstance.off('progressUpdate', progressHandler);
      // Don't disconnect here, as other components might be using the socket
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="font-medium">진행상황:</span>
        <span>{progress.completed}/{progress.total} ({progress.percent}%)</span>
      </div>
      <progress 
        className="w-full h-2" 
        value={progress.percent} 
        max="100"
      ></progress>
    </div>
  );
});

ProgressComponent.displayName = 'ProgressComponent';

export default ProgressComponent;