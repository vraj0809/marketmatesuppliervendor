import React from "react";
import "../Components/VendorDashboard.css";

const VendorDashboard = () => {
  return (
    <div className="container-vendor-dashboard">
      <header className="header-vendor-dashboard">Vendor Dashboard</header>
      <aside className="sidebar-vendor-dashboard">Sidebar</aside>
      <main className="main-vendor-dashboard">
        {/* Overview Cards */}
        <section className="overview-vendor-dashboard">Overview Cards</section>
        {/* Browse Raw Materials */}
        <section className="raw-materials-vendor-dashboard">Browse Raw Materials</section>
        {/* Search Suppliers */}
        <section className="search-suppliers-vendor-dashboard">Search Suppliers</section>
        {/* Compare Prices */}
        <section className="compare-prices-vendor-dashboard">Compare Prices</section>
        {/* Place Order */}
        <section className="place-order-vendor-dashboard">Place Order</section>
        {/* Order History */}
        <section className="order-history-vendor-dashboard">Order History</section>
        {/* Order Status Tracker */}
        <section className="order-status-vendor-dashboard">Order Status Tracker</section>
        {/* Chat with Supplier */}
        <section className="chat-vendor-dashboard">Chat with Supplier</section>
        {/* Group Buy Option */}
        <section className="group-buy-vendor-dashboard">Group Buy Option</section>
        {/* Notifications */}
        <section className="notifications-vendor-dashboard">Notifications</section>
      </main>
    </div>
  );
};

export default VendorDashboard; 