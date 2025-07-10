import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", synopsis: "" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ content: '', quality: 3, fun: 3 });

  useEffect(() => {
    axios
      .get(`http://localhost:4000/movies/${id}`)
      .then((res) => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!movie) return <p>No movie found</p>;

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this movie?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`${API}/movies/${movie.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Movie deleted");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete movie");
    }
  };

  const handleEditToggle = () => {
    setEditForm({ title: movie.title, synopsis: movie.synopsis });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/movies/${movie.id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Movie updated");
      setIsEditing(false);
      // re-fetch movie or update state locally:
      setMovie((prev) => ({ ...prev, ...editForm }));
    } catch (err) {
      console.error(err);
      alert("Failed to update movie");
    }
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review.id);
    setReviewForm({
      content: review.content,
      quality: review.quality,
      fun: review.fun
    });
  };
  
  const handleReviewEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API}/reviews/${editingReview}`,
        reviewForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Review updated!');
      // Refresh specific review in state
      setMovie(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r.id === editingReview ? {...r, ...reviewForm} : r)
      }));
      setEditingReview(null);
    } catch {
      alert('Failed to update review');
    }
  };
  
  const handleReviewDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await axios.delete(
        `${API}/reviews/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Review deleted!');
      setMovie(prev => ({ ...prev, reviews: prev.reviews.filter(r => r.id !== id) }));
    } catch {
      alert('Failed to delete review');
    }
  };
  

  return (
    <div>
      <h2>{movie.title}</h2>
      <p><strong>Movie ID:</strong> {id}</p>
      <p>{movie.synopsis}</p>
  
      {/* Admin controls */}
      {user && user.role === "ADMIN" && (
        <>
          {!isEditing ? (
            <>
              <button onClick={handleEditToggle}>Edit Movie</button>{" "}
              <button onClick={handleDelete}>Delete Movie</button>
            </>
          ) : (
            <form onSubmit={handleEditSubmit}>
              <input
                name="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <br /><br />
              <textarea
                name="synopsis"
                rows={4}
                cols={50}
                value={editForm.synopsis}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, synopsis: e.target.value }))
                }
              />
              <br /><br />
              <button type="submit">Save</button>{" "}
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </form>
          )}
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => navigate("/write-review")}>
              Write a Review for This Movie
            </button>
          </div>
        </>
      )}
  
      {/* Reviews */}
      <h3 style={{ marginTop: "40px" }}>Reviews</h3>
      {movie.reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        <div>
          {movie.reviews.map((review) => (
            <div
              key={review.id}
              className="review"
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p><strong>{review.user?.name || "Anonymous"}</strong> says:</p>
              <p>{review.content}</p>
              <p>⭐ Quality: {review.quality} | 🎉 Fun: {review.fun}</p>
  
              {user && (user.role === "ADMIN" || user.id === review.userId) && (
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => handleReviewEdit(review)}>Edit</button>{" "}
                  <button onClick={() => handleReviewDelete(review.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
  
      {/* Edit Review Form */}
      {editingReview && (
        <form onSubmit={handleReviewEditSubmit} style={{ marginTop: '20px' }}>
          <h4>Edit Your Review</h4>
          <textarea
            value={reviewForm.content}
            onChange={e =>
              setReviewForm(prev => ({ ...prev, content: e.target.value }))
            }
            rows={4}
            cols={50}
            required
          />
          <br />
          Quality:
          <select
            value={reviewForm.quality}
            onChange={e =>
              setReviewForm(prev => ({ ...prev, quality: +e.target.value }))
            }
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          Fun:
          <select
            value={reviewForm.fun}
            onChange={e =>
              setReviewForm(prev => ({ ...prev, fun: +e.target.value }))
            }
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <br /><br />
          <button type="submit">Save</button>{" "}
          <button type="button" onClick={() => setEditingReview(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
  
}
