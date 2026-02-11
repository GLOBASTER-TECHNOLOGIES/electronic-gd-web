"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import OfficerList from '@/components/admin/OfficerList';
import CreateOfficerForm from '@/components/admin/CreateOfficerForm';
import AdminGDViewer from '@/components/admin/AdminGDViewer';
import CreatePostForm from '@/components/admin/CreatePostForm'; // <--- 1. Import this
import PostList from '@/components/admin/PostList';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64 min-w-0">

        {/* HEADER */}
        <AdminHeader
          activeTab={activeTab}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* CONTENT AREA */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <DashboardStats />
              </div>
            )}

            {activeTab === 'create-officer' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreateOfficerForm />
              </div>
            )}

            {activeTab === 'officers' && (
              <div className="animate-in fade-in duration-500">
                <OfficerList />
              </div>
            )}

            {/* Existing GD Viewer Tab */}
            {activeTab === 'gd-viewer' && (
              <div className="animate-in fade-in duration-500">
                <AdminGDViewer />
              </div>
            )}

            {/* --- 2. ADD NEW POST SECTION HERE --- */}
            {activeTab === 'create-post' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreatePostForm />
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="animate-in fade-in duration-500">
                <PostList />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}