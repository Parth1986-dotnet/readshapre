import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosConfig from '../axiosConfig';

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [myForm, setMyForm] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    publicationDate: '',
    isAvailable: true,
    coverImageUrl: '',
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load book data on mount
    axiosConfig.get(`/api/books/${id}`)
      .then(res => {
        const data = res.data;
        setMyForm({
          title: data.title || '',
          author: data.author || '',
          publisher: data.publisher || '',
          isbn: data.isbn || '',
          category: data.category || '',
          description: data.description || '',
          price: data.price || '',
          stock: data.stock || '',
          publicationDate: data.publicationDate ? data.publicationDate.split('T')[0] : '',
          isAvailable: data.available !== undefined ? data.available : true,
          coverImageUrl: data.coverImageUrl || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load book data:', err);
        alert('❌ Failed to load book data.');
        navigate('/list');
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMyForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', myForm.title);
    formData.append('author', myForm.author);
    formData.append('publisher', myForm.publisher);
    formData.append('isbn', myForm.isbn);
    formData.append('category', myForm.category);
    formData.append('description', myForm.description);
    formData.append('price', myForm.price);
    formData.append('stock', myForm.stock);
    formData.append('publicationDate', myForm.publicationDate || '');
    formData.append('available', myForm.isAvailable.toString());
    if (image) {
      formData.append('image', image);
    }

    try {
      await axiosConfig.put(`/api/books/${id}`, formData, {
        withCredentials: true,   // 🔥 REQUIRED
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert('✅ Book updated successfully!');
      navigate('/list');
    } catch (err) {
      console.error('Failed to update book:', err);
      alert('❌ Failed to update book.');
    }
  };

  if (loading) return <p>Loading book data...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">✏️ Edit Book</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Title */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Title *</label>
                <input
                  name="title"
                  className="form-control"
                  value={myForm.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Author */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Author *</label>
                <input
                  name="author"
                  className="form-control"
                  value={myForm.author}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Publisher */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Publisher</label>
                <input
                  name="publisher"
                  className="form-control"
                  value={myForm.publisher}
                  onChange={handleChange}
                />
              </div>

              {/* ISBN */}
              <div className="mb-3 col-md-6">
                <label className="form-label">ISBN</label>
                <input
                  name="isbn"
                  className="form-control"
                  value={myForm.isbn}
                  onChange={handleChange}
                />
              </div>

              {/* Category */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Category</label>
                <input
                  name="category"
                  className="form-control"
                  value={myForm.category}
                  onChange={handleChange}
                />
              </div>

              {/* Cover Image */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Upload New Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>

              {/* Preview old image */}
              {myForm.coverImageUrl && !image && (
                <div className="mb-3 col-12 text-center">
                  <label>Current Image</label>
                  <img
                    src={myForm.coverImageUrl}
                    alt="Book cover"
                    className="img-thumbnail"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}

              {/* Price */}
              <div className="mb-3 col-md-4">
                <label className="form-label">Price (£) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={myForm.price}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Stock */}
              <div className="mb-3 col-md-4">
                <label className="form-label">Stock *</label>
                <input
                  name="stock"
                  type="number"
                  className="form-control"
                  value={myForm.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Publication Date */}
              <div className="mb-3 col-md-4">
                <label className="form-label">Publication Date</label>
                <input
                  name="publicationDate"
                  type="date"
                  className="form-control"
                  value={myForm.publicationDate}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="mb-3 col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  value={myForm.description}
                  onChange={handleChange}
                />
              </div>

              {/* Availability */}
              <div className="form-check mb-3 ms-2">
                <input
                  name="isAvailable"
                  type="checkbox"
                  className="form-check-input"
                  checked={myForm.isAvailable}
                  onChange={handleChange}
                />
                <label className="form-check-label">Available</label>
              </div>
            </div>

            <button className="btn btn-success w-100 mt-2" type="submit">
              🔄 Update Book
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBook;
