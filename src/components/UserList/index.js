import React from 'react';
import './index.css';

const LoadingSpinner = () => (
  <div className="spinner">
    <div className="spinner-circle"></div>
  </div>
);

const UserList = ({ users, onEditUser, onDeleteUser, loading, deletingUserId, currentPage, totalActiveUsers }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="no-users">
        {totalActiveUsers === 0 ? (
          <>
            <div className="no-users-icon">👥</div>
            <h3>No Users Found</h3>
            <p>There are currently no users in the system.</p>
            <p>Add a new user using the form above to get started.</p>
          </>
        ) : (
          <>
            <div className="no-users-icon">📄</div>
            <h3>No Users on This Page</h3>
            <p>All users on page {currentPage} have been removed.</p>
            <p>You will be automatically redirected to a page with users.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Users List</h2>
        <div className="user-count">
          {users.length} {users.length === 1 ? 'user' : 'users'} found
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`user-row ${deletingUserId === user.id ? 'deleting' : ''}`}
              >
                <td data-label="ID" className="user-id">
                  <span className="id-badge">{user.id}</span>
                </td>
                
                <td data-label="First Name" className="user-firstname">
                  <div className="user-name-cell">
                    <span className="name-text">{user.firstName}</span>
                  </div>
                </td>
                
                <td data-label="Last Name" className="user-lastname">
                  <div className="user-name-cell">
                    <span className="name-text">{user.lastName}</span>
                  </div>
                </td>
                
                <td data-label="Email" className="user-email">
                  <div className="email-cell">
                    <span className="email-text">{user.email}</span>
                    <a 
                      href={`mailto:${user.email}`} 
                      className="email-link"
                      title="Send email"
                    >
                      📧
                    </a>
                  </div>
                </td>
                
                <td data-label="Department" className="user-department">
                  <span className="department-badge">{user.department}</span>
                </td>
                
                <td data-label="Actions" className="user-actions">
                  <div className="action-buttons">
                    <button 
                      onClick={() => onEditUser(user)}
                      disabled={deletingUserId === user.id}
                      className="edit-btn"
                      title="Edit user"
                    >
                      <span className="btn-icon">✏️</span>
                      <span className="btn-text">Edit</span>
                    </button>
                    
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      disabled={deletingUserId !== null}
                      className="delete-btn"
                      title="Delete user"
                    >
                      {deletingUserId === user.id ? (
                        <>
                          <LoadingSpinner />
                          <span className="btn-text">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🗑️</span>
                          <span className="btn-text">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary footer */}
      <div className="user-list-footer">
        <div className="summary-stats">
          <span className="stat-item">
            <strong>Total:</strong> {users.length} users
          </span>
          <span className="stat-item">
            <strong>Page:</strong> {currentPage}
          </span>
          {deletingUserId && (
            <span className="stat-item deleting-status">
              <LoadingSpinner />
              Deleting user...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;