import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // ✅ use your axiosConfig with withCredentials: true

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [inStockBooks, setInStockBooks] = useState(0);
  const [outOfStockBooks, setOutOfStockBooks] = useState(0);
  const [outOfStockList, setOutOfStockList] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchBookStats();
    fetchTotalEarnings();
  }, []);

  const fetchBookStats = async () => {
    try {
      // ✅ No need to read token or set headers manually
      const response = await axios.get('/api/books', { withCredentials: true });
      const books = response.data;
      setBooks(books);

      setTotalBooks(books.length);
      setInStockBooks(books.filter(book => book.stock > 0).length);
      const outOfStock = books.filter(book => book.stock <= 0);
      setOutOfStockBooks(outOfStock.length);
      setOutOfStockList(outOfStock);
    } catch (error) {
      console.error('Failed to fetch book data', error);
    }
  };

  const fetchTotalEarnings = async () => {
    try {
      const response = await axios.get('/api/orders/earnings', { withCredentials: true });
      setTotalEarnings(parseFloat(response.data));
    } catch (error) {
      console.error('Failed to fetch total earnings', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        color: '#333',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '20px',
      }}
    >
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ color: '#007bff', marginBottom: 8 }}>📊 Dashboard</h2>
        <p>Welcome to the admin panel. You can manage books here.</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            marginTop: 20,
          }}
        >
          {/* Total Books */}
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #007bff',
            padding: 20,
            borderRadius: 6,
          }}>
            <h5 style={{ marginBottom: 10, color: '#007bff' }}>Total Books</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>{totalBooks}</p>
          </div>

          {/* In Stock */}
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #28a745',
            padding: 20,
            borderRadius: 6,
          }}>
            <h5 style={{ marginBottom: 10, color: '#28a745' }}>In Stock</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>{inStockBooks}</p>
          </div>

          {/* Out of Stock */}
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #f0ad4e',
            padding: 20,
            borderRadius: 6,
          }}>
            <h5 style={{ marginBottom: 10, color: '#f0ad4e' }}>Out of Stock</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>{outOfStockBooks}</p>
          </div>

          {/* Total Earnings */}
          <div style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #17a2b8',
            padding: 20,
            borderRadius: 6,
          }}>
            <h5 style={{ marginBottom: 10, color: '#17a2b8' }}>Total Earnings</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
              £{totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>

        {outOfStockBooks > 0 && (
          <div className="alert alert-warning" role="alert" style={{ marginTop: 40 }}>
            <h4>❌ Out of Stock Books</h4>
            <ul style={{ marginTop: 10 }}>
              {outOfStockList.map(book => (
                <li key={book.id} style={{ marginBottom: 6 }}>
                  <strong>{book.title}</strong> — <span style={{ fontWeight: 'bold' }}>Unavailable</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
