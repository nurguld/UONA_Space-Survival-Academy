import { useState } from "react";
import ModuleSelector from "../../components/labComponents/ModuleSelector";
import BuildGrid, {
  type GridCell
} from "../../components/labComponents/BuildGrid";
import type { ModuleId } from "../../data/buildModules";
import {
  validateBuild,
  type ValidationResult
} from "../../game/buildValidation";

import "./BuildLab.css";

const GRID_SIZE = 25;

export default function BuildLab() {
  const [selected, setSelected] =
    useState<ModuleId | null>(null);

  const [grid, setGrid] = useState<GridCell[]>(
    Array(GRID_SIZE).fill(null)
  );

  const [result, setResult] =
    useState<ValidationResult | null>(null);
  const [moveMode, setMoveMode] = useState(false);
  const [movingIndex, setMovingIndex] = useState<number | null>(null);

  const placedCount = grid.filter(Boolean).length;

  function placeModule(index: number) {
    if (moveMode) {
      if (movingIndex === null) {
        if (grid[index] === null) return;
        setMovingIndex(index);
        return;
      }

      if (index === movingIndex) {
        setMovingIndex(null);
        return;
      }
      if (grid[index] !== null) {
        setMovingIndex(index);
        return;
      }

      setGrid((previous) => {
        const next = [...previous];
        next[index] = next[movingIndex];
        next[movingIndex] = null;
        return next;
      });
      setMovingIndex(null);
      setResult(null);
      return;
    }

    if (!selected) return;
    if (grid[index] !== null) return;

    setGrid((previous) =>
      previous.map((cell, i) =>
        i === index ? selected : cell
      )
    );

    setResult(null);
  }

  function removeModule(index: number) {
    setGrid((previous) =>
      previous.map((cell, i) =>
        i === index ? null : cell
      )
    );

    setResult(null);
  }

  function resetBuild() {
    setGrid(Array(GRID_SIZE).fill(null));
    setSelected(null);
    setResult(null);
    setMoveMode(false);
    setMovingIndex(null);
  }

  return (
    <main className="build-lab">
      <div className="build-container">

        <nav className="build-navbar">
          <span className="build-brand">
            JUNIOR SPACE ACADEMY
          </span>

          <span className="build-nav-label">
            BUILD LAB / 01
          </span>
        </nav>

        <header className="build-header">
          <p className="build-eyebrow">
            ASTRONAUT TRAINING / ENGINEERING
          </p>

          <h1>Ay Üssü İnşası</h1>

          <p className="build-description">
            Astronotların Ay'da güvenle yaşayabilmesi
            için gerekli modülleri seç ve kendi
            uzay üssünü tasarla.
          </p>
        </header>

        <div className="build-workspace">

          <aside className="build-sidebar">
            <h2>MODÜLLER</h2>

            <p className="build-hint">
              Yerleştirmek istediğin modülü seç.
            </p>

            <ModuleSelector
              selected={selected}
              onSelect={setSelected}
            />
          </aside>

          <section className="build-main">
            <div className="build-section-header">
              <h2>İNŞA ALANI</h2>

              <span className="build-counter">
                {placedCount} / {GRID_SIZE}
              </span>
            </div>

            <p className="build-hint">
              Bir modül seç ve haritadaki
              karelerden birine tıkla.
            </p>

            <div className="build-grid-wrapper">
              <BuildGrid
                grid={grid}
                onPlace={placeModule}
                movingIndex={movingIndex}
              />
            </div>

            <div className="build-actions">
              <button
                className="build-secondary-button"
                aria-pressed={moveMode}
                onClick={() => {
                  setMoveMode((active) => !active);
                  setMovingIndex(null);
                  setSelected(null);
                }}
              >
                {moveMode ? "TAŞIMAYI İPTAL ET" : "MODÜLÜ TAŞI"}
              </button>
              <button
                className="build-primary-button"
                onClick={() =>
                  setResult(validateBuild(grid))
                }
              >
                HABITATI KONTROL ET
              </button>

              <button
                className="build-secondary-button"
                onClick={resetBuild}
              >
                SIFIRLA
              </button>
            </div>
            <p className="build-hint" aria-live="polite">
              {moveMode
                ? movingIndex === null
                  ? "Taşımak için dolu bir kareye, ardından boş hedef kareye tıkla."
                  : "Modül seçildi; yeni konumu için boş bir kareye tıkla."
                : "Modülleri döndürmek yerine TAŞI aracıyla yeni bir kareye taşı."}
            </p>

            <div className="build-mission-panel">
              <h3>GÖREV BİLGİSİ</h3>

              <p>
                Görev: Astronotların yaşaması
                için gerekli sistemleri kur.
              </p>

              <p>
                Zorunlu sistemler: Habitat,
                Life Support, Power, Airlock
                ve Radiation Shelter.
              </p>
            </div>

            {result && (
              <div
                className={
                  result.success
                    ? "build-result success"
                    : "build-result warning"
                }
              >
                <h3>
                  {result.success
                    ? "✓ GÖREV TAMAMLANDI"
                    : "⚠ HABITAT EKSİK"}
                </h3>

                <p>Başarı puanı: {result.score} / 100</p>
                {result.messages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            {grid.some(Boolean) && (
              <div className="build-tools">
                <h3>MODÜL KALDIR</h3>
                <p className="build-hint">
                  Bir modülü kaldırmak için
                  aşağıdaki konum numarasını seç.
                </p>

                <div className="build-remove-list">
                  {grid.map((cell, index) =>
                    cell ? (
                      <button
                        key={index}
                        onClick={() => removeModule(index)}
                        title={`Remove ${cell}`}
                      >
                        {index + 1} ×
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="build-info-sidebar">
            <h2>GÖREV HEDEFLERİ</h2>

            <div className="build-objective">
              <span>01</span>
              <p>Yaşam alanı oluştur.</p>
            </div>

            <div className="build-objective">
              <span>02</span>
              <p>Yaşam destek sistemi ekle.</p>
            </div>

            <div className="build-objective">
              <span>03</span>
              <p>Enerji sistemi kur.</p>
            </div>

            <div className="build-objective">
              <span>04</span>
              <p>Güvenli giriş ve çıkış sağla.</p>
            </div>

            <div className="build-objective">
              <span>05</span>
              <p>Radyasyon koruması ekle.</p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
