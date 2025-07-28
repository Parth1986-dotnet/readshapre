import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <main className="p-4" style={{ flex: 1 }}>
          <h2>📊 Dashboard</h2>
          <p>Welcome to the admin panel. You can manage books here.</p>

          {/* Sample Card Section */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-bg-primary mb-3">
                <div className="card-body">
                  <h5 className="card-title">Total Books</h5>
                  <p className="card-text fs-4">120</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-bg-success mb-3">
                <div className="card-body">
                  <h5 className="card-title">In Stock</h5>
                  <p className="card-text fs-4">85</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-bg-danger mb-3">
                <div className="card-body">
                  <h5 className="card-title">Out of Stock</h5>
                  <p className="card-text fs-4">35</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
