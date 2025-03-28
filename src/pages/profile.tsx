import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import axios from 'axios';
// import MainLayout from '@/components/layouts/MainLayout'; // Applied via _app.tsx

// Define an interface for the user's profile data (adjust based on actual API response)
interface UserProfile {
  id: number;
  username: string;
  role: string;
  departmentId?: number;
  // Potentially link to employee details if applicable
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    position?: string;
    hireDate?: string;
  };
  // Add other relevant fields
}

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile data when session is loaded and user is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          // Assuming an API endpoint exists to get the current user's full profile
          // Adjust the endpoint and response structure as needed
          const response = await axios.get<UserProfile>(`/api/users/profile`); // Or maybe /api/profile
          setProfile(response.data);
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          setError(err.response?.data?.message || 'Failed to load profile data.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else if (status === 'unauthenticated') {
      // Handle case where user is not logged in (though middleware should redirect)
      setError('You must be logged in to view your profile.');
      setLoading(false);
    } else {
      // Session status is 'loading'
      setLoading(true);
    }
  }, [session, status]);

  // Basic styling (reuse or create shared components)
  const detailStyles: React.CSSProperties = {
    padding: '1rem',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'white',
    marginTop: '1rem',
  };
  const labelStyles: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--gray-700)',
    minWidth: '120px',
    display: 'inline-block',
  };
  const itemStyles: React.CSSProperties = {
    marginBottom: '0.75rem',
  };

  if (loading || status === 'loading') {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p style={{ color: 'var(--danger)' }}>Error: {error}</p>;
  }

  if (!profile) {
    return <p>Profile data not available.</p>;
  }

  return (
    <>
      <Head>
        <title>My Profile - Mountain Care HR</title>
      </Head>
      <div>
        <h2>My Profile</h2>

        {/* TODO: Add Edit Profile button/link */}

        <div style={detailStyles}>
          <h3>Account Information</h3>
          <div style={itemStyles}>
            <span style={labelStyles}>Username:</span> {profile.username}
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>Role:</span> {profile.role}
          </div>
          {/* Add more account fields if needed */}
        </div>

        {profile.employee && (
          <div style={{ ...detailStyles, marginTop: '1rem' }}>
            <h3>Employee Information</h3>
            <div style={itemStyles}>
              <span style={labelStyles}>Name:</span> {profile.employee.firstName} {profile.employee.lastName}
            </div>
            <div style={itemStyles}>
              <span style={labelStyles}>Position:</span> {profile.employee.position || 'N/A'}
            </div>
            <div style={itemStyles}>
              <span style={labelStyles}>Hire Date:</span> {profile.employee.hireDate ? new Date(profile.employee.hireDate).toLocaleDateString() : 'N/A'}
            </div>
            {/* Link to full employee record if needed and permitted */}
            {/* <Link href={`/employees/${profile.employee.id}`}><a>View Full Employee Record</a></Link> */}
          </div>
        )}

        {/* Add other sections as needed (e.g., Preferences) */}
      </div>
    </>
  );
};

export default ProfilePage;