import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import Login from './components/auth/login/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/auth/register/Register'
import HomePage from './components/homePage/HomePage'
import Article from './components/Article/Article'
import MainLayout from './components/homePage/Content/MainLayout'
import ScrollToTop from './components/utils/ScrollToTop'
import Loading from './components/utils/Loading'

function App() {
  const [a, setA] = useState();
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MainLayout />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/loading" element={<Loading />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
