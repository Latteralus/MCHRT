import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../auth/AuthProvider';

const EmployeeForm = ({ employeeId, initialData }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isEditMode = !!employeeId;
  
  // Form state using react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      position: '',
      departmentId: '',
      employmentType: 'full_time',
      status: 'onboarding',
      salary: '',
      hourlyRate: '',
      managerId: '',
      hireDate: new Date()
    }
  });
  
  // State for form-specific data
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Watch department selection to filter managers
  const selectedDepartmentId = watch('departmentId');
  
  // State for date pickers
  const [hireDateValue, setHireDateValue] = useState(
    initialData?.hireDate ? new Date(initialData.hireDate) : new Date()
  );
  const [terminationDateValue, setTerminationDateValue] = useState(
    initialData?.terminationDate ? new Date(initialData.terminationDate) : null
  );
  const [dateOfBirthValue, setDateOfBirthValue] = useState(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : null
  );
  
  // Load departments and managers on component mount
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
    
    const fetchManagers = async () => {
      try {
        // Only fetch managers from selected department if one is selected
        let url = '/api/employees?take=100';
        
        if (selectedDepartmentId) {
          url += `&departmentId=${selectedDepartmentId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          // Filter to only include managers or senior employees
          const potentialManagers = data.data.employees.filter(emp => 
            emp.position.toLowerCase().includes('manager') || 
            emp.position.toLowerCase().includes('director') ||
            emp.position.toLowerCase().includes('lead') ||
            emp.position.toLowerCase().includes('senior')
          );
          
          setManagers(potentialManagers);
        } else {
          console.error('Failed to fetch managers:', data.error);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };
    
    fetchDepartments();
    fetchManagers();
  }, [selectedDepartmentId]);
  
  // Handle date changes
  useEffect(() => {
    setValue('hireDate', hireDateValue);
    setValue('terminationDate', terminationDateValue);
    setValue('dateOfBirth', dateOfBirthValue);
  }, [hireDateValue, terminationDateValue, dateOfBirthValue, setValue]);
  
  // Form submission handler
  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    
    try {
      const url = isEditMode 
        ? `/api/employees/${employeeId}` 
        : '/api/employees';
      
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
        setSuccess(isEditMode ? 'Employee updated successfully!' : 'Employee created successfully!');
        
        // In create mode, redirect to the employee list after a short delay
        if (!isEditMode) {
          setTimeout(() => {
            router.push('/employees');
          }, 2000);
        }
      } else {
        setError(result.error || 'Failed to save employee');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error saving employee:', error);
    }
  };
  
  // Form cancellation handler
  const handleCancel = () => {
    router.push(isEditMode ? `/employees/${employeeId}` : '/employees');
  };
  
  return (
    <div className="employee-form card">
      <div className="card-header">
        <h3 className="card-title">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h3>
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
          <div className="form-section">
            <h4 className="form-section-title">Personal Information</h4>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && <div className="form-error">{errors.firstName.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && <div className="form-error">{errors.lastName.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <div className="form-error">{errors.email.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  {...register('phone')}
                />
                {errors.phone && <div className="form-error">{errors.phone.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                <DatePicker
                  id="dateOfBirth"
                  selected={dateOfBirthValue}
                  onChange={(date) => setDateOfBirthValue(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()}
                />
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  id="address"
                  type="text"
                  className="form-control"
                  {...register('address')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="city" className="form-label">City</label>
                <input
                  id="city"
                  type="text"
                  className="form-control"
                  {...register('city')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state" className="form-label">State</label>
                <input
                  id="state"
                  type="text"
                  className="form-control"
                  {...register('state')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">Zip Code</label>
                <input
                  id="zipCode"
                  type="text"
                  className="form-control"
                  {...register('zipCode')}
                />
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergencyContactName" className="form-label">Emergency Contact Name</label>
                <input
                  id="emergencyContactName"
                  type="text"
                  className="form-control"
                  {...register('emergencyContactName')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactPhone" className="form-label">Emergency Contact Phone</label>
                <input
                  id="emergencyContactPhone"
                  type="tel"
                  className="form-control"
                  {...register('emergencyContactPhone')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactRelationship" className="form-label">Relationship</label>
                <input
                  id="emergencyContactRelationship"
                  type="text"
                  className="form-control"
                  {...register('emergencyContactRelationship')}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="form-section-title">Employment Information</h4>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="position" className="form-label">Position</label>
                <input
                  id="position"
                  type="text"
                  className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                  {...register('position', { required: 'Position is required' })}
                />
                {errors.position && <div className="form-error">{errors.position.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="departmentId" className="form-label">Department</label>
                <select
                  id="departmentId"
                  className={`form-select ${errors.departmentId ? 'is-invalid' : ''}`}
                  {...register('departmentId')}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.departmentId && <div className="form-error">{errors.departmentId.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="managerId" className="form-label">Manager</label>
                <select
                  id="managerId"
                  className="form-select"
                  {...register('managerId')}
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName} - {manager.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="employmentType" className="form-label">Employment Type</label>
                <select
                  id="employmentType"
                  className="form-select"
                  {...register('employmentType')}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  className="form-select"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="hireDate" className="form-label">Hire Date</label>
                <DatePicker
                  id="hireDate"
                  selected={hireDateValue}
                  onChange={(date) => setHireDateValue(date)}
                  className={`form-control ${errors.hireDate ? 'is-invalid' : ''}`}
                  dateFormat="MM/dd/yyyy"
                />
                {errors.hireDate && <div className="form-error">{errors.hireDate.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="terminationDate" className="form-label">Termination Date</label>
                <DatePicker
                  id="terminationDate"
                  selected={terminationDateValue}
                  onChange={(date) => setTerminationDateValue(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  isClearable
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="salary" className="form-label">Annual Salary</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    {...register('salary', {
                      min: { value: 0, message: 'Salary cannot be negative' }
                    })}
                  />
                </div>
                {errors.salary && <div className="form-error">{errors.salary.message}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="hourlyRate" className="form-label">Hourly Rate</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    {...register('hourlyRate', {
                      min: { value: 0, message: 'Hourly rate cannot be negative' }
                    })}
                  />
                </div>
                {errors.hourlyRate && <div className="form-error">{errors.hourlyRate.message}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="managerNotes" className="form-label">Manager Notes</label>
              <textarea
                id="managerNotes"
                className="form-control"
                rows="3"
                {...register('managerNotes')}
              ></textarea>
              <div className="form-helper">Private notes visible only to managers and HR</div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : isEditMode ? 'Update Employee' : 'Create Employee'}
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

export default EmployeeForm;