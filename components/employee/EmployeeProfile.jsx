import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { useAuth } from '../auth/AuthProvider';

const EmployeeProfile = ({ employeeId, initialData }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for employee data
  const [employee, setEmployee] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch employee data if not provided
  useEffect(() => {
    if (!initialData && employeeId) {
      fetchEmployee();
    }
  }, [employeeId, initialData]);
  
  // Check if user has edit permissions for this employee
  const canEdit = user && (
    user.role === 'admin' || 
    user.role === 'hr_manager' || 
    (user.role === 'department_head' && user.departmentId === employee?.departmentId)
  );
  
  // Fetch employee data from API
  const fetchEmployee = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setEmployee(data.data);
      } else {
        setError(data.error || 'Failed to fetch employee data');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete employee
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to employee list
        router.push('/employees');
      } else {
        setError(data.error || 'Failed to delete employee');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error deleting employee:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="employee-profile loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading employee data...</p>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="employee-profile error">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
        <Link href="/employees" className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Employees
        </Link>
      </div>
    );
  }
  
  // Handle missing employee data
  if (!employee) {
    return (
      <div className="employee-profile not-found">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i> Employee not found
        </div>
        <Link href="/employees" className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Employees
        </Link>
      </div>
    );
  }
  
  return (
    <div className="employee-profile">
      {/* Profile header */}
      <div className="profile-header card">
        <div className="profile-header-content">
          <div className="profile-avatar">
            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
          </div>
          
          <div className="profile-info">
            <h2 className="profile-name">{employee.firstName} {employee.lastName}</h2>
            <p className="profile-position">{employee.position}</p>
            <div className="profile-metadata">
              <span className="profile-department">
                <i className="fas fa-building"></i> {employee.department?.name || 'Unassigned'}
              </span>
              <span className="profile-status">
                <i className="fas fa-circle"></i> {formatStatus(employee.status)}
              </span>
              <span className="profile-hire-date">
                <i className="fas fa-calendar-alt"></i> Hired {formatDate(employee.hireDate)}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            {canEdit && (
              <Link href={`/employees/${employeeId}/edit`} className="btn btn-primary">
                <i className="fas fa-edit"></i> Edit
              </Link>
            )}
            
            {(user.role === 'admin' || user.role === 'hr_manager') && (
              <button className="btn btn-outline btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash"></i> Delete
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-user"></i> Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <i className="fas fa-calendar-alt"></i> Attendance
        </button>
        <button 
          className={`tab-button ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <i className="fas fa-calendar-check"></i> Leave
        </button>
        <button 
          className={`tab-button ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          <i className="fas fa-shield-alt"></i> Compliance
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <i className="fas fa-file-alt"></i> Documents
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-pane overview-tab">
            <div className="profile-grid">
              {/* Personal Information */}
              <div className="profile-section card">
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
                </div>
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <p>
                        <a href={`mailto:${employee.email}`}>
                          <i className="fas fa-envelope"></i> {employee.email}
                        </a>
                      </p>
                    </div>
                    
                    <div className="info-item">
                      <label>Phone</label>
                      <p>
                        <a href={`tel:${employee.phone}`}>
                          <i className="fas fa-phone"></i> {employee.phone || 'N/A'}
                        </a>
                      </p>
                    </div>
                    
                    <div className="info-item">
                      <label>Date of Birth</label>
                      <p><i className="fas fa-birthday-cake"></i> {formatDate(employee.dateOfBirth)}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Address</label>
                      <p>
                        {employee.address ? (
                          <>
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {employee.address}, {employee.city}, {employee.state} {employee.zipCode}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    
                    <div className="info-item">
                      <label>Emergency Contact</label>
                      <p>
                        {employee.emergencyContactName ? (
                          <>
                            <strong>{employee.emergencyContactName}</strong><br />
                            {employee.emergencyContactPhone}<br />
                            <small>({employee.emergencyContactRelationship})</small>
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Employment Details */}
              <div className="profile-section card">
                <div className="card-header">
                  <h3 className="card-title">Employment Details</h3>
                </div>
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Employee ID</label>
                      <p>{employee.id}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Position</label>
                      <p>{employee.position}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Department</label>
                      <p>{employee.department?.name || 'Unassigned'}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Manager</label>
                      <p>
                        {employee.manager ? (
                          <Link href={`/employees/${employee.manager.id}`}>
                            {employee.manager.firstName} {employee.manager.lastName}
                          </Link>
                        ) : (
                          'None'
                        )}
                      </p>
                    </div>
                    
                    <div className="info-item">
                      <label>Employment Type</label>
                      <p>{formatEmploymentType(employee.employmentType)}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Status</label>
                      <p>
                        <span className={`badge badge-${getStatusBadgeColor(employee.status)}`}>
                          {formatStatus(employee.status)}
                        </span>
                      </p>
                    </div>
                    
                    <div className="info-item">
                      <label>Hire Date</label>
                      <p>{formatDate(employee.hireDate)}</p>
                    </div>
                    
                    <div className="info-item">
                      <label>Termination Date</label>
                      <p>{formatDate(employee.terminationDate)}</p>
                    </div>
                    
                    {/* Only show salary/rate info to users with appropriate permissions */}
                    {(user.role === 'admin' || user.role === 'hr_manager') && (
                      <>
                        <div className="info-item">
                          <label>Annual Salary</label>
                          <p>${employee.salary ? parseFloat(employee.salary).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) : 'N/A'}</p>
                        </div>
                        
                        <div className="info-item">
                          <label>Hourly Rate</label>
                          <p>${employee.hourlyRate ? parseFloat(employee.hourlyRate).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) : 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Manager Notes (only visible to managers and HR) */}
                  {(user.role === 'admin' || user.role === 'hr_manager' || user.role === 'department_head') && (
                    <div className="manager-notes">
                      <h4>Manager Notes</h4>
                      <p>{employee.managerNotes || 'No manager notes available.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
          <div className="tab-pane attendance-tab">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Attendance Records</h3>
                <Link href={`/attendance?employeeId=${employeeId}`} className="action-link">
                  View all <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
              <div className="card-body">
                <p className="placeholder-text">
                  <i className="fas fa-info-circle"></i> Attendance tracking module is under development.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'leave' && (
          <div className="tab-pane leave-tab">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Leave Requests</h3>
                <Link href={`/leave?employeeId=${employeeId}`} className="action-link">
                  View all <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
              <div className="card-body">
                <p className="placeholder-text">
                  <i className="fas fa-info-circle"></i> Leave management module is under development.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'compliance' && (
          <div className="tab-pane compliance-tab">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Compliance Records</h3>
                <Link href={`/compliance?employeeId=${employeeId}`} className="action-link">
                  View all <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
              <div className="card-body">
                <p className="placeholder-text">
                  <i className="fas fa-info-circle"></i> Compliance management module is under development.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="tab-pane documents-tab">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Employee Documents</h3>
                <Link href={`/documents?employeeId=${employeeId}`} className="action-link">
                  View all <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
              <div className="card-body">
                <p className="placeholder-text">
                  <i className="fas fa-info-circle"></i> Document management module is under development.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
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

const formatEmploymentType = (type) => {
  switch (type) {
    case 'full_time': return 'Full Time';
    case 'part_time': return 'Part Time';
    case 'contract': return 'Contract';
    case 'temporary': return 'Temporary';
    case 'intern': return 'Intern';
    default: return type;
  }
};

export default EmployeeProfile;