// src/pages/BookDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // If needed for auth

    fetch(`http://localhost:8081/api/books/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch book');
        return res.json();
      })
      .then((data) => setBook(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-4">Loading book details...</p>;
  if (error) return <p className="text-danger text-center mt-4">Error: {error}</p>;
  if (!book) return null;

  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-md-5">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-7">
          <h2>{book.title}</h2>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Category:</strong> {book.category}</p>
          <p><strong>Description:</strong></p>
          <p>{book.description}</p>
          <p><strong>Price:</strong> <span className="text-success">£{book.price}</span></p>
          <button
            className="btn btn-primary me-2"
            onClick={() => {
              addToCart(book);
              navigate('/checkout'); // or stay on page if preferred
            }}
          >
            🛒 Add to Cart
          </button>
          <Link to="/all-books" className="btn btn-outline-secondary">⬅ Back to Books</Link>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;
