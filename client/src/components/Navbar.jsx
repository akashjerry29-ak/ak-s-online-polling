import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const scrollToSection = (sectionId) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-blue-600">
            AK's online polling
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-lg font-medium text-gray-700 hover:text-blue-600 transition">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-lg font-medium text-gray-700 hover:text-blue-600 transition">
              How It Works
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-lg font-medium text-gray-700 hover:text-blue-600 transition">
              Testimonials
            </button>

            {token ? (
              <>
                <Link to="/my-polls" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition">
                  My Polls
                </Link>
                <Link to="/create" className="text-lg font-medium text-gray-700 hover:text-blue-600 transition">
                  Create Poll
                </Link>
                <button onClick={logout} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-3xl text-gray-700 focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu - Properly Aligned */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 bg-white border-t border-gray-200">
            <div className="flex flex-col items-center gap-6 text-lg font-medium">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-blue-600 transition">
                How It Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 transition">
                Testimonials
              </button>

              {token ? (
                <>
                  <Link to="/my-polls" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition">
                    My Polls
                  </Link>
                  <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition">
                    Create Poll
                  </Link>
                  <button onClick={logout} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-12 py-4 rounded-full font-bold hover:shadow-lg transition">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white px-12 py-4 rounded-full font-bold hover:bg-blue-700 transition">
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}