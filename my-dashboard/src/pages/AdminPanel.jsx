import React, { useEffect, useState } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error('Token not found!');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch users:', res.status);
        alert("Failed to fetch users. Please try again.");
        return;
      }

      const data = await res.json();
      console.log('Fetched data:', data); 
      setUsers(data); 
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert("An error occurred while fetching users.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const currentUserId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
  
    if (!token) {
      alert("Giriş yapmadan işlem yapamazsınız.");
      return;
    }
  
    if (id.toString() === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this user?")) return;
  
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("User deleted successfully.");
        fetchUsers();
      } else {
        console.error("Delete error:", data);
        alert(data?.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the user.");
    }
  };
  
  
  
  
  

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-8 bg-transparent">
      <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left mb-6 text-white">
        Admin Panel – User List
      </h2>

      <div className="mb-4 w-full sm:w-1/3">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full border border-gray-300 px-4 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Created At</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="py-2 px-4">{u.user_id}</td>
                <td className="py-2 px-4">{u.full_name}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.role}</td>
                <td className="py-2 px-4">{new Date(u.created_at).toLocaleString()}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDelete(u.user_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
