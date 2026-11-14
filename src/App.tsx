import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Result from './pages/Result'
import Resources from './pages/Resources'
import BuildLab from './pages/labPage/BuildLab'
import SpaceTransition from './components/SpaceTransition'

export default function App() {
  const location = useLocation()

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oyun" element={<Game />} />
        <Route path="/sonuc" element={<Result />} />
        <Route path="/kaynaklar" element={<Resources />} />
        <Route path="/build-lab" element={<BuildLab />} />
      </Routes>
      <SpaceTransition transitionKey={location.key} />
    </>
  )
}