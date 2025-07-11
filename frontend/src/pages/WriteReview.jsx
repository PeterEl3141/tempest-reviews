import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;



export default function WriteReview() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(3);
  const [fun, setFun] = useState(3);


  // Only allow admins to access this page
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    axios.get(`${API}/movies`)
      .then(res => setMovies(res.data))
      .catch(err => {
        console.error('Failed to fetch movies:', err);
        alert('Failed to load movies for review');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token'); // ✅ Move it *inside* the handler
    console.log("🚀 Token being sent:", token);

    if (!token) {
      alert("You're not authenticated!");
      return;
    }
  
    if (!selectedMovie) {
      alert('Please select a movie');
      return;
    }
  
    if (!content.trim()) {
      alert('Please write your review');
      return;
    }
  
    setLoading(true);
    try {
      await axios.post(
        `${API}/reviews`,
        {
          content,
          movieId: Number(selectedMovie),
          userId: user.id,
          quality,
          fun,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Now should be correctly defined
          },
        }
      );
  
      alert('Review submitted successfully!');
      setSelectedMovie('');
      setContent('');
      setQuality(3);
      setFun(3);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h2>Write a Review (Admins Only)</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Select Movie:
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Choose a movie --</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </label>

        <br /><br />

        <label>
          Your Review:
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            cols={50}
            placeholder="Write your review here..."
            disabled={loading}
          />
        </label>

        <br /><br />

        <label>
        Quality (1–5):
        <select value={quality} onChange={(e) => setQuality(Number(e.target.value))} disabled={loading}>
            {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
            ))}
        </select>
        </label>

        <br /><br />

        <label>
        Fun (1–5):
        <select value={fun} onChange={(e) => setFun(Number(e.target.value))} disabled={loading}>
            {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
            ))}
        </select>
        </label>

        <br /><br />


        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
