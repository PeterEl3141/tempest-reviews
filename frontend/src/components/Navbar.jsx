import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>{' '}
      {user && user.role === 'ADMIN' && (
        <>
          <Link to="/write-review">Write Review</Link>{' '}
          <Link to="/add-movie">Add Movie</Link>{' '}
        </>
      )}
      {!user ? (
        <>
          <Link to="/login">Login</Link>{' '}
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          | Hello, {user.name || user.email} ({user.role}){' '}
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
}
