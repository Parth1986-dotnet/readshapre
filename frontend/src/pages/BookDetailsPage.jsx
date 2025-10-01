// src/pages/BookDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import BookMagnifier from "../components/BookMagnifier";

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8081/api/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch book");
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
        {/* Left: Book Image with optional magnifier */}
        <div className="col-md-5">
          {book.coverImageUrl ? (
            <BookMagnifier imageUrl={book.coverImageUrl} altText={book.title} />
          ) : (
            <img
              src="https://via.placeholder.com/300x400?text=No+Image"
              alt="No cover available"
              className="img-fluid rounded shadow"
            />
          )}
        </div>

        {/* Right: Book Info */}
        <div className="col-md-7">
          <h2>{book.title}</h2>
          <p>
            <strong>Author:</strong> {book.author}
          </p>
          <p>
            <strong>Category:</strong> {book.category}
          </p>
          <p>
            <strong>Description:</strong>
          </p>
          <p>{book.description}</p>
          <p>
            <strong>Price:</strong>{" "}
            <span className="text-success">£{book.price}</span>
          </p>

          {/* Actions */}
          <button
            className="btn btn-primary me-2"
            onClick={() => {
              addToCart(book);
              navigate("/checkout"); // 👉 change to "/cart" if you prefer reviewing cart first
            }}
          >
            🛒 Add to Cart
          </button>
          <Link to="/all-books" className="btn btn-outline-secondary">
            ⬅ Back to Books
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;
