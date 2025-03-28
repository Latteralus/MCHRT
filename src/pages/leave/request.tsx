// src/pages/leave/request.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import MainLayout from '@/components/layouts/MainLayout'; // Assuming a main layout exists

interface RequestLeavePageProps {
  userId: number; // Pass the logged-in user's ID to the form
}

const RequestLeavePage: React.FC<RequestLeavePageProps> = ({ userId }) => {
  const handleSuccess = () => {
    // Optional: Add logic after successful submission, e.g., redirect or show message
    console.log('Leave request submitted successfully from page.');
    // router.push('/leave'); // Example redirect using next/router
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <LeaveRequestForm userId={userId} onSuccess={handleSuccess} />
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Protect route: Redirect if not authenticated
  if (!session || !session.user?.id) { // Ensure user and user.id exist
    return {
      redirect: {
        destination: '/login', // Adjust login path if needed
        permanent: false,
      },
    };
  }

  // Assuming session.user.id is the correct ID to use for the leave request (Employee's User ID)
  const userId = session.user.id;

  // TODO: Potentially fetch employee details linked to the user if needed,
  // e.g., to check leave balances before showing the form.

  return {
    props: {
      userId: Number(userId), // Ensure userId is a number
      session, // Pass session if MainLayout needs it
    },
  };
};

export default RequestLeavePage;