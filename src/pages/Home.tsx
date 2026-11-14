import Navbar from '../components/Navbar'
import Button from '../components/Button'
import ResourceBar from '../components/ResourceBar'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <Navbar />
      <h1 className="font-pixel text-6xl mt-12">Ay Üssü Komutanı</h1>
      <p className="text-muted text-lg mt-4 max-w-xl">
        30 gün boyunca enerji, oksijen, gıda ve radyasyon koruması arasında denge kur.
      </p>
      <div className="flex gap-4 mt-6">
        <Button>Göreve Başla</Button>
        <Button variant="ghost">Eğitimi geç</Button>
      </div>
      <div className="grid gap-3 mt-10 max-w-sm">
        <ResourceBar label="Enerji" value={62} color="var(--color-energy)" />
        <ResourceBar label="Oksijen / Su" value={78} color="var(--color-oxygen)" />
        <ResourceBar label="Gıda" value={45} color="var(--color-food)" />
      </div>
    </div>
  )
}