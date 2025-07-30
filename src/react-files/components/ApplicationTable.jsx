import React, { useState, useEffect } from 'react';

const statusOptions = ['read', 'contacted', 'hired', 'rejected'];

function ApplicationTable() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // Use CloudFront URL for API calls (same domain as website, no CORS issues)
  const API_BASE_URL = window.location.origin;

  // Fetch data from DynamoDB on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/get-all-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Transform DynamoDB data to match your table structure
      const transformedData = (result.data || []).map(item => ({
        id: item.id || item.contactId || Math.random().toString(),
        firstName: item.firstName || item.first_name || '',
        lastName: item.lastName || item.last_name || '',
        securityClearance: item.securityClearance || item.security_clearance || 'None',
        minSalary: item.minSalary || item.min_salary || item.salary || 'Not specified',
        workRole: item.workRole || item.work_role || item.position || item.job_title || 'Not specified',
        resume: item.resumeUrl || item.resume_url || item.resume || null,
        status: item.status || 'read', // Default status
        email: item.email || '',
        phoneNumber: item.phoneNumber || item.phone_number || '',
        createdAt: item.createdAt || item.created_at || ''
      }));
      
      setApplications(transformedData);
      console.log('Fetched applications:', transformedData);
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler to update status
  const updateStatus = async (id, newStatus) => {
    try {
      // Find the application to update
      const appToUpdate = applications.find(app => app.id === id);
      if (!appToUpdate) return;

      // Update the status locally first for immediate UI feedback
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      // Update in DynamoDB
      const response = await fetch(`${API_BASE_URL}/api/update-application`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          status: newStatus,
          // Include other fields that might need updating
          firstName: appToUpdate.firstName,
          lastName: appToUpdate.lastName,
          email: appToUpdate.email,
          phoneNumber: appToUpdate.phoneNumber,
          securityClearance: appToUpdate.securityClearance,
          minSalary: appToUpdate.minSalary,
          workRole: appToUpdate.workRole,
          resumeUrl: appToUpdate.resume,
          createdAt: appToUpdate.createdAt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status in database');
      }

      console.log(`Status updated for application ${id} to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert the local change if the API call failed
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: app.status } : app
      ));
      alert('Failed to update status. Please try again.');
    }
  };

  // Filtered applications
  const filteredApps =
    filter === 'all' ? applications : applications.filter(app => app.status === filter);

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading applications from database...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h3 style={{ color: '#dc2626' }}>Error Loading Applications</h3>
        <p style={{ color: '#7f1d1d' }}>{error}</p>
        <button 
          onClick={fetchApplications}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Applications ({applications.length})</h2>
        <button 
          onClick={fetchApplications}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by status: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Security Clearance</th>
            <th>Min Salary</th>
            <th>Work Role</th>
            <th>Resume</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.length === 0 ? (
            <tr><td colSpan="8">No applications found.</td></tr>
          ) : (
            filteredApps.map(app => (
              <tr key={app.id}>
                <td>{app.firstName}</td>
                <td>{app.lastName}</td>
                <td>{app.securityClearance}</td>
                <td>{app.minSalary}</td>
                <td><p style={{ margin: 0 }}>{app.workRole}</p></td>
                <td>
                  {app.resume ? (
                    <a href={app.resume} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    'No Resume'
                  )}
                </td>
                <td>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</td>
                <td>
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(app.id, status)}
                      disabled={app.status === status}
                      style={{ marginRight: 4 }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationTable;
