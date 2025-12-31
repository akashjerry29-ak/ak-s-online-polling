import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-text">
          <h1>Free Online Poll Maker</h1>
          <p>Create instant polls and get real-time results from your audience.</p>
          <Link to="/create"><button className="primary-btn">Make an Online Poll</button></Link>
          <button style={{ marginLeft: '15px', background: '#f0f0f0' }}>Poll Sample</button>
        </div>
        <div className="hero-image">
          Ballot Box
        </div>
      </div>
    </section>
  );
}