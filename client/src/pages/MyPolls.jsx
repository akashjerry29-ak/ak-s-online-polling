import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MyPolls() {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/auth');

    axios.get('/api/my-polls', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPolls(res.data))
      .catch(() => navigate('/auth'));
  }, [navigate]);

  return (
    <>
      <Navbar />
        <div className="page-container">
      <div className="glass-card max-w-2xl w-full mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">My Polls</h1>

          {polls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-8">You haven't created any polls yet.</p>
              <Link to="/create" className="bg-cyan-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-cyan-700 transition">
                Create Your First Poll
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {polls.map(poll => (
                <div key={poll.pollId} className="bg-gray-50 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{poll.question}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Created on {new Date(poll.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/poll/${poll.pollId}`}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Vote Page
                    </Link>
                    <Link
                      to={`/results/${poll.pollId}`}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      View Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}