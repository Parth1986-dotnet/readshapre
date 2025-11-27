// src/pages/AllBooksPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard";
import { useCart } from "../context/CartContext";
import BookMagnifier from "../components/BookMagnifier";

function AllBooksPage() {
  const [books, setBooks] = useState([]);
  const [upcomingBooks, setUpcomingBooks] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewBook, setPreviewBook] = useState(null);

  const { addToCart } = useCart();

  // Escape closes modal
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

  // Categories
  const categories = useMemo(
    () => [...new Set(books.map((b) => b.category).filter(Boolean))],
    [books]
  );

  // Search + Filter
  const filteredBooks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = [book.title, book.author, book.category, book.price?.toString()].some(
        (f) => f?.toString().toLowerCase().includes(term)
      );
      const matchesCategory = selectedCategory
        ? book.category === selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  // Sorting
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

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-danger text-center mt-4">Error: {error}</p>;

  return (
    <div className="container-fluid mt-4">

      {/* Sticky Search + Sort Bar */}
      <div
        className="position-sticky top-0 bg-white py-3 px-3 shadow-sm mb-4"
        style={{ zIndex: 50 }}
      >
        <div className="d-flex flex-wrap gap-3 justify-content-between">
          <input
            type="text"
            placeholder="Search books, authors, categories..."
            className="form-control"
            style={{ maxWidth: "360px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="d-flex flex-wrap gap-2">
            <select
              className="form-select"
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
              className="form-select"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Sort</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="titleAZ">Title: A-Z</option>
              <option value="titleZA">Title: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">

        {/* Amazon-style Left Category Sidebar */}
        <div className="col-md-3 col-lg-2 mb-4">
          <div className="position-sticky" style={{ top: "90px" }}>
            <h5 className="fw-bold mb-3">Categories</h5>

            <ul className="list-group shadow-sm">
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={`list-group-item list-group-item-action ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                >
                  {cat}
                </li>
              ))}

              <li
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
              >
                Clear Filter
              </li>
            </ul>
          </div>
        </div>

        {/* Main Book Grid */}
        <div className="col-md-9 col-lg-10">

          {/* Banner */}
          <div
            className="p-4 mb-4 rounded-3 shadow-sm"
            style={{ background: "#F3F3F3" }}
          >
            <h3 className="fw-bold m-0">🔥 Biggest Sale of the Month</h3>
            <p className="m-0 text-muted">Up to 60% OFF on bestsellers!</p>
          </div>

          {/* Book Cards Grid */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {currentBooks.map((book) => (
              <div key={book.id} className="col">
                <div
                  className="card h-100 p-3 shadow-sm"
                  style={{
                    cursor: "pointer",
                    transition: "0.25s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() => setPreviewBook(book)}
                >
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="card-img-top"
                    style={{
                      height: "250px",
                      objectFit: "contain",
                    }}
                  />

                  <div className="card-body d-flex flex-column">

                    <h6 className="fw-bold">{book.title}</h6>
                    <small className="text-muted">by {book.author}</small>

                    <div className="mt-2">
                      <span className="fw-bold" style={{ fontSize: "1.2rem" }}>
                        ₹{Number(book.price).toFixed(2)}
                      </span>
                    </div>

                    <span className="badge bg-success mt-2">In Stock</span>

                    <button
                      className="btn btn-warning fw-bold mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(book);
                      }}
                    >
                      Add to Cart
                    </button>

                  </div>
                </div>
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
                    className={`page-item ${
                      currentPage === idx + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewBook && (
        <div
          className="fixed-top d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,.5)",
            minHeight: "100vh",
            zIndex: 1050,
          }}
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewBook(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{previewBook.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPreviewBook(null)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-4">

                  {/* Magnifier */}
                  <div className="col-12 col-md-5">
                    <BookMagnifier
                      src={previewBook.imageUrl}
                      zoom={2.5}
                      lensSize={180}
                    />
                  </div>

                  <div className="col-12 col-md-7">
                    <h4 className="fw-bold">{previewBook.title}</h4>
                    <p className="text-muted">by {previewBook.author}</p>

                    <h3 className="fw-bold mt-3">
                      ₹{Number(previewBook.price).toFixed(2)}
                    </h3>

                    <p className="mt-3">{previewBook.description}</p>

                    <button
                      className="btn btn-dark mt-2"
                      onClick={() => {
                        addToCart(previewBook);
                        setPreviewBook(null);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <table className="table table-sm mt-4">
                  <tbody>
                    <tr>
                      <th>Category</th>
                      <td>{previewBook.category}</td>
                    </tr>
                    <tr>
                      <th>Author</th>
                      <td>{previewBook.author}</td>
                    </tr>
                    <tr>
                      <th>Price</th>
                      <td>₹{Number(previewBook.price).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllBooksPage;
