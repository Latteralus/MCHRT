import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';

const LeaveList = ({ initialLeaveRequests, initialPagination, initialFilters }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for leave requests data
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests || []);
  const [pagination, setPagination] = useState(initialPagination || {
    total: 0,
    skip: 0,
    take: 10,
    pages: 0
  });
  
  // State for filters and sorting
  const [filters, setFilters] = useState(initialFilters || {
    employeeId: '',
    status: '',
    leaveType: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'startDate',
    order: 'desc'
  });
  
  // State for loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for employees (for filter dropdown)
  const [employees, setEmployees] = useState([]);
  
  // Load employees on component mount (for managers/admins)
  useEffect(() => {
    const fetchEmployees = async () => {
      if (user?.role === 'employee') return;
      
      try {
        // For department heads, only fetch employees in their department
        let url = '/api/employees?take=100';
        if (user?.role === 'department_head' && user?.departmentId) {
          url += `&departmentId=${user.departmentId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setEmployees(data.data.employees || []);
        } else {
          console.error('Failed to fetch employees:', data.error);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    
    fetchEmployees();
  }, [user]);
  
  // Fetch leave requests with current filters and pagination
  const fetchLeaveRequests = async (newFilters = filters, newPagination = { skip: pagination.skip, take: pagination.take }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string from filters and pagination
      const queryParams = new URLSearchParams({
        skip: newPagination.skip.toString(),
        take: newPagination.take.toString(),
        sortBy: newFilters.sortBy,
        order: newFilters.order
      });
      
      // Only include employeeId for managers/admins, for employees it's implied
      if (newFilters.employeeId && user?.role !== 'employee') {
        queryParams.append('employeeId', newFilters.employeeId);
      }
      
      if (newFilters.status) queryParams.append('status', newFilters.status);
      if (newFilters.leaveType) queryParams.append('leaveType', newFilters.leaveType);
      if (newFilters.dateFrom) queryParams.append('dateFrom', newFilters.dateFrom);
      if (newFilters.dateTo) queryParams.append('dateTo', newFilters.dateTo);
      
      // For employees, only show their own requests (handled by API)
      // For department heads, only show their department's requests (handled by API)
      
      // Fetch data
      const response = await fetch(`/api/leave?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.data.leaveRequests);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch leave requests');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch leave requests when filters change
  useEffect(() => {
    if (!initialLeaveRequests) {
      fetchLeaveRequests();
    }
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Reset pagination when filters change
    const newPagination = { ...pagination, skip: 0 };
    setPagination(newPagination);
    
    fetchLeaveRequests(newFilters, newPagination);
  };
  
  // Handle date range filter
  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    fetchLeaveRequests();
  };
  
  // Handle sort change
  const handleSort = (field) => {
    let newOrder = 'asc';
    
    // If already sorting by this field, toggle order
    if (filters.sortBy === field) {
      newOrder = filters.order === 'asc' ? 'desc' : 'asc';
    }
    
    handleFilterChange('sortBy', field);
    handleFilterChange('order', newOrder);
  };
  
  // Handle pagination
  const handlePageChange = (newSkip) => {
    const newPagination = { ...pagination, skip: newSkip };
    setPagination(newPagination);
    
    fetchLeaveRequests(filters, newPagination);
  };
  
  // Get sort direction indicator
  const getSortIndicator = (field) => {
    if (filters.sortBy !== field) return null;
    return filters.order === 'asc' ? '↑' : '↓';
  };
  
  // Generate pagination controls
  const renderPagination = () => {
    const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
    const totalPages = pagination.pages;
    
    return (
      <div className="pagination">
        <button 
          className="btn btn-outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange((currentPage - 2) * pagination.take)}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          className="btn btn-outline"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage * pagination.take)}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };
  
  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    // If same day, show just one date
    if (startDate === endDate) {
      return format(start, 'MMM d, yyyy');
    }
    
    // If same month and year, show abbreviated format
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    
    // Otherwise show full format
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };
  
  // Function to approve or reject leave request
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/leave/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          managerComments: newStatus === 'rejected' ? prompt('Please provide a reason for rejection:') : ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the leave request in the list
        setLeaveRequests(leaveRequests.map(request => 
          request.id === id ? { ...request, status: newStatus } : request
        ));
      } else {
        setError(data.error || `Failed to ${newStatus} leave request`);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(`Error updating leave status to ${newStatus}:`, error);
    }
  };
  
  return (
    <div className="leave-list">
      {/* Filters and search */}
      <div className="filters">
        <div className="filter-grid">
          {/* Employee filter (for managers/admins) */}
          {user?.role !== 'employee' && (
            <div className="form-group">
              <label htmlFor="employee-filter" className="form-label">Employee</label>
              <select
                id="employee-filter"
                className="form-select"
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Status filter */}
          <div className="form-group">
            <label htmlFor="status-filter" className="form-label">Status</label>
            <select
              id="status-filter"
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Leave type filter */}
          <div className="form-group">
            <label htmlFor="type-filter" className="form-label">Leave Type</label>
            <select
              id="type-filter"
              className="form-select"
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="bereavement">Bereavement Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
            </select>
          </div>
          
          {/* Date range filter */}
          <form onSubmit={handleDateFilterSubmit} className="date-filter">
            <div className="form-group">
              <label htmlFor="date-from" className="form-label">From</label>
              <input
                id="date-from"
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date-to" className="form-label">To</label>
              <input
                id="date-to"
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            
            <button type="submit" className="btn btn-primary mt-auto">Apply</button>
          </form>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {/* Leave requests table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {user?.role !== 'employee' && (
                <th onClick={() => handleSort('employee.lastName')}>
                  Employee {getSortIndicator('employee.lastName')}
                </th>
              )}
              <th onClick={() => handleSort('leaveType')}>
                Leave Type {getSortIndicator('leaveType')}
              </th>
              <th onClick={() => handleSort('startDate')}>
                Date Range {getSortIndicator('startDate')}
              </th>
              <th onClick={() => handleSort('businessDays')}>
                Days {getSortIndicator('businessDays')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {getSortIndicator('status')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={user?.role !== 'employee' ? 6 : 5} className="loading-cell">
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </td>
              </tr>
            ) : leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={user?.role !== 'employee' ? 6 : 5} className="empty-cell">
                  No leave requests found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              leaveRequests.map((leave) => (
                <tr key={leave.id}>
                  {user?.role !== 'employee' && (
                    <td>
                      <Link href={`/employees/${leave.employeeId}`}>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </Link>
                    </td>
                  )}
                  <td>{formatLeaveType(leave.leaveType)}</td>
                  <td>{formatDateRange(leave.startDate, leave.endDate)}</td>
                  <td>{leave.businessDays} {leave.businessDays === 1 ? 'day' : 'days'}</td>
                  <td>
                    <span className={`badge badge-${getStatusBadgeColor(leave.status)}`}>
                      {formatStatus(leave.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/leave/${leave.id}`} className="btn-icon" title="View Details">
                        <i className="fas fa-eye"></i>
                      </Link>
                      
                      {/* Edit button (for employee's own request or admins/managers) */}
                      {((user.id === leave.employeeId && leave.status === 'pending') || 
                         user.role === 'admin' || user.role === 'hr_manager' ||
                         (user.role === 'department_head' && user.departmentId === leave.employee?.departmentId)) && (
                        <Link href={`/leave/${leave.id}/edit`} className="btn-icon" title="Edit">
                          <i className="fas fa-edit"></i>
                        </Link>
                      )}
                      
                      {/* Approve/Reject buttons (for managers/admins) */}
                      {(user.role === 'admin' || user.role === 'hr_manager' || 
                        (user.role === 'department_head' && user.departmentId === leave.employee?.departmentId)) && 
                        leave.status === 'pending' && (
                        <>
                          <button 
                            className="btn-icon approve-btn" 
                            title="Approve"
                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          
                          <button 
                            className="btn-icon reject-btn" 
                            title="Reject"
                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      
                      {/* Cancel button (for employee's own pending request) */}
                      {user.id === leave.employeeId && leave.status === 'pending' && (
                        <button 
                          className="btn-icon cancel-btn" 
                          title="Cancel Request"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this leave request?')) {
                              handleStatusUpdate(leave.id, 'cancelled');
                            }
                          }}
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.total > 0 && renderPagination()}
      
      {/* New Leave Request button */}
      <div className="leave-actions">
        <Link href="/leave/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Leave Request
        </Link>
      </div>
    </div>
  );
};

// Helper functions
const formatStatus = (status) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    case 'cancelled': return 'secondary';
    default: return 'secondary';
  }
};

const formatLeaveType = (type) => {
  switch (type) {
    case 'annual': return 'Annual Leave';
    case 'sick': return 'Sick Leave';
    case 'personal': return 'Personal Leave';
    case 'unpaid': return 'Unpaid Leave';
    case 'bereavement': return 'Bereavement Leave';
    case 'maternity': return 'Maternity Leave';
    case 'paternity': return 'Paternity Leave';
    default: return type;
  }
};

export default LeaveList;