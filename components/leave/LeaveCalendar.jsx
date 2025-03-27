import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  isWeekend,
  parseISO,
  startOfDay,
  endOfDay,
  isWithinInterval
} from 'date-fns';
import { useAuth } from '../auth/AuthProvider';

const LeaveCalendar = ({ leaveRequests: initialLeaveRequests, departments = [] }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  
  // State for leave requests and filters
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests || []);
  const [loading, setLoading] = useState(!initialLeaveRequests);
  const [error, setError] = useState(null);
  
  // State for departments and filter
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('approved');
  
  // Selected day leave requests
  const [selectedDayLeaves, setSelectedDayLeaves] = useState([]);
  
  // Fetch leave requests for current month
  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        dateFrom: format(monthStart, 'yyyy-MM-dd'),
        dateTo: format(monthEnd, 'yyyy-MM-dd'),
        status: selectedStatus
      });
      
      if (selectedDepartment) {
        queryParams.append('departmentId', selectedDepartment);
      }
      
      if (selectedLeaveType) {
        queryParams.append('leaveType', selectedLeaveType);
      }
      
      // If department head, only show their department
      if (user?.role === 'department_head' && user?.departmentId) {
        queryParams.set('departmentId', user.departmentId);
      }
      
      // Fetch data
      const response = await fetch(`/api/leave?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveRequests(data.data.leaveRequests || []);
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
  
  // Generate calendar days for the current month
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate the first day of the month to determine blank days at start
    const startingDayOfWeek = getDay(monthStart);
    
    // Add blank days at the beginning (for proper alignment)
    const blankDaysAtStart = Array.from({ length: startingDayOfWeek }, (_, i) => ({
      date: null,
      isBlank: true,
      key: `blank-start-${i}`
    }));
    
    // Create calendar days with leave info
    const daysWithInfo = days.map(date => {
      // Find leave requests for this day
      const leavesForDay = getLeaveRequestsForDate(date);
      
      return {
        date,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: isSameMonth(date, currentMonth),
        isWeekend: isWeekend(date),
        leaveRequests: leavesForDay,
        key: format(date, 'yyyy-MM-dd')
      };
    });
    
    // Combine blank days and actual days
    setCalendarDays([...blankDaysAtStart, ...daysWithInfo]);
  }, [currentMonth, leaveRequests]);
  
  // Fetch leave requests when filters change
  useEffect(() => {
    fetchLeaveRequests();
  }, [currentMonth, selectedDepartment, selectedLeaveType, selectedStatus]);
  
  // Update selected day leaves when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDayLeaves(getLeaveRequestsForDate(selectedDate));
    } else {
      setSelectedDayLeaves([]);
    }
  }, [selectedDate, leaveRequests]);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Handle date click
  const handleDateClick = (day) => {
    if (day.date) {
      setSelectedDate(day.date);
    }
  };
  
  // Helper to get leave requests for a specific date
  const getLeaveRequestsForDate = (date) => {
    if (!date || !leaveRequests || leaveRequests.length === 0) return [];
    
    const dateLookup = startOfDay(date);
    
    return leaveRequests.filter(leave => {
      const leaveStart = startOfDay(parseISO(leave.startDate));
      const leaveEnd = endOfDay(parseISO(leave.endDate));
      
      return isWithinInterval(dateLookup, { start: leaveStart, end: leaveEnd });
    });
  };
  
  // Get color based on leave type
  const getLeaveTypeColor = (leaveType) => {
    switch (leaveType) {
      case 'annual': return 'bg-blue-100 border-blue-400';
      case 'sick': return 'bg-red-100 border-red-400';
      case 'personal': return 'bg-green-100 border-green-400';
      case 'unpaid': return 'bg-gray-100 border-gray-400';
      case 'bereavement': return 'bg-purple-100 border-purple-400';
      case 'maternity': return 'bg-pink-100 border-pink-400';
      case 'paternity': return 'bg-indigo-100 border-indigo-400';
      default: return 'bg-gray-100 border-gray-400';
    }
  };
  
  // Format leave type for display
  const formatLeaveType = (type) => {
    switch (type) {
      case 'annual': return 'Annual';
      case 'sick': return 'Sick';
      case 'personal': return 'Personal';
      case 'unpaid': return 'Unpaid';
      case 'bereavement': return 'Bereavement';
      case 'maternity': return 'Maternity';
      case 'paternity': return 'Paternity';
      default: return type;
    }
  };
  
  return (
    <div className="leave-calendar">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {/* Calendar header with controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            Leave Calendar
          </h2>
          
          <div className="flex space-x-4 items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                aria-label="Previous month"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="text-lg font-medium min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                aria-label="Next month"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
            >
              Today
            </button>
          </div>
        </div>
        
        {/* Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Department filter (for admins and HR managers) */}
          {(user?.role === 'admin' || user?.role === 'hr_manager') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="form-select w-full"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Leave type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              className="form-select w-full"
              value={selectedLeaveType}
              onChange={(e) => setSelectedLeaveType(e.target.value)}
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
          
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="form-select w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Calendar grid */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Loading calendar...</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-2">
            {/* Day names */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="text-center font-medium text-gray-500 text-sm py-2"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map(day => (
              <div
                key={day.key}
                className={`
                  h-24 p-1 border rounded relative overflow-y-auto
                  ${day.isBlank ? 'bg-gray-50' : 'cursor-pointer'}
                  ${day.isWeekend && !day.isBlank ? 'bg-gray-50' : ''}
                  ${day.isToday && !day.isBlank ? 'border-blue-500 border-2' : ''}
                  ${day.date && selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => !day.isBlank && handleDateClick(day)}
              >
                {!day.isBlank && (
                  <>
                    <div className="text-right">
                      <span className={`text-sm ${day.isToday ? 'font-bold' : ''}`}>
                        {format(day.date, 'd')}
                      </span>
                    </div>
                    
                    {/* Leave indicators */}
                    <div className="mt-1 space-y-1">
                      {day.leaveRequests.slice(0, 3).map((leave, index) => (
                        <div 
                          key={`${leave.id}-${index}`}
                          className={`
                            text-xs px-1 py-0.5 rounded truncate
                            ${getLeaveTypeColor(leave.leaveType)}
                          `}
                          title={`${leave.employee?.firstName} ${leave.employee?.lastName} - ${formatLeaveType(leave.leaveType)}`}
                        >
                          {leave.employee?.firstName} {leave.employee?.lastName.charAt(0)}.
                        </div>
                      ))}
                      
                      {/* Show indicator for more leave requests */}
                      {day.leaveRequests.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium text-center">
                          +{day.leaveRequests.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded mr-2"></div>
            <span className="text-sm">Annual Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-400 rounded mr-2"></div>
            <span className="text-sm">Sick Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-2"></div>
            <span className="text-sm">Personal Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded mr-2"></div>
            <span className="text-sm">Unpaid Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 border border-purple-400 rounded mr-2"></div>
            <span className="text-sm">Bereavement Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-pink-100 border border-pink-400 rounded mr-2"></div>
            <span className="text-sm">Maternity Leave</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-100 border border-indigo-400 rounded mr-2"></div>
            <span className="text-sm">Paternity Leave</span>
          </div>
        </div>
      </div>
      
      {/* Selected day leave details */}
      {selectedDate && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Leave for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            <Link 
              href={`/leave/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Request Leave
            </Link>
          </div>
          
          {selectedDayLeaves.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No leave requests for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedDayLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${getLeaveTypeColor(leave.leaveType)}`}>
                          {formatLeaveType(leave.leaveType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(leave.startDate), 'MMM d')}
                        {leave.startDate !== leave.endDate && ` - ${format(parseISO(leave.endDate), 'MMM d')}`}
                        <span className="ml-1 text-xs">
                          ({leave.businessDays} {leave.businessDays === 1 ? 'day' : 'days'})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            leave.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/leave/${leave.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </Link>
                        
                        {/* Edit link for appropriate users */}
                        {((user.id === leave.employeeId && leave.status === 'pending') || 
                           user.role === 'admin' || user.role === 'hr_manager' ||
                           (user.role === 'department_head' && user.departmentId === leave.employee?.departmentId)) && (
                          <Link href={`/leave/${leave.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;