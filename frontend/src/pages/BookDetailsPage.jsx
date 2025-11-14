import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import BookMagnifier from "../components/BookMagnifier";
import axiosInstance from "../axiosConfig";

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axiosInstance.get(`/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("Failed to fetch book:", err);
        setError(err.response?.data?.message || "Failed to fetch book");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return <p className="text-center mt-4">Loading book details...</p>;
  if (error) return <p className="text-danger text-center mt-4">Error: {error}</p>;
  if (!book) return null;

  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        {/* Left: Book Image */}
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
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Category:</strong> {book.category}</p>
          <p><strong>Description:</strong></p>
          <p>{book.description}</p>
          <p>
            <strong>Price:</strong> <span className="text-success">£{book.price}</span>
          </p>

          <button
            className="btn btn-primary me-2"
            onClick={() => {
              addToCart(book);
              navigate("/cart"); // 👈 navigate to cart, not checkout
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
