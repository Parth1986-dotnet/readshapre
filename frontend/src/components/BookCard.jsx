import React from 'react';

function BookCard({ book, onAddToCart }) {
  return (
    <div className="card mb-3" style={{ maxWidth: '18rem' }}>
      <img
        src={book.coverImageUrl}
        alt={book.title}
        className="card-img-top"
        style={{ height: '250px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{book.title}</h5>
        <p className="card-text">By {book.author}</p>
        <p className="card-text fw-bold">£{book.price}</p>
        <button
          className="btn btn-primary mt-auto"
          onClick={() => onAddToCart(book)}
        >
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}

export default BookCard;
