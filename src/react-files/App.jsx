import { useState } from 'react';
import ApplicationTable from './components/ApplicationTable';
import './App.css';

function App() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Smith',
      securityClearance: 'Top Secret',
      minSalary: 90000,
      workRole: 'Responsible for developing and maintaining web applications using modern JavaScript frameworks. Collaborates with designers and backend engineers to deliver high-quality products.',
      resume: 'alice-smith-resume.pdf',
      status: 'read',
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Johnson',
      securityClearance: 'Secret',
      minSalary: 80000,
      workRole: 'Designs user interfaces and experiences for web and mobile applications. Works closely with developers to ensure design feasibility and consistency across platforms.',
      resume: 'bob-johnson-resume.pdf',
      status: 'contacted',
    },
    {
      id: 3,
      firstName: 'Charlie',
      lastName: 'Williams',
      securityClearance: 'Confidential',
      minSalary: 95000,
      workRole: 'Oversees project management and team coordination. Ensures timely delivery of milestones and effective communication between stakeholders.',
      resume: '',
      status: 'hired',
    },
    {
      id: 4,
      firstName: 'Diana',
      lastName: 'Brown',
      securityClearance: 'Top Secret',
      minSalary: 100000,
      workRole: 'Conducts quality assurance testing and develops automated test suites. Identifies bugs and works with developers to resolve issues before release.',
      resume: 'diana-brown-resume.pdf',
      status: 'rejected',
    },
  ]);

  return (
    <div className="App">
      <h1>Admin Application Table</h1>
      <ApplicationTable applications={applications} setApplications={setApplications} />
    </div>
  );
}

export default App;
