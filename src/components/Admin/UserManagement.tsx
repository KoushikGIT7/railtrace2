import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Building, 
  User,
  Shield,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User as UserType } from '../../types';

export function UserManagement() {
  const { approveUser, rejectUser, getPendingUsers, getAllUsers, userData } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
      
      // Also load all users for debugging
      const allUsersData = await getAllUsers();
      setAllUsers(allUsersData);
      
      // If no users found, show some mock data for demonstration
      if (users.length === 0 && allUsersData.length === 0) {
        console.log('No users found in database. This might be expected for a fresh installation.');
        console.log('Try registering a new user to test the approval workflow.');
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers, getAllUsers]);

  useEffect(() => {
    loadPendingUsers();
  }, [userData?.id, loadPendingUsers]);

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await approveUser(userId);
      await loadPendingUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await rejectUser(userId);
      await loadPendingUsers(); // Refresh the list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      vendor: 'info' as const,
      depot: 'warning' as const,
      engineer: 'success' as const,
      inspector: 'error' as const,
      admin: 'default' as const
    };
    return variants[role as keyof typeof variants] || 'default';
  };

  const filteredUsers = pendingUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Review and approve user registrations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pendingUsers.length} Pending
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPendingUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users by name, email, organization, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Debug Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllUsers(!showAllUsers)}
            >
              {showAllUsers ? 'Hide' : 'Show'} All Users ({allUsers.length})
            </Button>
          </div>
        </CardHeader>
        {showAllUsers && (
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Total Users:</strong> {allUsers.length} | 
                <strong> Pending Users:</strong> {pendingUsers.length} | 
                <strong> Approved Users:</strong> {allUsers.filter(u => u.approved).length}
              </p>
              <div className="max-h-40 overflow-y-auto">
                {allUsers.map(user => (
                  <div key={user.id} className="text-xs p-2 border rounded bg-gray-50">
                    <strong>{user.name}</strong> ({user.email}) - 
                    Role: {user.role} - 
                    Approved: {user.approved ? 'Yes' : 'No'} - 
                    Created: {user.createdAt.toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pending Users List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Pending Approvals
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading pending users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.organizationName && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {user.organizationName}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApproveUser(user.id)}
                      loading={actionLoading === user.id}
                      leftIcon={<CheckCircle className="h-3 w-3" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleRejectUser(user.id)}
                      loading={actionLoading === user.id}
                      leftIcon={<XCircle className="h-3 w-3" />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No pending users found</p>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'All users have been processed'}
              </p>
              {!searchTerm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>Testing the system?</strong><br />
                    Try registering a new user account to see it appear here for approval.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                  <Badge variant="warning">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Approval
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
              </div>

              {selectedUser.organizationName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Building className="h-4 w-4 text-gray-400" />
                    {selectedUser.organizationName}
                  </div>
                </div>
              )}

              {selectedUser.organizationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
                  <div className="text-gray-900 font-mono text-sm">
                    {selectedUser.organizationId}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <div className="text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
              <Button
                variant="error"
                onClick={() => handleRejectUser(selectedUser.id)}
                loading={actionLoading === selectedUser.id}
                leftIcon={<XCircle className="h-4 w-4" />}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => handleApproveUser(selectedUser.id)}
                loading={actionLoading === selectedUser.id}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}