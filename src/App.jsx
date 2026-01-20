import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Leaderboard from './leaderboard.jsx';
import AdminPanel from './Adminpanel.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* The public view (what the students/audience sees) */}
        <Route path="/" element={<Leaderboard/>} />
        
        {/* The private control view (what the host uses) */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;