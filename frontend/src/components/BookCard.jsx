import React from 'react';
import { Link } from 'react-router-dom';

// Helper function to decode JWT token and get user role
function getUserRoleFromToken() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    // Roles might be in payload.role or payload.roles array depending on backend
    return payload.role || (payload.roles && payload.roles[0]) || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

function BookCard({ book, onAddToCart }) {
  const userRole = getUserRoleFromToken();

  // Show Add to Cart only if:
  // - book is NOT busy (available)
  // - user role is either ROLE_ADMIN or ROLE_USER
  const canAddToCart =
    !book.isBusy &&
    (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN' || userRole === 'ROLE_USER' || userRole === 'USER');

  return (
    <div
      className="card shadow-sm h-100"
      style={{ maxWidth: '100%', minHeight: '450px' }}
    >
      <Link to={`/books/${book.id}`} className="text-decoration-none text-dark">
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className="card-img-top"
          style={{ height: '250px', objectFit: 'cover' }}
        />
        <h5 className="card-title d-flex justify-content-between mt-2 px-3">
          {book.title}
          {book.isFeatured && (
            <span className="badge bg-success align-self-start">★</span>
          )}
        </h5>
      </Link>

      <div className="card-body d-flex flex-column">
        <p className="card-text">By {book.author}</p>

        {book.description && (
          <p className="card-text small text-muted">
            {book.description.slice(0, 60)}...
          </p>
        )}

        <p className="card-text fw-bold text-success mt-auto">£{book.price}</p>

        {canAddToCart && (
          <button
            className="btn btn-primary mt-2"
            onClick={() => onAddToCart(book)}
          >
            🛒 Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
