import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import MovieList from '../components/MovieList';

export default function Home() {
  return (
    <div>
      <MovieList />
    </div>
  );
}