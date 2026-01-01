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

  useEffect(() => {
    // Change this to your live Render backend URL after deployment
    socket = io('http://localhost:5000'); // ← Replace with your backend URL

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <p className="text-white text-2xl">Loading poll...</p>
      </div>
    );
  }

  const totalVotes = results.options.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = results.expired;
  const shareUrl = window.location.href;

  const chartData = {
    labels: results.options.map(o => o.text),
    datasets: [{
      data: results.options.map(o => o.votes),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barThickness: 30
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1000 }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pt-20 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
            {/* Question */}
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
              {poll.question}
            </h1>

            {/* Expiry Status - Compact */}
            {isExpired ? (
              <div className="text-center p-4 bg-red-100 rounded-xl mb-6">
                <p className="text-xl font-bold text-red-700">Poll Expired</p>
                <p className="text-sm text-gray-600 mt-1">
                  Closed on {new Date(results.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ) : results.expiresAt ? (
              <div className="text-center p-4 bg-yellow-100 rounded-xl mb-6">
                <p className="text-lg font-bold text-orange-700">Time Remaining</p>
                <p className="text-2xl font-extrabold text-orange-600">
                  {(() => {
                    const diff = new Date(results.expiresAt) - new Date();
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                  })()}
                </p>
              </div>
            ) : null}

            {/* Voting Options */}
            {!isExpired && !hasVoted && (
              <div className="space-y-4 mb-6">
                {poll.options.map((option, i) => (
                  <label
                    key={i}
                    className={`block p-5 rounded-xl cursor-pointer transition-all ${
                      selected === i
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white/80 hover:bg-white shadow'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vote"
                      checked={selected === i}
                      onChange={() => setSelected(i)}
                      className="sr-only"
                    />
                    <span className="text-lg font-medium">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Vote Button or Thank You */}
            {!isExpired && !hasVoted && (
              <button
                onClick={handleVote}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                Vote Now
              </button>
            )}

            {hasVoted && !isExpired && (
              <p className="text-center text-2xl font-bold text-green-600 mb-6">
                Thank you for voting! 🌟
              </p>
            )}

            {/* Live Chart - Compact */}
            <div className="mt-6 bg-white/70 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
                Live Results ({totalVotes} votes)
              </h2>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Share Buttons - Compact Icons */}
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold mb-4 text-gray-800">Share</p>
              <div className="flex justify-center gap-5">
                <a
                  href={`https://api.whatsapp.com/send?text=Vote on this poll: ${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 p-4 rounded-full shadow hover:bg-green-600 transition"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-7 h-7" />
                </a>

                <a
                  href={`mailto:?subject=Vote on this poll&body=Check out this poll: ${encodeURIComponent(shareUrl)}`}
                  className="bg-gray-700 p-4 rounded-full shadow hover:bg-gray-800 transition"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied!');
                  }}
                  className="bg-gray-600 p-4 rounded-full shadow hover:bg-gray-700 transition"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Link to Results */}
            <div className="mt-6 text-center">
              <Link to={`/results/${id}`} className="text-blue-600 font-medium hover:underline">
                View Full Results →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}