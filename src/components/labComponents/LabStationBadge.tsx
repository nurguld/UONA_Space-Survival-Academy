import greenhouseArtwork from '../../assets/map-greenhouse.png';
import lifeSupportArtwork from '../../assets/map-lifesupport.png';
import shieldArtwork from '../../assets/map-shield.png';
import solarArtwork from '../../assets/map-solar.png';
import './LabStationBadge.css';

type LabStation = 'build' | 'resources' | 'emergency' | 'systems';

const STATION_ARTWORK: Record<LabStation, string> = {
  build: lifeSupportArtwork,
  resources: greenhouseArtwork,
  emergency: shieldArtwork,
  systems: solarArtwork,
};

type Props = {
  station: LabStation;
};

export default function LabStationBadge({ station }: Props) {
  return (
    <span className={`lab-station-badge lab-station-badge-${station}`} aria-hidden="true">
      <img src={STATION_ARTWORK[station]} alt="" />
    </span>
  );
}
