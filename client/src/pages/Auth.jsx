import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ API base URL from Vercel environment variable
const API = import.meta.env.VITE_API_URL;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    // ✅ Correct API URLs (Render backend)
    const url = isLogin
      ? `${API}/api/auth/login`
      : `${API}/api/auth/register`;

    try {
      const res = await axios.post(url, { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/my-polls');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isLogin ? 'Login' : 'Register'}
        </h1>

        <form onSubmit={submit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 border rounded-lg mb-4"
            required
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 border rounded-lg mb-6"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6">
          {isLogin ? 'No account? ' : 'Have account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
