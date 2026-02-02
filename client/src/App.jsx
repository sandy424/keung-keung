import {Routes, Route} from 'react-router-dom';
import style from './css/App.module.css';

import Home from './pages/Home';

import Header from './components/Header';
import BottomBar from './components/BottomBar';

export default function App() {

  return (
    <div className={style.container}>
      <Header/>
      
      <main className={style.content}>
        <Routes>
          <Route path='/' element={<Home/>}/>
        </Routes>
      </main>

      <BottomBar/>
    </div>
  )
}