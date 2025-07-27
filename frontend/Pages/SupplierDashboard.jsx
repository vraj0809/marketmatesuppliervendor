import React, { useContext } from 'react';
import { AuthContext } from '../src/App.jsx';

const SupplierDashboard = () => {
  const { auth } = useContext(AuthContext);
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h2>Welcome Supplier {auth.user?.name || ''}</h2>
      <p>This is your supplier dashboard.</p>
    </div>
  );
};

export default SupplierDashboard; 