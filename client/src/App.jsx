import { Routes, Route, Navigate, Link } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import Auth from './pages/Auth';
import MyPolls from './pages/MyPolls';
import Navbar from './components/Navbar';
import Testimonials from './components/Testimonials'; // ← Add this import
import { ArrowRightIcon, ChartBarIcon, ShareIcon, BoltIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
}

function Landing() {
  const token = localStorage.getItem('token');
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedback');
      setFeedbacks(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || rating === 0) {
      alert('Please fill name, message, and select a rating');
      return;
    }

    try {
      await axios.post('/api/feedback', { name, message, rating });
      setName('');
      setMessage('');
      setRating(0);
      fetchFeedbacks();
      alert('Thank you for your feedback! 🎉');
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section with Background Image */}
      <section 
        className="relative py-32 text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://png.pngtree.com/background/20250529/original/pngtree-elegant-blue-gradient-background-picture-image_16595028.jpg")' }}
      >
        <div className="absolute inset-0 bg-white/70"></div> {/* Overlay for text readability */}
        <div className="relative container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-800">
            Create Polls in Seconds
          </h1>
          <p className="text-xl md:text-3xl mb-12 max-w-4xl mx-auto text-gray-700">
            Real-time results • Unlimited voters • Beautiful animated charts
          </p>
          <Link
            to={token ? "/create" : "/auth"}
            className="inline-flex items-center bg-blue-600 text-white px-12 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-blue-700 transition"
          >
            {token ? "Create New Poll" : "Get Started Free"}
            <ArrowRightIcon className="ml-4 h-8 w-8" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/90">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl">
                <BoltIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Instant Creation</h3>
              <p className="text-lg text-gray-600">Create and share polls in under 10 seconds — no account needed to vote</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl">
                <ChartBarIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Live Results</h3>
              <p className="text-lg text-gray-600">Watch votes pour in with smooth animated charts in real-time</p>
            </div>
            <div className="text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl">
                <ShareIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Easy Sharing</h3>
              <p className="text-lg text-gray-600">Share via WhatsApp, Facebook, LinkedIn, Email, or copy link</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center card-hover">
              <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Create Your Poll</h3>
              <p className="text-lg text-gray-600">Add your question and options in seconds</p>
            </div>
            <div className="text-center card-hover">
              <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Share the Link</h3>
              <p className="text-lg text-gray-600">Send to friends via any messaging app or social media</p>
            </div>
            <div className="text-center card-hover">
              <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Watch Live Results</h3>
              <p className="text-lg text-gray-600">Votes update instantly — see results grow in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Now Using Dynamic Component */}
      <section id="testimonials" className="py-24 bg-white/90">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">
            What Users Say
          </h2>

          {/* Use the Testimonials component */}
          <Testimonials feedbacks={feedbacks} loading={loading} />

          {/* Feedback Form */}
          <div className="max-w-3xl mx-auto bg-white/95 rounded-3xl p-12 shadow-2xl card-hover mt-20">
            <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
              Share Your Experience
            </h3>
            <form onSubmit={submitFeedback} className="space-y-8">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-5 border border-gray-300 rounded-xl text-lg focus:border-cyan-500 focus:outline-none transition hover-lift"
                required
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think about Votely..."
                rows="6"
                className="w-full p-5 border border-gray-300 rounded-xl text-lg focus:border-cyan-500 focus:outline-none transition resize-none hover-lift"
                required
              />

              {/* Star Rating Input */}
              <div className="text-center">
                <p className="text-lg font-medium mb-6 text-gray-700">
                  Rate your experience:
                </p>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition transform hover:scale-125 focus:outline-none"
                    >
                      <svg
                        className={`w-14 h-14 ${star <= rating ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300'} hover:text-yellow-400`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.17l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.518-1.84-.249-1.54-1.17l1.287-3.953a1 1 0 00-.364-1.118L2.316 9.38c-.784-.784-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.953z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-xl font-medium text-cyan-600">
                  {rating === 0 ? 'Click stars to rate' : `${rating} star${rating > 1 ? 's' : ''} selected`}
                </p>
              </div>

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-6 rounded-xl text-xl font-bold shadow-xl hover-lift btn-hover hover-glow"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-cyan-500 to-blue-600 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Create Your First Poll?</h2>
        <Link
          to={token ? "/create" : "/auth"}
          className="inline-block bg-white text-cyan-600 px-14 py-7 rounded-full text-3xl font-bold shadow-2xl hover-lift btn-hover"
        >
          {token ? "Create Your First Poll" : "Start Now — It's Free"}
        </Link>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/my-polls" element={<ProtectedRoute><MyPolls /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
      <Route path="/poll/:id" element={<VotingPage />} />
      <Route path="/results/:id" element={<ResultsPage />} />
    </Routes>
  );
}