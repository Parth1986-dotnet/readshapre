import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddBook() {
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
    coverImageUrl: '',
    publicationDate: '',
    isAvailable: true,
  });

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMyForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ✅ Client-side image validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      alert(`❌ Invalid file type. Only JPG and PNG images are allowed. You selected: ${file.type}`);
      e.target.value = ''; // clear input
      return;
    }

    if (!['jpg', 'jpeg', 'png'].includes(extension)) {
      alert('❌ Only .jpg, .jpeg, and .png file extensions are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      alert('❌ Image size must be less than 2MB.');
      e.target.value = '';
      return;
    }

    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!myForm.title || !myForm.author || !myForm.price || !myForm.stock) {
      alert("❗ Title, Author, Price, and Stock are required.");
      return;
    }

    if (myForm.price < 0 || myForm.stock < 0) {
      alert("❗ Price and Stock must be non-negative.");
      return;
    }

    const formData = new FormData();
    formData.append("title", myForm.title);
    formData.append("author", myForm.author);
    formData.append("publisher", myForm.publisher);
    formData.append("isbn", myForm.isbn);
    formData.append("category", myForm.category);
    formData.append("description", myForm.description);
    formData.append("price", myForm.price);
    formData.append("stock", myForm.stock);
    formData.append("publicationDate", myForm.publicationDate);
    formData.append("available", myForm.isAvailable.toString());
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8081/api/books", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await res.json();
      alert("✅ Book uploaded successfully!");
      setTimeout(() => {
        navigate("/list");
      }, 500);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload book. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">📘 Add New Book</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
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

              <div className="mb-3 col-md-6">
                <label className="form-label">Publisher</label>
                <input
                  name="publisher"
                  className="form-control"
                  value={myForm.publisher}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">ISBN</label>
                <input
                  name="isbn"
                  className="form-control"
                  value={myForm.isbn}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">Category</label>
                <input
                  name="category"
                  className="form-control"
                  value={myForm.category}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 col-md-6">
                <label className="form-label">Upload Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>

              {(myForm.coverImageUrl || image) && (
                <div className="mb-3 col-12 text-center">
                  <img
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : myForm.coverImageUrl
                    }
                    alt="Cover Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}

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

              <div className="mb-3 col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  value={myForm.description}
                  onChange={handleChange}
                ></textarea>
              </div>

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

            <button
              type="submit"
              className="btn btn-primary w-100 mt-2"
              disabled={submitting}
            >
              {submitting ? 'Uploading...' : '➕ Add Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBook;
