import React from "react";
import { BsBinoculars } from "react-icons/bs";

function BookCard({ book, onAddToCart, onPreview, upcoming = false }) {
  const imgSrc =
    book?.imageUrl || "https://via.placeholder.com/200x280?text=Book+Image";

  return (
    <div className="card shadow-sm h-100 border-0 position-relative book-card">
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
          position: "relative",
        }}
      >
        {/* Top-right binoculars (hover) */}
        {onPreview && (
          <button
            type="button"
            className="btn btn-light btn-sm shadow-sm position-absolute m-2 book-card-preview-btn"
            style={{ top: 0, right: 0 }}
            aria-label={`Quick preview of ${book?.title || "book"}`}
            onClick={() => onPreview(book)}
          >
            <BsBinoculars />
          </button>
        )}

        <img
          src={imgSrc}
          alt={book?.title || "Book Image"}
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            transition: "transform 0.3s",
          }}
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/200x280?text=Book+Image";
          }}
        />
      </div>

      {/* Book Details */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-truncate" title={book?.title || "Untitled"}>
          {book?.title || "Untitled"}
        </h5>
        <p className="card-text text-muted small mb-1">
          by {book?.author || "Unknown"}
        </p>
        <p className="fw-bold">
          ₹
          {book?.price != null && !isNaN(Number(book.price))
            ? Number(book.price).toFixed(2)
            : "N/A"}
        </p>

        {upcoming ? (
          <span className="badge bg-warning text-dark mt-auto">Coming Soon</span>
        ) : (
          <div className="d-flex gap-2 mt-auto">
            {onPreview && (
              <button
                type="button"
                className="btn btn-outline-secondary w-50"
                onClick={() => onPreview(book)}
              >
                <BsBinoculars className="me-1" />
                Preview
              </button>
            )}
            <button
              type="button"
              className="btn btn-dark w-50"
              onClick={() => onAddToCart && onAddToCart(book)}
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;
