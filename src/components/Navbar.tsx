import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="flex items-center justify-between py-6 border-b border-line">
      <Link to="/" className="font-pixel text-xl tracking-widest">
        JUNIOR SPACE ACADEMY
      </Link>
      <nav className="flex gap-7 font-pixel">
        <Link to="/">Ana sayfa</Link>
        <Link to="/oyun">Oyun</Link>
        <Link to="/kaynaklar">Kaynaklar</Link>
      </nav>
    </header>
  )
}