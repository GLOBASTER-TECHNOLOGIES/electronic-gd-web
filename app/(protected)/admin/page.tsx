"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import OfficerList from '@/components/admin/OfficerList';
import CreateOfficerForm from '@/components/admin/CreateOfficerForm';
import AdminGDViewer from '@/components/admin/AdminGDViewer';
import CreatePostForm from '@/components/admin/CreatePostForm';
import PostList from '@/components/admin/PostList';
import UpdatePostForm from '@/components/admin/UpdatePostForm'; // <--- 1. Import the Update Form

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Add state to track which post is being edited
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // 3. Helper function to start editing
  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setActiveTab('update-post'); // Switch to a temporary 'update-post' tab
  };

  // 4. Helper function to cancel editing
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setActiveTab('posts'); // Return to the list view
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
           // If user clicks a sidebar link, reset any editing state
           setEditingPostId(null);
           setActiveTab(tab);
        }}
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

            {activeTab === 'gd-viewer' && (
              <div className="animate-in fade-in duration-500">
                <AdminGDViewer />
              </div>
            )}

            {activeTab === 'create-post' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreatePostForm />
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="animate-in fade-in duration-500">
                {/* 5. Pass the handleEditPost function to the list */}
                <PostList onEdit={handleEditPost} />
              </div>
            )}

            {/* 6. Render the Update Form when in 'update-post' mode */}
            {activeTab === 'update-post' && editingPostId && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <UpdatePostForm 
                  postId={editingPostId} 
                  onCancel={handleCancelEdit}
                  onSuccess={handleCancelEdit}
                />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}