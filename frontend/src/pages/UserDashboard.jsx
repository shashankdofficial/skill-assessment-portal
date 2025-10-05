// frontend/src/pages/UserDashboard.jsx
import React from 'react';
import UserDashboardMain from './_UserDashboardMain';
export default function UserDashboard({ user }) {
  return <UserDashboardMain user={user} />;
}
