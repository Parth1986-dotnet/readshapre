// src/pages/AllBooksPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard";
import { useCart } from "../context/CartContext";
import BookMagnifier from "../components/BookMagnifier"; // ✅ magnifier component

function AllBooksPage() {
  const [books, setBooks] = useState([]);
  const [upcomingBooks, setUpcomingBooks] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewBook, setPreviewBook] = useState(null);

  const { addToCart } = useCart();

  // Close preview on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPreviewBook(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Fetch all books
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch books");
        return res.json();
      })
      .then((data) => {
        const booksWithImages = (data || []).map((book) => ({
          ...book,
          imageUrl:
            book.imageUrl ||
            "https://via.placeholder.com/200x280?text=Book+Image",
        }));

        setBooks(booksWithImages);

        const today = new Date();
        const upcoming = booksWithImages.filter(
          (book) => book.releaseDate && new Date(book.releaseDate) > today
        );
        setUpcomingBooks(upcoming);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(books.map((b) => b.category).filter(Boolean))],
    [books]
  );

  const filteredBooks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = [book.title, book.author, book.category, book.price?.toString()].some(
        (f) => f?.toString().toLowerCase().includes(term)
      );
      const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  const sortedBooks = useMemo(() => {
    const arr = [...filteredBooks];
    if (sortOption === "priceLowHigh") arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortOption === "priceHighLow") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sortOption === "titleAZ") arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOption === "titleZA") arr.sort((a, b) => b.title.localeCompare(a.title));
    return arr;
  }, [filteredBooks, sortOption]);

  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);

  if (loading) return <p className="text-center mt-4">Loading books...</p>;
  if (error) return <p className="text-danger text-center mt-4">Error: {error}</p>;

  return (
    <div className="container mt-4">
      {/* Hero Banner */}
      <div
        className="p-4 mb-5 rounded-3 text-center shadow"
        style={{ background: "linear-gradient(135deg, #f9f9f9, #ececec)", color: "#333" }}
      >
        <h2 className="fw-bold">🎉 Summer Reading Sale - Up to 40% Off!</h2>
        <p>Grab your favorite books before the offer ends! 📚✨</p>
      </div>

      {/* Upcoming Books */}
      {upcomingBooks.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3">🔮 Upcoming Books</h3>
          <div className="d-flex overflow-auto gap-3 p-2">
            {upcomingBooks.map((book) => (
              <div key={book.id} style={{ minWidth: "220px" }}>
                <BookCard
                  book={book}
                  upcoming
                  onAddToCart={addToCart}
                  onPreview={(b) => setPreviewBook(b)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Books */}
      <h2 className="mb-3">📖 All Books</h2>

      {/* Search & Sort */}
      <div className="mb-4 d-flex align-items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by title, author, category..."
          className="form-control w-auto"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="form-select w-auto"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className="form-select w-auto"
          value={sortOption}
          onChange={(e) => {
            setSortOption(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">-- Sort By --</option>
          <option value="priceLowHigh">💰 Price: Low to High</option>
          <option value="priceHighLow">💸 Price: High to Low</option>
          <option value="titleAZ">🔤 Title: A to Z</option>
          <option value="titleZA">🔠 Title: Z to A</option>
        </select>
      </div>

      {/* Grid of Book Cards */}
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-3 g-4">
        {currentBooks.map((book) => (
          <div key={book.id} className="col d-flex">
            <BookCard
              book={book}
              onAddToCart={addToCart}
              onPreview={(b) => setPreviewBook(b)}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <li
                key={idx}
                className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>
                  {idx + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Quick Preview Modal (pure React, no bootstrap JS needed) */}
      {previewBook && (
        <div
          className="fixed-top d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,.5)", minHeight: "100vh", zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bookPreviewTitle"
          onClick={() => setPreviewBook(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="bookPreviewTitle">
                  {previewBook.title || "Untitled"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setPreviewBook(null)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-4">
                  {/* ✅ Magnifier used here */}
                  <div className="col-12 col-md-5">
                    <BookMagnifier
                      src={
                        previewBook.imageUrl ||
                        "https://via.placeholder.com/400x560?text=Book+Image"
                      }
                      alt={previewBook.title || "Book cover"}
                      zoom={2.5}      // tweak 2.0–3.0
                      lensSize={180}  // tweak 140–220
                    />
                  </div>

                  <div className="col-12 col-md-7">
                    <div className="d-flex flex-column gap-2">
                      <div className="text-muted small">by</div>
                      <div className="fw-semibold">
                        {previewBook.author || "Unknown"}
                      </div>

                      <div className="d-flex align-items-center gap-2 mt-2">
                        {previewBook.category && (
                          <span className="badge bg-light text-secondary">
                            {previewBook.category}
                          </span>
                        )}
                        {previewBook.releaseDate && (
                          <span className="badge bg-warning text-dark">
                            Releases{" "}
                            {new Date(previewBook.releaseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="fs-4 fw-bold mt-2">
                        {previewBook.price != null
                          ? `₹${Number(previewBook.price).toFixed(2)}`
                          : "—"}
                      </div>

                      {previewBook.description && (
                        <p className="text-muted mt-2" style={{ whiteSpace: "pre-wrap" }}>
                          {previewBook.description}
                        </p>
                      )}

                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={() => {
                            addToCart(previewBook);
                            setPreviewBook(null);
                          }}
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => setPreviewBook(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick facts */}
                <div className="table-responsive mt-4">
                  <table className="table table-sm align-middle">
                    <tbody>
                      <tr>
                        <th className="w-25">Title</th>
                        <td>{previewBook.title || "—"}</td>
                      </tr>
                      <tr>
                        <th>Author</th>
                        <td>{previewBook.author || "—"}</td>
                      </tr>
                      <tr>
                        <th>Category</th>
                        <td>{previewBook.category || "—"}</td>
                      </tr>
                      <tr>
                        <th>Price</th>
                        <td>
                          {previewBook.price != null
                            ? `₹${Number(previewBook.price).toFixed(2)}`
                            : "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* /quick facts */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllBooksPage;
