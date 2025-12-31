import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home">
      <Navbar />
      <header className="hero">
        <h1>Create Polls in Seconds</h1>
        <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
        </button>
      </header>
    </div>
  );
}