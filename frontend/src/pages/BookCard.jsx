import React from "react";

function BookCard({ book, onAddToCart, upcoming = false }) {
  // fallback image if imageUrl is missing
  const imgSrc = book.imageUrl || "https://via.placeholder.com/200x280?text=Book+Image";

  return (
    <div className="card shadow-sm h-100 border-0">
      {/* Book Image */}
      <div
        style={{
          height: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <img
          src={imgSrc}
          alt={book.title || "Book Image"}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            transition: "transform 0.3s",
          }}
          onError={(e) => {
            console.warn(`Image failed for book: ${book.title}`, book.imageUrl);
            e.target.src = "https://via.placeholder.com/200x280?text=Book+Image";
          }}
        />
      </div>

      {/* Book Details */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-truncate">{book.title || "Untitled"}</h5>
        <p className="card-text text-muted small mb-1">by {book.author || "Unknown"}</p>
        <p className="fw-bold">₹{book.price || "N/A"}</p>

        {upcoming ? (
          <span className="badge bg-warning text-dark mt-auto">Coming Soon</span>
        ) : (
          <button
            className="btn btn-dark mt-auto w-100"
            onClick={() => onAddToCart && onAddToCart(book)}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;
