import React from 'react';

export default function HowItWorks() {
  const steps = [
    { id: '01', title: 'Create', desc: 'Type your question and add multiple choices.' },
    { id: '02', title: 'Share', desc: 'Copy your unique link and send it to your audience.' },
    { id: '03', title: 'Analyze', desc: 'Watch results pour in with real-time charts.' }
  ];

  return (
    <section id="works" className="section-padding">
      <h2 className="text-blue">How It Works</h2>
      <div className="grid-3">
        {steps.map(step => (
          <div key={step.id} className="card">
            <div className="step-number">{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}