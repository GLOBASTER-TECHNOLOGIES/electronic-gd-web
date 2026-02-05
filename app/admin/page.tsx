"use client";

import React, { useState } from "react";
import axios from "axios";

const AdminPage = () => {
  const [formData, setFormData] = useState({
    forceNumber: "",
    name: "",
    rank: "",
    appRole: "",
    railwayZone: "",
    division: "",
    postName: "",
    mobileNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/officer/register", formData);

      setMessage(res.data.message || "Officer created successfully");

      // Reset form after success
      setFormData({
        forceNumber: "",
        name: "",
        rank: "",
        appRole: "",
        railwayZone: "",
        division: "",
        postName: "",
        mobileNumber: "",
        password: "",
      });
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Create RPF Officer
        </h1>

        {message && (
          <div className="mb-4 text-sm font-medium text-center text-blue-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Force Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Force Number
            </label>
            <input
              type="text"
              name="forceNumber"
              value={formData.forceNumber}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Rank */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rank
            </label>
            <select
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Rank</option>
              <option>Constable</option>
              <option>Head Constable</option>
              <option>ASI</option>
              <option>SI</option>
              <option>Inspector</option>
              <option>IPF</option>
              <option>DSC</option>
              <option>Sr.DSC</option>
            </select>
          </div>

          {/* App Role */}
          <div>
            <label className="block text-sm font-medium mb-1">
              App Role
            </label>
            <select
              name="appRole"
              value={formData.appRole}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Role</option>
              <option value="STAFF">STAFF</option>
              <option value="SO">SO</option>
              <option value="IPF">IPF</option>
              <option value="DSC">DSC</option>
            </select>
          </div>

          {/* Railway Zone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Railway Zone
            </label>
            <input
              type="text"
              name="railwayZone"
              value={formData.railwayZone}
              onChange={handleChange}
              required
              placeholder="eg: SR"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Division
            </label>
            <input
              type="text"
              name="division"
              value={formData.division}
              onChange={handleChange}
              required
              placeholder="eg: TVC Division"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Post Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Post Name
            </label>
            <input
              type="text"
              name="postName"
              value={formData.postName}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Creating Officer..." : "Create Officer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminPage;
