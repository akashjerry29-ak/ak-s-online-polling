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
    // Change this to your live Render backend URL after deploy
    socket = io('http://localhost:5000'); // ← Replace with https://your-backend.onrender.com

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

  if (loading) return <div className="text-center text-white pt-32 text-2xl">Loading results...</div>;

  const totalVotes = results.options.reduce((sum, o) => sum + o.votes, 0);
  const isExpired = results.expired;
  const shareUrl = window.location.origin + `/poll/${id}`; // Correct voting link

  const chartData = {
    labels: results.options.map(o => o.text),
    datasets: [{
      data: results.options.map(o => o.votes),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barThickness: 35
    }]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1200 }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pt-20 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
              {results.question}
            </h1>

            {/* Expired Message */}
            {isExpired && (
              <div className="text-center p-10 bg-red-100/80 rounded-2xl mb-8 border border-red-300">
                <p className="text-3xl font-bold text-red-700">Poll Expired</p>
                <p className="text-xl text-red-600 mt-4">
                  Closed on {new Date(results.expiresAt).toLocaleString()}
                </p>
              </div>
            )}

            <p className="text-center text-2xl mb-10 font-semibold text-gray-800">
              Total Votes: <span className="font-bold text-blue-600">{totalVotes}</span>
            </p>

            {/* Chart */}
            <div className="bg-white/60 rounded-3xl p-8 shadow-inner mb-12">
              <div className="h-96">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

<div className="mt-12 text-center">
  <p className="text-2xl font-bold mb-8 text-gray-800">Share this poll</p>

  <div className="flex flex-wrap justify-center gap-6">
    {/* WhatsApp */}
    <a 
      href={`https://api.whatsapp.com/send?text=Vote on this poll: ${encodeURIComponent(shareUrl)}`}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-green-500 text-white px-8 py-5 rounded-2xl font-semibold shadow-xl hover:bg-green-600 hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
      WhatsApp
    </a>

    {/* Email */}
    <a 
      href={`mailto:?subject=Vote on this poll&body=Check out this poll and vote:%0A${encodeURIComponent(shareUrl)}`}
      className="flex items-center gap-4 bg-gray-700 text-white px-8 py-5 rounded-2xl font-semibold shadow-xl hover:bg-gray-800 hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
      Email
    </a>

    {/* Facebook */}
    <a 
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-blue-600 text-white px-8 py-5 rounded-2xl font-semibold shadow-xl hover:bg-blue-700 hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-8 h-8" />
      Facebook
    </a>

    {/* LinkedIn */}
    <a 
      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-blue-700 text-white px-8 py-5 rounded-2xl font-semibold shadow-xl hover:bg-blue-800 hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" className="w-8 h-8" />
      LinkedIn
    </a>

    {/* Copy Link */}
    <button
      onClick={() => {
        navigator.clipboard.writeText(shareUrl);
        alert('Poll link copied! 📋');
      }}
      className="flex items-center gap-4 bg-gray-600 text-white px-8 py-5 rounded-2xl font-semibold shadow-xl hover:bg-gray-700 hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Copy Link
    </button>
  </div>
</div>

            <div className="mt-10 text-center">
              <Link to={`/poll/${id}`} className="text-blue-600 font-bold text-lg hover:underline">
                ← Back to Voting
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}