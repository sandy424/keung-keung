import {Routes, Route, Navigate} from 'react-router-dom';

import Home from './pages/Home';

export default function App() {

  return (
    <div style={styles.container}>
      <Routes>
        <Route path='/' element={<Home/>}/>
      </Routes>
    </div>
  )
}
const styles = {
  container: {
    width: "500px",
    margin: "0 auto",
  }
}