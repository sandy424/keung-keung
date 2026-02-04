import {Routes, Route} from 'react-router-dom';
import style from './css/App.module.css';

import Home from './pages/Home';

import Header from './components/Header';
import Hotplace from './pages/Hotplace';
import Saved from './pages/Saved';
import Mypage from './pages/mypage';

export default function App() {

  return (
    <div className={style.container}>
      <Header/>
      
      <main className={style.content}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/hotplace' element={<Hotplace/>}/>
          <Route path='/saved' element={<Saved/>}/>
          <Route path='/mypage' element={<Mypage/>} />
        </Routes>
      </main>
    </div>
  )
}