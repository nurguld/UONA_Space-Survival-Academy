import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Result from './pages/Result'
import Resources from './pages/Resources'
import BuildLab from './pages/labPage/BuildLab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/oyun" element={<Game />} />
      <Route path="/sonuc" element={<Result />} />
      <Route path="/kaynaklar" element={<Resources />} />
      <Route path="/build-lab" element={<BuildLab />} />
    </Routes>
  )
}