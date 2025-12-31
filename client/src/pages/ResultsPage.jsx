import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

let socket;

export default function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
const [showShareOptions, setShowShareOptions] = useState(false);
  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('joinPoll', id);

    socket.on('updateResults', (data) => {
      setResults((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
    });

    const fetch = async () => {
      try {
        const res = await axios.get(`/api/polls/results/${id}`);
        setResults(res.data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetch();

    return () => socket.disconnect();
  }, [id]);

  if (loading) return <div className="text-center text-white pt-32">Loading results...</div>;

  const totalVotes = results.options.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = results.expired;

  const chartData = {
    labels: results.options.map(o => o.text),
    datasets: [{ data: results.options.map(o => o.votes), backgroundColor: '#06b6d4', borderRadius: 8 }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1200 }
  };

  const shareUrl = `http://localhost:5173/poll/${id}`;

  return (
    <>
      <Navbar />
        <div className="page-container">
      <div className="glass-card max-w-2xl w-full mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">{results.question}</h1>

          {/* Expired Message */}
          {isExpired && (
            <div className="text-center p-8 bg-red-100 rounded-2xl mb-8 border border-red-300">
              <p className="text-3xl font-bold text-red-700">Poll Expired</p>
              <p className="text-xl text-red-600 mt-4">
                This poll closed on {new Date(results.expiresAt).toLocaleString()}
              </p>
            </div>
          )}

          <p className="text-center text-xl mb-8">
            Total Votes: <span className="font-bold text-cyan-600">{totalVotes}</span>
          </p>

          <div className="h-80 mb-10">
            <Bar data={chartData} options={chartOptions} />
          </div>

         <div className="mt-12 text-center">
  <p className="text-xl font-semibold mb-6 text-gray-800">Share this poll</p>

  <div className="flex justify-center gap-6">
    {/* Copy Link Button */}
    <button
      onClick={() => {
        navigator.clipboard.writeText(shareUrl);
        alert('Poll link copied to clipboard! 📋');
      }}
      className="flex items-center gap-3 bg-gray-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-800 transition transform hover:scale-105"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Copy Link
    </button>

    {/* Share Button with Dropdown */}
    <div className="relative">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 2.684C17.114 12.938 17 12.482 17 12c0-.482.114-.938.316-1.342m-9.632 2.684a3 3 0 109.632-2.684m0 0a3 3 0 11-9.632 2.684" />
        </svg>
        Share
      </button>

      {showShareOptions && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl py-4 px-6 w-64 z-10 border border-gray-200">
          <a href={`https://api.whatsapp.com/send?text=Vote on this poll: ${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
            <span className="font-medium">WhatsApp</span>
          </a>
          <a href={`mailto:?subject=Vote on this poll&body=Check out this poll: ${encodeURIComponent(shareUrl)}`} className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span className="font-medium">Email</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-8 h-8" />
            <span className="font-medium">Facebook</span>
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" className="w-8 h-8" />
            <span className="font-medium">LinkedIn</span>
          </a>
        </div>
      )}
    </div>
  </div>
</div>
        </div>
      </div>
    </>
  );
}