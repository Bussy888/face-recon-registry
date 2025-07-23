import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignIn from './components/SignIn';
import CodeSignIn from './components/CodeSignIn';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/face-login" element={<SignIn />} />
        <Route path="/code-login" element={<CodeSignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
