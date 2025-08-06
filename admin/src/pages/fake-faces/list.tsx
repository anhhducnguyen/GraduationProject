import React, { useEffect, useState } from 'react';
import { Spin, Pagination } from 'antd';

import { FakeFace, ApiResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


export const FakeFacesList: React.FC = () => {
  const [faces, setFaces] = useState<FakeFace[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFakeFaces = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/fake-faces?page=${page}&limit=6`);
      const data: ApiResponse = await res.json();
      setFaces(data.data.urls);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch fake faces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFakeFaces(page);
  }, [page]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {faces.map((face) => (
          <div
            key={face.public_id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative group">
              <img
                src={face.url}
                alt={face.public_id}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                {face.format.toUpperCase()}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-700 truncate">{face.public_id}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(face.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {face.width}×{face.height}px
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Ant Design Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          current={page}
          pageSize={6}
          total={totalPages * 6}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};
