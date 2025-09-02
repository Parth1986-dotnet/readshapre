// src/pages/BookList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import api from '../axiosConfig';  // <== Add this import!
import axiosConfig from '../axiosConfig'; // Ensure this is the correct path to your axios config

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  //useEffect(() => {
    //fetch('http://localhost:8081/api/books')
      //.then(res => {
        //if (!res.ok) throw new Error('Failed to fetch books');
        //return res.json();
      //})

      //.then(data => setBooks(data))
      //.catch(err => setError(err.message))
      //.finally(() => setLoading(false));
  //}, []);


    useEffect(() => {
      const token = localStorage.getItem('accessToken'); // likely key you use

      fetch('http://localhost:8081/api/books', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch books');
          return res.json();
        })
        .then(data => setBooks(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);


  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    fetch(`http://localhost:8081/api/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to delete');
      setBooks(prev => prev.filter(book => book.id !== id));
    })
    .catch(err => alert(`❌ Error: ${err.message}`));
  };

  const handleEdit = (id) => {
    navigate(`/edit-book/${id}`);
  };

  // Helper function to check if a string is numeric
  const isNumeric = (str) => {
    if (typeof str != "string") return false; // we only process strings
    return !isNaN(str) && !isNaN(parseFloat(str));
  };

  // Extended filter logic
  const filteredBooks = books.filter(book => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return true; // if search empty, show all

    // Check title or author contains search term
    const inTitle = book.title.toLowerCase().includes(term);
    const inAuthor = book.author.toLowerCase().includes(term);

    // Check category contains search term (if exists)
    const inCategory = book.category ? book.category.toLowerCase().includes(term) : false;

    // Check price match: if term is numeric, compare with price (allow small difference)
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
            {currentBooks.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category || '-'}</td>
                <td>{book.price?.toFixed(2)}</td>
               <td>
                 <span className={`badge bg-${book.available === true ? 'success' : 'danger'}`}>
                   {book.available === true ? 'Available' : 'Unavailable'}
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
            ))}

            {filteredBooks.length === 0 && (
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
