import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const ProgressComponent = () => {
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });

  useEffect(() => {
    socket.on('progressUpdate', (data) => {
      setProgress(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div>
        진행상황: {progress.completed}/{progress.total} ({progress.percent}%)
      </div>
      <progress value={progress.percent} max="100"></progress>
    </div>
  );
};

export default ProgressComponent;