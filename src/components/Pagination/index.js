import React from "react";
import './index.css';

const Pagination = ({ 
  currentPage, 
  totalUsers, 
  usersPerPage, 
  totalPages, 
  onPageChange, 
  hasUsersOnCurrentPage 
}) => {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to show
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  };

  const startUser = (currentPage - 1) * usersPerPage + 1;
  const endUser = Math.min(currentPage * usersPerPage, totalUsers);

  return (
    <div className="pagination">
      <div className="pagination-controls">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <span className="btn-icon">←</span>
          <span className="btn-text">Previous</span>
        </button>
        
        <div className="page-numbers">
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button onClick={() => handlePageClick(1)} className="page-number">
                1
              </button>
              {currentPage > 4 && <span className="pagination-dots">...</span>}
            </>
          )}
          
          {getVisiblePages().map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`page-number ${page === currentPage ? 'active' : ''}`}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          
          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && <span className="pagination-dots">...</span>}
              <button onClick={() => handlePageClick(totalPages)} className="page-number">
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          <span className="btn-text">Next</span>
          <span className="btn-icon">→</span>
        </button>
      </div>
      
      <div className="pagination-info">
        <div className="page-info">
          <span>
            Showing {startUser}-{endUser} of {totalUsers} users
          </span>
          {!hasUsersOnCurrentPage && (
            <span className="empty-page-indicator">
              (Redistributing users...)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;