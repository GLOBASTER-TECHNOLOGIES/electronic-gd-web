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
import UpdatePostForm from '@/components/admin/UpdatePostForm'; 
import UpdateOfficerForm from '@/components/admin/UpdateOfficerForm'; // Ensure you created this

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- EDITING STATE MANAGEMENT ---
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null);

  // --- POST HANDLERS ---
  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setActiveTab('update-post'); 
  };

  const handleCancelPostEdit = () => {
    setEditingPostId(null);
    setActiveTab('posts'); 
  };

  // --- OFFICER HANDLERS ---
  const handleEditOfficer = (officerId: string) => {
    setEditingOfficerId(officerId);
    setActiveTab('update-officer');
  };

  const handleCancelOfficerEdit = () => {
    setEditingOfficerId(null);
    setActiveTab('officers');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
           // Reset all editing states if user clicks sidebar
           setEditingPostId(null);
           setEditingOfficerId(null);
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

            {/* --- OFFICER MANAGEMENT --- */}
            {activeTab === 'create-officer' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreateOfficerForm />
              </div>
            )}

            {activeTab === 'officers' && (
              <div className="animate-in fade-in duration-500">
                {/* Pass the edit handler */}
                <OfficerList onEdit={handleEditOfficer} />
              </div>
            )}

            {activeTab === 'update-officer' && editingOfficerId && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <UpdateOfficerForm 
                  officerId={editingOfficerId}
                  onCancel={handleCancelOfficerEdit}
                  onSuccess={handleCancelOfficerEdit}
                />
              </div>
            )}

            {/* --- POST MANAGEMENT --- */}
            {activeTab === 'create-post' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreatePostForm />
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="animate-in fade-in duration-500">
                {/* Pass the edit handler */}
                <PostList onEdit={handleEditPost} />
              </div>
            )}

            {activeTab === 'update-post' && editingPostId && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <UpdatePostForm 
                  postId={editingPostId} 
                  onCancel={handleCancelPostEdit}
                  onSuccess={handleCancelPostEdit}
                />
              </div>
            )}

            {/* --- GD VIEWER --- */}
            {activeTab === 'gd-viewer' && (
              <div className="animate-in fade-in duration-500">
                <AdminGDViewer />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}