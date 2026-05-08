import React, { useState } from 'react';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';

function App() {
  const [passcode, setPasscode] = useState(null);

  const handleJoin = (code) => {
    setPasscode(code);
  };

  const handleLeave = () => {
    // Clear passcode from memory
    setPasscode(null);
  };

  return (
    <>
      {!passcode ? (
        <JoinRoom onJoin={handleJoin} />
      ) : (
        <ChatRoom passcode={passcode} onLeave={handleLeave} />
      )}
    </>
  );
}

export default App;
