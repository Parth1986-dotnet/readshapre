import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosConfig from '../axiosConfig';

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Fetch books with cookie automatically included
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await axiosConfig.get('/api/books', {
          withCredentials: true, // ensures cookie is sent
        });
        setBooks(res.data);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await axiosConfig.delete(`/api/books/${id}`, {
        withCredentials: true,
      });
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-book/${id}`);
  };

  // Helper function for numeric search
  const isNumeric = (str) => {
    if (typeof str !== "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
  };

  const filteredBooks = books.filter(book => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const inTitle = book.title?.toLowerCase().includes(term);
    const inAuthor = book.author?.toLowerCase().includes(term);
    const inCategory = book.category?.toLowerCase().includes(term);
    const priceMatch = isNumeric(term)
      ? Math.abs(book.price - parseFloat(term)) < 0.01
      : false;

    return inTitle || inAuthor || inCategory || priceMatch;
  });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  if (loading) return <p className="text-center mt-4">Loading books...</p>;
  if (error) return <p className="text-danger text-center mt-4">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📚 Book List</h2>

      {/* Search input */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Search by title, author, category, or price"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price (£)</th>
              <th>Status</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.length > 0 ? currentBooks.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category || '-'}</td>
                <td>{book.price?.toFixed(2)}</td>
                <td>
                  <span className={`badge bg-${book.available ? 'success' : 'danger'}`}>
                    {book.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(book.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center">No books found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages).keys()].map(num => (
              <li
                key={num}
                className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(num + 1)}
                >
                  {num + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default BookList;
