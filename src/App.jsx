import {Routes, Route} from 'react-router-dom';
import { useState } from 'react';
import style from './css/App.module.css';

import Home from './pages/Home';
import Header from './components/Header';
import Hotplace from './pages/Hotplace';
import Saved from './pages/Saved';
import Mypage from './pages/Mypage';
import Detail  from './pages/Detail';
import LoginPage from './pages/Loginpage';
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
    <div className={style.container}>
      <Header inputValue={inputValue} onSearch={handleSearch} onInputChange={setInputValue} onClear={handleClear} query={query}/>
      <main className={style.content}>
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