import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/common/Layout';
import ComplianceCard from '../components/compliance/ComplianceCard';
import { useRouter } from 'next/router';

export default function CompliancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complianceRecords, setComplianceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    licenseType: '',
    licenseNumber: '',
    issueDate: '',
    expirationDate: '',
    status: 'valid',
    notes: ''
  });
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'valid', 'expiring', 'expired'

  // Only calculate isAdmin if session exists
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'hr_manager';

  useEffect(() => {
    // Only proceed with data fetching if session is loaded and user is authenticated
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch compliance records
    fetchComplianceRecords();
    
    // If user is admin or HR manager, also fetch employees for the form
    if (isAdmin) {
      fetchEmployees();
    }
  }, [session, status, filter, isAdmin, router]);

  const fetchComplianceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance');
      if (!response.ok) {
        throw new Error('Failed to fetch compliance records');
      }
      const data = await response.json();
      
      // Apply filter if needed
      let filteredData = data;
      if (filter !== 'all') {
        const today = new Date();
        filteredData = data.filter(record => {
          const expiration = new Date(record.expirationDate);
          const daysUntilExpiration = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
          
          if (filter === 'valid') return daysUntilExpiration > 30;
          if (filter === 'expiring') return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
          if (filter === 'expired') return daysUntilExpiration <= 0;
          return true;
        });
      }
      
      setComplianceRecords(filteredData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching compliance records:', err);
      setError('Failed to load compliance records. Please try again later.');
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/compliance/${editingId}` : '/api/compliance';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} compliance record`);
      }
      
      // Refresh the list
      fetchComplianceRecords();
      
      // Reset form
      setFormData({
        employeeId: '',
        licenseType: '',
        licenseNumber: '',
        issueDate: '',
        expirationDate: '',
        status: 'valid',
        notes: ''
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(`Failed to ${editingId ? 'update' : 'create'} compliance record. Please try again.`);
    }
  };

  const handleUpdate = (compliance) => {
    setFormData({
      employeeId: compliance.employee.id,
      licenseType: compliance.licenseType || '',
      licenseNumber: compliance.licenseNumber || '',
      issueDate: compliance.issueDate.split('T')[0] || '',
      expirationDate: compliance.expirationDate.split('T')[0] || '',
      status: compliance.status || 'valid',
      notes: compliance.notes || ''
    });
    setEditingId(compliance.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this compliance record?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/compliance/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete compliance record');
      }
      
      // Refresh the list
      fetchComplianceRecords();
    } catch (err) {
      console.error('Error deleting compliance record:', err);
      setError('Failed to delete compliance record. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // If loading session, show simple loading indicator
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading session...</p>
        </div>
      </Layout>
    );
  }

  // If no session and not loading, redirect is handled in useEffect
  if (!session && status !== 'loading') {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {showForm ? 'Cancel' : 'Add New Record'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Compliance Record' : 'Add New Compliance Record'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License/Certification Type
                  </label>
                  <input
                    type="text"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License/Certification Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="valid">Valid</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editingId ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm"
            >
              <option value="all">All Records</option>
              <option value="valid">Valid</option>
              <option value="expiring">Expiring Soon (30 days)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : complianceRecords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No compliance records found.
            </div>
          ) : (
            <div>
              {complianceRecords.map(record => (
                <ComplianceCard
                  key={record.id}
                  compliance={record}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}