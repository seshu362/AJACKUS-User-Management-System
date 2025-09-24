import React, { useState, useEffect } from "react";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import Pagination from "./components/Pagination";
import Notification from "./components/Notification";
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [localUsers, setLocalUsers] = useState({});
  const [deletedUsers, setDeletedUsers] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [allFetchedUsers, setAllFetchedUsers] = useState([]); // Store all fetched users
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const USERS_PER_PAGE = 5;

  // Fetch all users at once (for better user management)
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();

      const updatedData = data.map((user) => {
        const [firstName, lastName] = user.name.split(" ");
        return {
          ...user,
          firstName,
          lastName: lastName || "",
          department: `Department ${Math.floor(Math.random() * 5) + 1}`,
        };
      });

      setAllFetchedUsers(updatedData);
      setTotalUsers(updatedData.length);
      setIsInitialLoad(false);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      setAllFetchedUsers([]);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // Get all active users (API users + local users - deleted users)
  const getAllActiveUsers = () => {
    const apiUsers = allFetchedUsers.filter(user => !deletedUsers.has(user.id));
    const allLocalUsers = Object.values(localUsers).flat();
    const activeLocalUsers = allLocalUsers.filter(user => !deletedUsers.has(user.id));
    
    return [...apiUsers, ...activeLocalUsers];
  };

  // Get users for current page with automatic redistribution
  const getCurrentPageUsers = () => {
    const allActiveUsers = getAllActiveUsers();
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    
    return allActiveUsers.slice(startIndex, endIndex);
  };

  // Get total number of pages needed
  const getTotalPages = () => {
    const totalActiveUsers = getAllActiveUsers().length;
    return Math.max(1, Math.ceil(totalActiveUsers / USERS_PER_PAGE));
  };

  // Check if current page is valid and adjust if needed
  const adjustCurrentPageIfNeeded = () => {
    const totalPages = getTotalPages();
    const allActiveUsers = getAllActiveUsers();
    
    if (allActiveUsers.length === 0) {
      // No users at all
      return;
    }
    
    if (currentPage > totalPages) {
      // Current page is beyond available pages, go to last page
      setCurrentPage(totalPages);
      setNotification({
        message: `Moved to page ${totalPages} as previous page became empty`,
        type: "info"
      });
    }
  };

  useEffect(() => {
    if (isInitialLoad) {
      fetchAllUsers();
    }
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialLoad]);

  // Adjust page when users change
  useEffect(() => {
    if (!isInitialLoad && !loading) {
      adjustCurrentPageIfNeeded();
    }
  }, [deletedUsers, localUsers, currentPage, isInitialLoad, loading]);

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleDeleteUser = async (id) => {
    setDeletingUserId(id);
    setError(null);
    
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Add to deleted users set
      setDeletedUsers(prev => new Set([...prev, id]));
      
      // Remove from local users if exists
      setLocalUsers(prevLocalUsers => {
        const updated = { ...prevLocalUsers };
        Object.keys(updated).forEach(page => {
          if (updated[page]) {
            updated[page] = updated[page].filter(user => user.id !== id);
            if (updated[page].length === 0) {
              delete updated[page];
            }
          }
        });
        return updated;
      });
      
      // Clear editing user if it was the deleted one
      if (editingUser && editingUser.id === id) {
        setEditingUser(null);
      }
      
      setNotification({ 
        message: "User deleted successfully", 
        type: "success" 
      });
      
    } catch (err) {
      setError(err.message || "Failed to delete user");
      setNotification({ 
        message: "Failed to delete user", 
        type: "error" 
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const generateNewUserId = () => {
    const allActiveUsers = getAllActiveUsers();
    const allUserIds = allActiveUsers.map(u => u.id);
    return Math.max(...allUserIds, 0) + 1;
  };

  const handleAddOrEditUser = async (userData) => {
    setError(null);
    
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = { ...userData, id: editingUser.id };
        
        // Check if user is from API or local
        const isApiUser = allFetchedUsers.some(user => user.id === editingUser.id);
        
        if (isApiUser) {
          // Update in fetched users
          setAllFetchedUsers(prevUsers =>
            prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
          );
        } else {
          // Update in local users
          setLocalUsers(prevLocalUsers => {
            const updated = { ...prevLocalUsers };
            Object.keys(updated).forEach(page => {
              if (updated[page]) {
                updated[page] = updated[page].map(user =>
                  user.id === updatedUser.id ? updatedUser : user
                );
              }
            });
            return updated;
          });
        }
        
        setNotification({ 
          message: "User updated successfully", 
          type: "success" 
        });
      } else {
        // Add new user
        const newUser = {
          ...userData,
          id: userData.id || generateNewUserId(),
        };
        
        // Add to local users for current page
        setLocalUsers(prevLocalUsers => ({
          ...prevLocalUsers,
          [currentPage]: [
            ...(prevLocalUsers[currentPage] || []),
            newUser,
          ],
        }));
        
        setNotification({ 
          message: "User added successfully", 
          type: "success" 
        });
      }
      
      setEditingUser(null);
    } catch (err) {
      setError("Failed to save user");
      setNotification({ 
        message: "Failed to save user", 
        type: "error" 
      });
    }
  };

  const handlePageChange = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setEditingUser(null);
    }
  };

  // Check if current page has users
  const hasUsersOnCurrentPage = () => {
    return getCurrentPageUsers().length > 0;
  };

  const totalActiveUsers = getAllActiveUsers().length;
  const currentPageUsers = getCurrentPageUsers();
  const totalPages = getTotalPages();

  return (
    <div className="App">
      <h1>User Management System</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <UserForm 
        user={editingUser} 
        onAddOrEditUser={handleAddOrEditUser}
        onCancel={() => setEditingUser(null)}
      />
      
      <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
        <UserList
          users={currentPageUsers}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          loading={loading}
          deletingUserId={deletingUserId}
          currentPage={currentPage}
          totalActiveUsers={totalActiveUsers}
        />
      </div>

      {/* Show pagination only if there are users and multiple pages */}
      {totalActiveUsers > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalUsers={totalActiveUsers}
          usersPerPage={USERS_PER_PAGE}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasUsersOnCurrentPage={hasUsersOnCurrentPage()}
        />
      )}
      
      {/* Show summary */}
      <div className="app-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Active Users:</span>
            <span className="summary-value">{totalActiveUsers}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Current Page:</span>
            <span className="summary-value">{currentPage} of {totalPages}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Users on This Page:</span>
            <span className="summary-value">{currentPageUsers.length}</span>
          </div>
          {deletedUsers.size > 0 && (
            <div className="summary-item">
              <span className="summary-label">Deleted Users:</span>
              <span className="summary-value deleted">{deletedUsers.size}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;