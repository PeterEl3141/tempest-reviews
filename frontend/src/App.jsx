import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './index.css'
import NavBar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import WriteReview from './pages/WriteReview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddMovie from './pages/AddMovie';

function App() {
  return (
    <div>
      <NavBar />
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/write-review" element={<RequireAdmin><WriteReview /></RequireAdmin>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-movie" element={<RequireAdmin><AddMovie /></RequireAdmin>} />
      </Routes>
    </div>
  );
}

function RequireAdmin({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return <p>Access denied. Admins only.</p>;
  }

  return children;
}

export default App;
