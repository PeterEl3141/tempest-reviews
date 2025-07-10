import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
const API = import.meta.env.VITE_API_URL;

export default function AddMovie() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', synopsis: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'ADMIN') {
    return <p>Access denied. Admins only.</p>;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(
        `${API}/movies`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Movie added successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to add movie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add a New Movie</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <br /><br />
        <textarea
          name="synopsis"
          placeholder="Synopsis"
          value={form.synopsis}
          onChange={handleChange}
          rows={5}
          cols={50}
          required
        />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Movie'}
        </button>
      </form>
    </div>
  );
}
