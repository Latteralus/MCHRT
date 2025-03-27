import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../auth/AuthProvider';
import { differenceInBusinessDays, addDays, format } from 'date-fns';

const LeaveRequestForm = ({ leaveId, initialData, employees }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isEditMode = !!leaveId;
  
  // Form state with react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      employeeId: user?.role === 'employee' ? user.id : '',
      leaveType: 'annual',
      startDate: new Date(),
      endDate: new Date(),
      halfDay: false,
      reason: '',
      status: 'pending',
      managerComments: ''
    }
  });
  
  // State for specific form elements
  const [startDateValue, setStartDateValue] = useState(
    initialData?.startDate ? new Date(initialData.startDate) : new Date()
  );
  const [endDateValue, setEndDateValue] = useState(
    initialData?.endDate ? new Date(initialData.endDate) : new Date()
  );
  const [businessDays, setBusinessDays] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Watch form values for dynamic calculations
  const watchHalfDay = watch('halfDay');
  const watchEmployeeId = watch('employeeId');
  const watchLeaveType = watch('leaveType');
  
  // State for leave balances
  const [leaveBalances, setLeaveBalances] = useState({
    annual: null,
    sick: null,
    personal: null,
    loading: true
  });
  
  // Update date values in form when DatePicker changes
  useEffect(() => {
    setValue('startDate', startDateValue);
    setValue('endDate', endDateValue);
  }, [startDateValue, endDateValue, setValue]);
  
  // Calculate business days when dates change
  useEffect(() => {
    if (startDateValue && endDateValue) {
      const days = differenceInBusinessDays(addDays(endDateValue, 1), startDateValue);
      setBusinessDays(watchHalfDay ? 0.5 : Math.max(days, 1));
    }
  }, [startDateValue, endDateValue, watchHalfDay]);
  
  // Fetch leave balances for selected employee
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (!watchEmployeeId) return;
      
      try {
        setLeaveBalances(prev => ({ ...prev, loading: true }));
        const response = await fetch(`/api/leave/balances/${watchEmployeeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leave balances');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setLeaveBalances({
            annual: data.balances.annual,
            sick: data.balances.sick,
            personal: data.balances.personal,
            loading: false
          });
        } else {
          throw new Error(data.error || 'Failed to fetch leave balances');
        }
      } catch (error) {
        console.error('Error fetching leave balances:', error);
        setLeaveBalances({
          annual: null,
          sick: null,
          personal: null,
          loading: false
        });
      }
    };
    
    fetchLeaveBalances();
  }, [watchEmployeeId]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    
    try {
      const url = isEditMode 
        ? `/api/leave/${leaveId}` 
        : '/api/leave';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(isEditMode ? 'Leave request updated successfully!' : 'Leave request submitted successfully!');
        
        // In create mode, redirect after a short delay
        if (!isEditMode) {
          setTimeout(() => {
            router.push(user.role === 'employee' ? '/leave' : '/leave/manage');
          }, 2000);
        }
      } else {
        setError(result.error || 'Failed to save leave request');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error saving leave request:', error);
    }
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    router.push(isEditMode ? `/leave/${leaveId}` : '/leave');
  };
  
  // Check if user can change status (managers and admins)
  const canChangeStatus = user && (user.role === 'admin' || user.role === 'hr_manager' || user.role === 'department_head');
  
  // Get current balance for selected leave type
  const getCurrentBalance = () => {
    if (leaveBalances.loading) return 'Loading...';
    if (leaveBalances[watchLeaveType] === null) return 'Not available';
    return `${leaveBalances[watchLeaveType]} days`;
  };
  
  // Check if requested days exceed balance
  const exceedsBalance = () => {
    if (leaveBalances.loading || leaveBalances[watchLeaveType] === null) return false;
    return businessDays > leaveBalances[watchLeaveType];
  };
  
  return (
    <div className="leave-request-form card">
      <div className="card-header">
        <h3 className="card-title">{isEditMode ? 'Edit Leave Request' : 'Submit Leave Request'}</h3>
      </div>
      
      <div className="card-body">
        {/* Error and success messages */}
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Employee selection (only for managers/admins) */}
            {user?.role !== 'employee' && employees && (
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">Employee</label>
                <select
                  id="employeeId"
                  className={`form-select ${errors.employeeId ? 'is-invalid' : ''}`}
                  {...register('employeeId', { required: 'Employee is required' })}
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
                {errors.employeeId && <div className="form-error">{errors.employeeId.message}</div>}
              </div>
            )}
            
            {/* Leave type */}
            <div className="form-group">
              <label htmlFor="leaveType" className="form-label">Leave Type</label>
              <select
                id="leaveType"
                className={`form-select ${errors.leaveType ? 'is-invalid' : ''}`}
                {...register('leaveType', { required: 'Leave type is required' })}
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="bereavement">Bereavement Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
              {errors.leaveType && <div className="form-error">{errors.leaveType.message}</div>}
              
              {/* Show balance for the selected leave type */}
              {watchEmployeeId && (
                <div className="form-helper">
                  Current Balance: <strong>{getCurrentBalance()}</strong>
                  {exceedsBalance() && (
                    <span className="text-danger"> (Exceeds available balance)</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Half day option */}
            <div className="form-group">
              <div className="form-checkbox">
                <input
                  id="halfDay"
                  type="checkbox"
                  {...register('halfDay')}
                />
                <label htmlFor="halfDay" className="form-checkbox-label">Half Day</label>
              </div>
            </div>
          </div>
          
          <div className="form-grid">
            {/* Start date */}
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <DatePicker
                id="startDate"
                selected={startDateValue}
                onChange={(date) => setStartDateValue(date)}
                className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                dateFormat="MM/dd/yyyy"
                minDate={new Date()}
                selectsStart
                startDate={startDateValue}
                endDate={endDateValue}
              />
              {errors.startDate && <div className="form-error">{errors.startDate.message}</div>}
            </div>
            
            {/* End date */}
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <DatePicker
                id="endDate"
                selected={endDateValue}
                onChange={(date) => setEndDateValue(date)}
                className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                dateFormat="MM/dd/yyyy"
                minDate={startDateValue}
                selectsEnd
                startDate={startDateValue}
                endDate={endDateValue}
              />
              {errors.endDate && <div className="form-error">{errors.endDate.message}</div>}
            </div>
            
            {/* Business days calculation */}
            <div className="form-group">
              <label className="form-label">Business Days</label>
              <div className="form-static-text">
                <strong>{businessDays}</strong> business day{businessDays !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {/* Leave reason */}
          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason for Leave</label>
            <textarea
              id="reason"
              className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
              rows="3"
              {...register('reason', { required: 'Reason is required' })}
            ></textarea>
            {errors.reason && <div className="form-error">{errors.reason.message}</div>}
          </div>
          
          {/* Status (only for managers/admins during edit) */}
          {isEditMode && canChangeStatus && (
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className="form-select"
                {...register('status')}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          
          {/* Manager comments (only for managers/admins) */}
          {canChangeStatus && (
            <div className="form-group">
              <label htmlFor="managerComments" className="form-label">Manager Comments</label>
              <textarea
                id="managerComments"
                className="form-control"
                rows="2"
                {...register('managerComments')}
              ></textarea>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : isEditMode ? 'Update Request' : 'Submit Request'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;