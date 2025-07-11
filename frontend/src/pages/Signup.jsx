import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const API = import.meta.env.VITE_API_URL;


export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      if (!res.ok) {
        throw new Error('Signup failed');
      }
  
      const data = await res.json();
  
      // ✅ Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      // ✅ Set Axios default header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  
      // ✅ Update context manually
      setUser(data.user);
  
      navigate('/');
    } catch (err) {
      setError('Signup failed. Try a different email or check your input.');
    }
  };
  

  return (
    <div>
      <h2>Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <input 
            type="text" 
            name="adminCode" 
            id=""
            placeholder='Admin Code (oprtional)'
            value={form.adminCode}
            onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
