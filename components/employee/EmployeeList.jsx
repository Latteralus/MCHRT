import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';

const EmployeeList = ({ initialEmployees, initialPagination, initialFilters }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for employees data
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [pagination, setPagination] = useState(initialPagination || {
    total: 0,
    skip: 0,
    take: 10,
    pages: 0
  });
  
  // State for filters and sorting
  const [filters, setFilters] = useState(initialFilters || {
    search: '',
    departmentId: '',
    status: '',
    sortBy: 'lastName',
    order: 'asc'
  });
  
  // State for departments
  const [departments, setDepartments] = useState([]);
  
  // State for loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        
        if (data.success) {
          setDepartments(data.data);
        } else {
          console.error('Failed to fetch departments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  // Fetch employees with current filters and pagination
  const fetchEmployees = async (newFilters = filters, newPagination = { skip: pagination.skip, take: pagination.take }) => {
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
      
      if (newFilters.search) queryParams.append('search', newFilters.search);
      if (newFilters.departmentId) queryParams.append('departmentId', newFilters.departmentId);
      if (newFilters.status) queryParams.append('status', newFilters.status);
      
      // Fetch data
      const response = await fetch(`/api/employees?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data.employees);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch employees');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch employees when filters change
  useEffect(() => {
    if (!initialEmployees) {
      fetchEmployees();
    }
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Reset pagination when filters change
    const newPagination = { ...pagination, skip: 0 };
    setPagination(newPagination);
    
    fetchEmployees(newFilters, newPagination);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
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
    
    fetchEmployees(filters, newPagination);
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
  
  return (
    <div className="employee-list">
      {/* Filters and search */}
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        
        <div className="filter-options">
          <div className="form-group">
            <label htmlFor="department-filter" className="form-label">Department</label>
            <select
              id="department-filter"
              className="form-select"
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="status-filter" className="form-label">Status</label>
            <select
              id="status-filter"
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {/* Employee table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('lastName')}>
                Name {getSortIndicator('lastName')}
              </th>
              <th onClick={() => handleSort('position')}>
                Position {getSortIndicator('position')}
              </th>
              <th onClick={() => handleSort('department.name')}>
                Department {getSortIndicator('department.name')}
              </th>
              <th onClick={() => handleSort('hireDate')}>
                Hire Date {getSortIndicator('hireDate')}
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
                <td colSpan="6" className="loading-cell">
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No employees found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link href={`/employees/${employee.id}`}>
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </td>
                  <td>{employee.position}</td>
                  <td>{employee.department?.name || 'Unassigned'}</td>
                  <td>{employee.hireDate ? format(new Date(employee.hireDate), 'MMM d, yyyy') : 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${getStatusBadgeColor(employee.status)}`}>
                      {formatStatus(employee.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/employees/${employee.id}`} className="btn-icon" title="View">
                        <i className="fas fa-eye"></i>
                      </Link>
                      
                      {(user.role === 'admin' || user.role === 'hr_manager' || 
                        (user.role === 'department_head' && user.departmentId === employee.departmentId)) && (
                        <Link href={`/employees/${employee.id}/edit`} className="btn-icon" title="Edit">
                          <i className="fas fa-edit"></i>
                        </Link>
                      )}
                      
                      {(user.role === 'admin' || user.role === 'hr_manager') && (
                        <button 
                          className="btn-icon delete-btn" 
                          title="Delete"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <i className="fas fa-trash"></i>
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
      
      {/* New Employee button */}
      {(user.role === 'admin' || user.role === 'hr_manager') && (
        <div className="employee-actions">
          <Link href="/employees/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> New Employee
          </Link>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatStatus = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'onboarding': return 'Onboarding';
    case 'on_leave': return 'On Leave';
    case 'terminated': return 'Terminated';
    case 'suspended': return 'Suspended';
    default: return status;
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'onboarding': return 'info';
    case 'on_leave': return 'warning';
    case 'terminated': return 'danger';
    case 'suspended': return 'danger';
    default: return 'secondary';
  }
};

export default EmployeeList;