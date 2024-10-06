import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import EmployeeForm from './components/EmployeeForm';
import SkillForm from './components/SkillForm';
import CertificationForm from './components/CertificationForm';
import LanguageForm from './components/LanguageForm';
import SearchResults from './components/SearchResults';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/skills/new" element={<SkillForm />} />
          <Route path="/certifications/new" element={<CertificationForm />} />
          <Route path="/languages/new" element={<LanguageForm />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;