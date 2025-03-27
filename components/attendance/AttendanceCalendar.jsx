import React, { useState, useEffect } from 'react';
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
  isWeekend
} from 'date-fns';
import { api, apiEndpoints } from '../utils/api';

const AttendanceCalendar = ({ attendanceRecords, employeeId, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch approved leave requests for the selected employee
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!employeeId) return;
      
      setIsLoading(true);
      try {
        // Fetch approved leave for this employee
        const params = {
          employeeId: employeeId,
          status: 'approved',
          // Adding month boundaries to filter leave requests more efficiently
          startDate: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        };

        const queryString = api.buildQueryParams(params);
        const response = await api.get(`${apiEndpoints.leave.base}${queryString}`);
        
        if (Array.isArray(response)) {
          setLeaveRequests(response);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [employeeId, currentMonth]);

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
    
    // Create calendar days with attendance info
    const daysWithInfo = days.map(date => {
      // Find attendance record for this day
      const recordForDay = attendanceRecords.find(record => 
        isSameDay(new Date(record.date), date)
      );
      
      // Check if this day has an approved leave request
      const leaveForDay = findLeaveForDate(date);
      
      return {
        date,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: isSameMonth(date, currentMonth),
        isWeekend: isWeekend(date),
        attendanceRecord: recordForDay || null,
        leaveRequest: leaveForDay || null,
        key: format(date, 'yyyy-MM-dd')
      };
    });
    
    // Combine blank days and actual days
    setCalendarDays([...blankDaysAtStart, ...daysWithInfo]);
  }, [currentMonth, attendanceRecords, leaveRequests]);

  // Helper to find leave requests for a specific date
  const findLeaveForDate = (date) => {
    return leaveRequests.find(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      // Set time to 0 for date comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      // Check if date falls within the leave period
      return date >= startDate && date <= endDate;
    });
  };

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
      if (onDateClick) {
        onDateClick(day.date, day.attendanceRecord, day.leaveRequest);
      }
    }
  };

  // Get status color for a day based on attendance record and leave request
  const getStatusColor = (day) => {
    // If there's a leave request, prioritize it
    if (day.leaveRequest) {
      switch (day.leaveRequest.leaveType.toLowerCase()) {
        case 'vacation':
        case 'annual':
          return 'bg-indigo-100 border-indigo-400';
        case 'sick':
        case 'sick leave':
          return 'bg-amber-100 border-amber-400';
        case 'personal':
          return 'bg-teal-100 border-teal-400';
        case 'bereavement':
          return 'bg-gray-100 border-gray-400';
        case 'maternity':
        case 'paternity':
        case 'maternity/paternity':
          return 'bg-pink-100 border-pink-400';
        default:
          return 'bg-violet-100 border-violet-400';
      }
    }
    
    // Otherwise, use attendance status
    if (!day.attendanceRecord) return '';
    
    switch (day.attendanceRecord.status) {
      case 'present':
        return 'bg-green-100 border-green-400';
      case 'absent':
        return 'bg-red-100 border-red-400';
      case 'late':
        return 'bg-yellow-100 border-yellow-400';
      case 'half-day':
        return 'bg-blue-100 border-blue-400';
      case 'remote':
        return 'bg-purple-100 border-purple-400';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Attendance Calendar
        </h2>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            &lt;
          </button>
          
          <span className="text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            &gt;
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center py-2 text-gray-500">
          Loading leave data...
        </div>
      )}
      
      {/* Calendar grid */}
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
              h-24 p-1 border rounded relative
              ${day.isBlank ? 'bg-gray-50' : ''}
              ${day.isWeekend && !day.isBlank ? 'bg-gray-50' : ''}
              ${day.isToday && !day.isBlank ? 'border-blue-500 border-2' : ''}
              ${getStatusColor(day)}
              ${day.date && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500' : ''}
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
                
                {/* Leave request badge */}
                {day.leaveRequest && (
                  <div className="absolute top-1 left-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-indigo-500" title={`${day.leaveRequest.leaveType}`}></span>
                  </div>
                )}
                
                {/* Attendance information */}
                {day.attendanceRecord && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium text-gray-700">
                      {day.attendanceRecord.status.charAt(0).toUpperCase() + day.attendanceRecord.status.slice(1)}
                    </div>
                    
                    {day.attendanceRecord.timeIn && (
                      <div className="text-gray-600">
                        In: {day.attendanceRecord.timeIn}
                      </div>
                    )}
                    
                    {day.attendanceRecord.timeOut && (
                      <div className="text-gray-600">
                        Out: {day.attendanceRecord.timeOut}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Leave information */}
                {day.leaveRequest && (
                  <div className="mt-2 text-xs">
                    <div className="font-medium text-indigo-700">
                      {day.leaveRequest.leaveType.charAt(0).toUpperCase() + day.leaveRequest.leaveType.slice(1)}
                    </div>
                    
                    {/* Show if it's first or last day of leave */}
                    {isSameDay(new Date(day.leaveRequest.startDate), day.date) && (
                      <div className="text-gray-600">First day</div>
                    )}
                    
                    {isSameDay(new Date(day.leaveRequest.endDate), day.date) && (
                      <div className="text-gray-600">Last day</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Updated Legend to include leave types */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-2"></div>
          <span className="text-sm">Present</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-400 rounded mr-2"></div>
          <span className="text-sm">Absent</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded mr-2"></div>
          <span className="text-sm">Late</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded mr-2"></div>
          <span className="text-sm">Half Day</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-100 border border-purple-400 rounded mr-2"></div>
          <span className="text-sm">Remote</span>
        </div>
        
        {/* Leave types */}
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-100 border border-indigo-400 rounded mr-2"></div>
          <span className="text-sm">Vacation</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-100 border border-amber-400 rounded mr-2"></div>
          <span className="text-sm">Sick Leave</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-teal-100 border border-teal-400 rounded mr-2"></div>
          <span className="text-sm">Personal Leave</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;