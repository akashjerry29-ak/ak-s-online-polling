import React from 'react';

export default function Testimonials({ feedbacks = [] }) { // Accept feedbacks as prop
  // Fallback if no real data yet
  const defaultReviews = [
    { name: "Alex Johnson", message: "Fastest way to get feedback during my live events!", rating: 5 },
    { name: "Sarah Miller", message: "The real-time updates are incredibly smooth.", rating: 5 },
    { name: "Mike Chen", message: "Clean UI and very easy for participants to use.", rating: 4 }
  ];

  const reviewsToShow = feedbacks.length > 0 ? feedbacks : defaultReviews;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-6 h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} drop-shadow`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.17l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.518-1.84-.249-1.54-1.17l1.287-3.953a1 1 0 00-.364-1.118L2.316 9.38c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.953z" />
      </svg>
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {reviewsToShow.map((review, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 border border-gray-100"
            >
              {/* Star Rating */}
              <div className="flex justify-center mb-6">
                {renderStars(review.rating || 5)}
              </div>

              {/* Quote */}
              <p className="text-lg italic text-gray-700 leading-relaxed mb-8 text-center">
                "{review.message || review.text}"
              </p>

              {/* Name */}
              <h4 className="text-xl font-bold text-center text-cyan-600">
                - {review.name}
              </h4>

              {/* Date if available */}
              {review.createdAt && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}