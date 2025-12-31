import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

let socket;

export default function VotingPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
const [showShareOptions, setShowShareOptions] = useState(false);
  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('joinPoll', id);

    socket.on('updateResults', (data) => {
      setResults((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
    });

    const fetchData = async () => {
      try {
        const [pollRes, resultsRes] = await Promise.all([
          axios.get(`/api/polls/${id}`),
          axios.get(`/api/polls/results/${id}`)
        ]);
        setPoll(pollRes.data);
        setResults(resultsRes.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchData();

    return () => socket.disconnect();
  }, [id]);

  const handleVote = async () => {
    if (selected === null) return alert('Please select an option');
    if (results.expired) return alert('This poll has expired');

    try {
      await axios.post(`/api/polls/vote/${id}`, { optionIndex: selected });
      setHasVoted(true);
    } catch (err) {
      alert(err.response?.data?.msg || 'Cannot vote');
    }
  };

  if (loading) return <div className="text-center text-white pt-32">Loading poll...</div>;

  const totalVotes = results.options.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = results.expired;

  const chartData = {
    labels: results.options.map(o => o.text),
    datasets: [{ data: results.options.map(o => o.votes), backgroundColor: '#06b6d4', borderRadius: 6 }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1000 }
  };

  const shareUrl = window.location.href;

 return (
  <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pt-20 p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
          <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
            {poll.question}
          </h1>

          {/* Expiry Messages */}
          {isExpired ? (
            <div className="text-center p-10 bg-red-100/80 rounded-2xl mb-8">
              <p className="text-3xl font-bold text-red-700">Poll Expired ⏰</p>
              <p className="text-xl text-gray-700 mt-4">
                Closed on {new Date(results.expiresAt).toLocaleString()}
              </p>
            </div>
          ) : results.expiresAt ? (
            <div className="text-center p-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl mb-8 border border-yellow-300">
              <p className="text-2xl font-bold text-orange-700">Time Remaining</p>
              <p className="text-4xl font-extrabold text-orange-600 mt-3">
                {(() => {
                  const diff = new Date(results.expiresAt) - new Date();
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
                })()}
              </p>
            </div>
          ) : null}

          {/* Voting Options */}
          {!isExpired && !hasVoted && (
            <div className="space-y-5 mb-10">
              {poll.options.map((option, i) => (
                <label
                  key={i}
                  className={`block p-6 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                    selected === i
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl'
                      : 'bg-white/70 hover:bg-white shadow-lg'
                  }`}
                >
                  <input
                    type="radio"
                    name="vote"
                    checked={selected === i}
                    onChange={() => setSelected(i)}
                    className="sr-only"
                  />
                  <span className="text-xl font-semibold">{option}</span>
                </label>
              ))}
            </div>
          )}

          {!isExpired && !hasVoted && (
            <button
              onClick={handleVote}
              className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition transform hover:-translate-y-2"
            >
              Vote Now 🚀
            </button>
          )}

          {hasVoted && !isExpired && (
            <p className="text-center text-3xl font-bold text-green-600 mb-10">Thank you for voting! 🌟</p>
          )}

          {/* Live Chart */}
          <div className="mt-12 bg-white/60 rounded-3xl p-8 shadow-inner">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Live Results ({totalVotes} votes)
            </h2>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
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
    </div>
  </>
);
}