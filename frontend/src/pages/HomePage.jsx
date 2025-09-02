import React from 'react';
import BookCard from './BookCard';

function BookList({ books, onAddToCart }) {
  return (
    <div className="container mt-4">
      <div className="row">
        {books.map((book) => (
          <div key={book.id} className="col-sm-6 col-md-4 col-lg-3 d-flex">
            <BookCard book={book} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;
