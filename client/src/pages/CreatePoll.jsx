import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [newOption, setNewOption] = useState('');
  const [expiry, setExpiry] = useState('');
  const [links, setLinks] = useState(null);
  const navigate = useNavigate();

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanOptions = options.filter(o => o.trim());
    if (!question.trim() || cleanOptions.length < 2) {
      alert('Please enter a question and at least 2 options');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/polls', {
        question,
        options: cleanOptions,
        expiresAt: expiry || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinks(res.data);
    } catch (err) {
      alert('Error creating poll');
    }
  };

  useEffect(() => {
    if (links) {
      navigate(`/poll/${links.pollId}`);
    }
  }, [links, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-lg p-10">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
              Create New Poll
            </h1>

            <form onSubmit={handleCreate} className="space-y-8">
              {/* Question */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What is your favorite color?"
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Options
                </label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="p-3 bg-red-100 rounded-lg hover:bg-red-200 transition"
                      >
                        <TrashIcon className="h-6 w-6 text-red-600" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add new option..."
                    className="flex-1 px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    <PlusIcon className="h-7 w-7 text-white" />
                  </button>
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Expiry Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank if poll never expires
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-5 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Create Poll
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}