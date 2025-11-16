'use client';
import { Suspense } from "react";
import './dashboard.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <Suspense fallback={<div className="loading-container">Loading...</div>}>
          <main className="main-content">
            {children}
          </main>
        </Suspense>
      </div>
    </div>
  );
}