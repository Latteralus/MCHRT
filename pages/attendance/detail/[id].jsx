import React, { useState } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Adjust path if needed
import { dbService } from '@/utils/dbService'; // Use dbService directly
import Layout from '@/components/common/Layout'; // Assuming Layout component path
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Helper function to safely format dates that might be strings or Date objects
const formatDateSafe = (dateInput, formatString = 'MMM dd, yyyy') => {
  if (!dateInput) return 'N/A';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isNaN(date.valueOf())) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return 'Invalid Date';
  }
};

// Helper to format status safely
const formatStatus = (status) => {
  const statusStr = typeof status === 'string' ? status : 'unknown';
  if (!statusStr) return 'N/A';
  return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
};

// Helper to get status badge color safely
const getStatusClass = (status) => {
  const statusStr = typeof status === 'string' ? status.toLowerCase() : 'unknown';
  switch (statusStr) {
    case 'present': return 'bg-green-100 text-green-800';
    case 'absent': return 'bg-red-100 text-red-800';
    case 'late': return 'bg-yellow-100 text-yellow-800';
    case 'half-day': return 'bg-blue-100 text-blue-800';
    case 'remote': return 'bg-purple-100 text-purple-800';
    case 'sick': return 'bg-orange-100 text-orange-800';
    case 'vacation': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AttendanceDetailPage({ attendanceRecord, error }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      timeIn: attendanceRecord?.timeIn || '',
      timeOut: attendanceRecord?.timeOut || '',
      status: attendanceRecord?.status || 'present',
      notes: attendanceRecord?.notes || ''
  });
  const [updateError, setUpdateError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

   // Handle input changes for the edit form
   const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for updates
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setUpdateError(null);

      try {
          const response = await fetch(`/api/attendance/${attendanceRecord.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to update record');
          }

          // Optionally refresh data or update local state upon success
          // For simplicity, just exit edit mode. A full refresh might be better.
          // router.replace(router.asPath); // This forces a getServerSideProps refresh
          const updatedRecord = await response.json();
           // Update local state to reflect changes immediately
          setFormData({
               timeIn: updatedRecord?.timeIn || '',
               timeOut: updatedRecord?.timeOut || '',
               status: updatedRecord?.status || 'present',
               notes: updatedRecord?.notes || ''
          });
          attendanceRecord.timeIn = updatedRecord.timeIn;
          attendanceRecord.timeOut = updatedRecord.timeOut;
          attendanceRecord.status = updatedRecord.status;
          attendanceRecord.notes = updatedRecord.notes;

          setIsEditing(false);

      } catch (err) {
          setUpdateError(err.message);
      } finally {
          setIsLoading(false);
      }
  };


  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-700 bg-red-100 p-4 rounded">{error}</p>
           <Link href="/attendance" legacyBehavior>
                <a className="mt-4 inline-block text-blue-600 hover:underline">Back to Attendance Log</a>
           </Link>
        </div>
      </Layout>
    );
  }

  if (!attendanceRecord) {
     // This case might occur if getServerSideProps returns null but no error message
    return (
       <Layout>
        <div className="container mx-auto px-4 py-8">
           <p className="text-center text-gray-500">Loading attendance details...</p>
            <Link href="/attendance" legacyBehavior>
                <a className="mt-4 block text-center text-blue-600 hover:underline">Back to Attendance Log</a>
           </Link>
        </div>
      </Layout>
    );
  }


  // Determine if the current user can edit this record
  // Logic might need refinement based on session.user structure and permissions
   const session = attendanceRecord.session; // Get session from props if passed
   const canEdit = session && (
       session.user.role === 'admin' ||
       session.user.role === 'hr_manager' ||
       (session.user.role === 'department_manager' && session.user.departmentId === attendanceRecord.employee?.departmentId) ||
       (session.user.employeeId === attendanceRecord.employee?.id /* && isToday(parseISO(attendanceRecord.date)) */ ) // Add date check if employees can only edit today's
   );


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
         <div className="mb-6">
             <Link href="/attendance" legacyBehavior>
                <a className="text-blue-600 hover:underline">&larr; Back to Attendance Log</a>
           </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Attendance Details
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          {updateError && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Update failed: {updateError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Employee</p>
              <p className="text-lg font-semibold text-gray-800">
                {attendanceRecord.employee?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDateSafe(attendanceRecord.date)}
              </p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
               <p className={`text-lg font-semibold ${getStatusClass(attendanceRecord.status)} inline-block px-2 py-0.5 rounded`}>
                 {formatStatus(attendanceRecord.status)}
              </p>
            </div>
             <div>
               {/* Placeholder for Department */}
               <p className="text-sm font-medium text-gray-500">Department</p>
               <p className="text-lg font-semibold text-gray-800">
                {attendanceRecord.employee?.department?.name || 'N/A'}
               </p>
            </div>
          </div>

          {!isEditing ? (
             // Display Mode
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time In</p>
                      <p className="text-lg text-gray-800">{attendanceRecord.timeIn || '--:--'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time Out</p>
                      <p className="text-lg text-gray-800">{attendanceRecord.timeOut || '--:--'}</p>
                    </div>
               </div>

                 <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{attendanceRecord.notes || 'No notes.'}</p>
                 </div>

                {canEdit && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        Edit Record
                    </button>
                 )}
             </>
          ) : (
              // Edit Mode
              <form onSubmit={handleUpdateSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                         <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-1">Time In</label>
                         <input type="time" id="timeIn" name="timeIn" value={formData.timeIn} onChange={handleInputChange} className="w-full p-2 border rounded" />
                     </div>
                     <div>
                         <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
                         <input type="time" id="timeOut" name="timeOut" value={formData.timeOut} onChange={handleInputChange} className="w-full p-2 border rounded" />
                     </div>
                      <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select id="status" name="status" value={formData.status} onChange={handleInputChange} required className="w-full p-2 border rounded">
                              {/* Populate with relevant statuses */}
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="half-day">Half Day</option>
                              <option value="remote">Remote</option>
                              <option value="sick">Sick</option>
                              <option value="vacation">Vacation</option>
                              <option value="leave">Other Leave</option>
                          </select>
                      </div>
                  </div>
                   <div className="mb-4">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} className="w-full p-2 border rounded" rows="3"></textarea>
                  </div>
                  <div className="flex items-center gap-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                       <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300" disabled={isLoading}>
                          Cancel
                      </button>
                  </div>
              </form>
          )}

        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const { id } = context.params; // Get ID from URL parameter

  try {
    // Fetch data using dbService (ensure it includes relations)
    // Assuming dbService.getAttendanceById includes employee and department
    const record = await dbService.getAttendanceById(id);

    if (!record) {
      return { notFound: true }; // Return 404 if record not found
    }

    // Basic permission check: Can this user view *any* record for this employee/dept?
    // More granular check happens client-side or can be enhanced here.
     let hasAccess = false;
     if (session.user.role === 'admin' || session.user.role === 'hr_manager') {
         hasAccess = true;
     } else if (session.user.role === 'department_manager' && session.user.departmentId === record.employee?.departmentId) {
         hasAccess = true;
     } else if (session.user.employeeId === record.employee?.id) {
         hasAccess = true;
     }

    if (!hasAccess) {
         console.warn(`User ${session.user.id} (${session.user.role}) denied access to attendance record ${id}`);
         // Return forbidden or redirect, depending on desired behavior
          return {
             //notFound: true // Or redirect to a permissions error page
             redirect: { destination: '/attendance?error=forbidden', permanent: false },
           };
    }


    // Serialize data (convert Dates to strings, handle complex objects)
    const serializedRecord = {
        ...record,
        date: record.date instanceof Date ? record.date.toISOString() : record.date,
        // Ensure nested objects like employee/department are serializable or select needed fields
        employee: record.employee ? {
            id: record.employee.id,
            name: `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim(),
            departmentId: record.employee.department?.id, // Pass dept ID
            department: record.employee.department ? { // Pass dept info if needed
                id: record.employee.department.id,
                name: record.employee.department.name
            } : null
        } : null,
        session: session // Pass session for client-side permission checks (optional)
    };
     // Remove non-serializable parts if session contains complex objects
     // delete serializedRecord.session; // If session object is too complex or not needed client-side


    return {
      props: {
        session: session, // Pass session to the page
        attendanceRecord: serializedRecord,
        error: null,
      },
    };
  } catch (error) {
    console.error(`Error fetching attendance record ${id} in getServerSideProps:`, error);
    return {
      props: {
        session: session, // Still pass session
        attendanceRecord: null,
        error: 'Failed to load attendance record details. Please try again later.',
      },
    };
  }
}