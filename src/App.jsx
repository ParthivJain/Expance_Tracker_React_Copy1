import { useState } from 'react'
import Home from './pages/Home'
import Balance from './pages/Balance'
import History from './pages/History'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  if (currentPage === 'home') {
    return <Home setCurrentPage={setCurrentPage} />
  }
  if (currentPage === 'balance') {
    return <Balance setCurrentPage={setCurrentPage} />
  }
  if (currentPage === 'history') {
    return <History setCurrentPage={setCurrentPage} />
  }

  return <Home setCurrentPage={setCurrentPage} />
}

export default App