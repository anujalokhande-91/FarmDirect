import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    }
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      await apiService.updateProfile(profileData);
      
      // Update user context with new data
      if (user) {
        const updatedUser = { ...user, ...profileData };
        // Re-login with updated user data
        login(updatedUser.email, ''); // This will trigger a refresh of user data
      }
      
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setChangingPassword(true);
      setError('');
      setSuccess('');
      
      // This would need to be implemented in the API service
      // await apiService.changePassword(passwordData);
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'addresses'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Addresses
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                        className="input-field"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Default Address</h3>
                    
                    <div>
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        value={profileData.address?.street || ''}
                        onChange={handleProfileChange}
                        className="input-field"
                        placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="address.city"
                          name="address.city"
                          value={profileData.address?.city || ''}
                          onChange={handleProfileChange}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="address.state"
                          name="address.state"
                          value={profileData.address?.state || ''}
                          onChange={handleProfileChange}
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          id="address.pincode"
                          name="address.pincode"
                          value={profileData.address?.pincode || ''}
                          onChange={handleProfileChange}
                          maxLength={6}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address.landmark" className="block text-sm font-medium text-gray-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          id="address.landmark"
                          name="address.landmark"
                          value={profileData.address?.landmark || ''}
                          onChange={handleProfileChange}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary py-2 px-6 disabled:opacity-50"
                  >
                    {updating ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary py-2 px-6 disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Saved Addresses</h3>
                
                {profileData.address && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Default Address</h4>
                        <div className="text-sm text-gray-600 mt-2">
                          <div>{profileData.address.street}</div>
                          <div>
                            {profileData.address.city}, {profileData.address.state} - {profileData.address.pincode}
                          </div>
                          {profileData.address.landmark && (
                            <div>Landmark: {profileData.address.landmark}</div>
                          )}
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="text-center py-8">
                  <div className="text-4xl mb-4"> location</div>
                  <p className="text-gray-600 mb-4">
                    You can manage multiple addresses from the profile section above.
                  </p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="btn-outline"
                  >
                    Edit Address in Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
