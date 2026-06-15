import {Routes, Route} from 'react-router-dom';
import { useState } from 'react';

import Home from './pages/Home';
import Header from './components/Header';
import Hotplace from './pages/Hotplace';
import Saved from './pages/Saved';
import Mypage from './pages/Mypage';
import Detail  from './pages/Detail';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {

  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");

  // 검색창 버튼 기능
  const handleSearch = () => {
    setQuery(inputValue);
  }
  const handleClear = () => {
    setInputValue("");
    setQuery("");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9d4]">
      <Header inputValue={inputValue} onSearch={handleSearch} onInputChange={setInputValue} onClear={handleClear} query={query}/>
      <main className="flex-1 min-h-0 overflow-hidden">
        <Routes>
          <Route path='/' element={<Home query={query}/>} />
          <Route path='/hotplace' element={<Hotplace/>}/>
          <Route path='/saved' element={<Saved/>}/>
          <Route path='/mypage' element={<Mypage/>} />
          <Route path='/detail' element={<Detail/>} />
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/signup' element={<SignupPage />} />
        </Routes>
      </main>
    </div>
  )
}