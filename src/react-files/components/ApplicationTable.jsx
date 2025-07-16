import React, { useState } from 'react';

const statusOptions = ['read', 'contacted', 'hired', 'rejected'];

function ApplicationTable({ applications, setApplications }) {
  const [filter, setFilter] = useState('all');

  // Handler to update status
  const updateStatus = (id, newStatus) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  // Filtered applications
  const filteredApps =
    filter === 'all' ? applications : applications.filter(app => app.status === filter);

  return (
    <div>
      <h2>Applications</h2>
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
