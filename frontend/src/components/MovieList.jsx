import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error('Error fetching movies:', err));
  }, []);

  return (
    <div>
      <h1>🎬 Tempest Movie Reviews</h1>
      {movies.map(movie => (
        <div key={movie.id} style={{ marginBottom: '2rem' }}>
          <h2>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
          </h2>
          <p>{movie.synopsis}</p>
          <strong>Reviews:</strong>
          <ul>
            {movie.reviews.map(review => (
              <li key={review.id}>
                {review.content} — <em>{review.user.name}</em>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
