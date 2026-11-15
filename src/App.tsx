import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Briefing from './pages/Briefing'
import Game from './pages/gamePages/Game'
import Result from './pages/gamePages/Result'
import Resources from './pages/gamePages/Resources'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hazirlik" element={<Briefing />} />
      <Route path="/oyun" element={<Game />} />
      <Route path="/sonuc" element={<Result />} />
      <Route path="/kaynaklar" element={<Resources />} />
    </Routes>
  )
}