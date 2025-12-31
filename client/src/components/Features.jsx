const features = [
  { icon: '📝', title: 'Fast Poll Setup', desc: 'Create polls in seconds with an easy form.' },
  { icon: '🔗', title: 'Easy Sharing', desc: 'Share with unique links or QR code.' },
  { icon: '🗳️', title: 'Smooth Voting', desc: 'One-click voting with real-time updates.' },
  { icon: '📊', title: 'Live Results', desc: 'Watch votes pour in instantly with charts.' },
  { icon: '🔒', title: 'Secure & Fair', desc: 'One vote per user, expiry options.' },
  { icon: '📱', title: 'Mobile Ready', desc: 'Perfect experience on phones and tablets.' },

];

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>Features</h2>
        <div className="grid">
          {features.map((f, i) => (
            <div className="card" key={i}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}