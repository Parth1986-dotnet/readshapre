import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { useCart } from "../context/CartContext";

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

  const { addToCart } = useCart();

  // Fetch all books
  useEffect(() => {
    fetch("http://localhost:8081/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch books");
        return res.json();
      })
      .then((data) => {
        // Add fallback image for all books
        const booksWithImages = data.map((book) => ({
          ...book,
          imageUrl: book.imageUrl || "https://via.placeholder.com/200x280?text=Book+Image",
        }));

        setBooks(booksWithImages);

        const today = new Date();
        const upcoming = booksWithImages.filter(
          (book) => book.releaseDate && new Date(book.releaseDate) > today
        );
        setUpcomingBooks(upcoming);

        console.log("Fetched books:", booksWithImages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(books.map((book) => book.category).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = [book.title, book.author, book.category, book.price?.toString()]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortOption === "priceLowHigh") return a.price - b.price;
    if (sortOption === "priceHighLow") return b.price - a.price;
    if (sortOption === "titleAZ") return a.title.localeCompare(b.title);
    if (sortOption === "titleZA") return b.title.localeCompare(a.title);
    return 0;
  });

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
        style={{
          background: "linear-gradient(135deg, #f9f9f9, #ececec)",
          color: "#333",
        }}
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
                <BookCard book={book} upcoming />
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
            <BookCard book={book} onAddToCart={addToCart} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, idx) => (
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
    </div>
  );
}

export default AllBooksPage;
