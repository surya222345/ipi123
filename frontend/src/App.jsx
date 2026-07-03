import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import SuccessPage from './pages/SuccessPage';
import VerifyPage from './pages/VerifyPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/success/:memberId" element={<SuccessPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/verify/:memberId" element={<VerifyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

