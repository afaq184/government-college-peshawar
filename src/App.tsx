/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Faculty from './pages/Faculty';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import News from './pages/News';
import Apply from './pages/Apply';
import FacultyList from './pages/FacultyList';
import FacultyProfile from './pages/FacultyProfile';
import StudentProfile from './pages/StudentProfile';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'home', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'academics', element: <Academics /> },
      { path: 'admissions', element: <Admissions /> },
      { path: 'faculty', element: <Faculty /> },
      { path: 'departments/:deptId/faculty', element: <FacultyList /> },
      { path: 'faculty-profile/:memberId', element: <FacultyProfile /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'contact', element: <Contact /> },
      { path: 'news', element: <News /> },
      { path: 'apply', element: <Apply /> },
    ],
  },
  {
    path: '/student/:token',
    element: <StudentProfile />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
