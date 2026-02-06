import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AppProvider } from './context/AppContext';
import { NotesProvider } from './context/NotesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import './styles/theme.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <AppProvider>
            <NotesProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout currentPage="dashboard">
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/subjects" element={
                  <ProtectedRoute>
                    <Layout currentPage="subjects">
                      <Subjects />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/subjects/:subjectId/notes" element={
                  <ProtectedRoute>
                    <Layout currentPage="notes">
                      <Notes />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/assignments" element={
                  <ProtectedRoute>
                    <Layout currentPage="assignments">
                      <Assignments />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/exams" element={
                  <ProtectedRoute>
                    <Layout currentPage="exams">
                      <Exams />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout currentPage="profile">
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Catch All - Redirect to Dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </NotesProvider>
          </AppProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
