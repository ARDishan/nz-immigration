import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NZETAStatusCheck from './NZETAStatusCheck'
import AdminDashboard from './AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NZETAStatusCheck />} />
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  )
}

export default App
