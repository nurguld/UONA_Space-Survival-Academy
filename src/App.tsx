import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Briefing from './pages/Briefing'
import Game from './pages/gamePages/Game'
import Resources from './pages/gamePages/Resources'
import Result from './pages/gamePages/Result'
import BuildLab from './pages/labPage/BuildLab'
import LabsHub, { LabWorkspace } from './pages/labPage/lab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hazirlik" element={<Briefing />} />
      <Route path="/oyun" element={<Game />} />
      <Route path="/sonuc" element={<Result />} />
      <Route path="/kaynaklar" element={<Resources />} />
      <Route path="/labs" element={<LabsHub />} />
      <Route path="/labs/:labId" element={<LabWorkspace />} />
      <Route path="/labs/build" element={<BuildLab />} />
    </Routes>
  )
}
