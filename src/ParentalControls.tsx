import { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import './ParentalControls.css';

interface ParentalControlsProps {
  onClose: () => void;
  onVolumeChange: (vol: number) => void;
  volume: number;
}

export function ParentalControls({ onClose, onVolumeChange, volume }: ParentalControlsProps) {
  const [pinSetupMode, setPinSetupMode] = useState(false);
  const [authMode, setAuthMode] = useState(true);
  const [pinInput, setPinInput] = useState('');
  
  // Storage states
  const [savedPin, setSavedPin] = useState(localStorage.getItem('stimapp_pin') || '');
  const [securityAnswer, setSecurityAnswer] = useState(localStorage.getItem('stimapp_sec_ans') || '');
  
  const [setupPin, setSetupPin] = useState('');
  const [setupAnswer, setSetupAnswer] = useState('');
  
  const [timeLimit, setTimeLimit] = useState(Number(localStorage.getItem('stimapp_time_limit')) || 0);

  useEffect(() => {
    if (!savedPin) {
      setPinSetupMode(true);
      setAuthMode(false);
    }
  }, [savedPin]);

  const handleSaveSetup = () => {
    if (setupPin.length >= 4 && setupAnswer.length > 2) {
      localStorage.setItem('stimapp_pin', setupPin);
      localStorage.setItem('stimapp_sec_ans', setupAnswer.toLowerCase());
      setSavedPin(setupPin);
      setSecurityAnswer(setupAnswer.toLowerCase());
      setPinSetupMode(false);
      setAuthMode(false);
    } else {
      alert("PIN must be at least 4 digits and security answer must be valid.");
    }
  };

  const handleAuth = () => {
    if (pinInput === savedPin) {
      setAuthMode(false);
    } else {
      alert("Incorrect PIN");
      setPinInput('');
    }
  };

  const handleResetPin = () => {
    const ans = prompt("Security Question: What is your favorite childhood pet's name?");
    if (ans && ans.toLowerCase().trim() === securityAnswer) {
      localStorage.removeItem('stimapp_pin');
      localStorage.removeItem('stimapp_sec_ans');
      setSavedPin('');
      setPinSetupMode(true);
    } else if (ans) {
      alert("Incorrect answer.");
    }
  };

  const handleTimeChange = (mins: number) => {
    setTimeLimit(mins);
    localStorage.setItem('stimapp_time_limit', mins.toString());
  };

  if (pinSetupMode) {
    return (
      <div className="pc-overlay">
        <div className="pc-modal">
          <h2>Welcome to Parental Controls</h2>
          <p>Please set a PIN for future access.</p>
          <input 
            type="password" 
            placeholder="Enter 4+ digit PIN" 
            value={setupPin}
            onChange={e => setSetupPin(e.target.value)}
          />
          <p>Security Question: What is your favorite childhood pet's name?</p>
          <input 
            type="text" 
            placeholder="Security Answer" 
            value={setupAnswer}
            onChange={e => setSetupAnswer(e.target.value)}
          />
          <button onClick={handleSaveSetup} className="pc-btn">Save Setup</button>
          <button onClick={onClose} className="pc-btn cancel">Cancel</button>
        </div>
      </div>
    );
  }

  if (authMode) {
    return (
      <div className="pc-overlay">
        <div className="pc-modal">
          <h2>Parental Controls Access</h2>
          <input 
            type="password" 
            placeholder="Enter PIN" 
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
          />
          <div className="pc-actions">
            <button onClick={handleAuth} className="pc-btn">Unlock</button>
            <button onClick={handleResetPin} className="pc-btn warning">Forgot PIN?</button>
            <button onClick={onClose} className="pc-btn cancel">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getUsageStats = () => {
    try {
      return JSON.parse(localStorage.getItem('stimapp_usage_stats') || '{}');
    } catch {
      return {};
    }
  };

  const stats = getUsageStats();
  const totalSeconds = stats.total || 0;
  
  // Find most used mode
  let mostUsedMode = 'None yet';
  let maxTime = 0;
  ['particles', 'fluid', 'grid', 'aura'].forEach(mode => {
    if (stats[mode] && stats[mode] > maxTime) {
      maxTime = stats[mode];
      mostUsedMode = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
  });

  return (
    <div className="pc-overlay">
      <div className="pc-modal">
        <div className="pc-header-area">
          <img src={logo} alt="StimApp Logo" className="pc-logo" />
          <h2>Parental Controls</h2>
        </div>
        
        <div className="pc-section">
          <h3>Audio Limits</h3>
          <div className="pc-row">
            <label>Master Volume:</label>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={volume} 
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))} 
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="pc-section">
          <h3>App Usage Statistics</h3>
          <div className="pc-stats-grid">
            <div className="pc-stat-item">
              <span className="pc-stat-label">Total Time:</span>
              <span className="pc-stat-value">{formatTime(totalSeconds)}</span>
            </div>
            <div className="pc-stat-item">
              <span className="pc-stat-label">Favorite Mode:</span>
              <span className="pc-stat-value">{mostUsedMode}</span>
            </div>
          </div>
        </div>

        <div className="pc-section">
          <h3>Time Limits (Minutes)</h3>
          <p className="pc-hint">Set to 0 for unlimited time.</p>
          <div className="pc-row">
            <label>Session Limit:</label>
            <input 
              type="number" 
              min="0" max="120"
              value={timeLimit}
              onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <button onClick={onClose} className="pc-btn">Close & Save</button>
      </div>
    </div>
  );
}
