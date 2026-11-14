import type { ModuleId } from "../../data/buildModules";

type Props = {
  moduleId: ModuleId;
  name: string;
};

function ModuleShape({ moduleId }: { moduleId: ModuleId }) {
  switch (moduleId) {
    case "habitat":
      return (
        <>
          <path d="M66 74V49l22-18 22 18v25z" fill="#7587b8" stroke="#d7e5ff" strokeWidth="3" />
          <path d="M74 74V52l14-12 14 12v22z" fill="#263d69" />
          <rect x="83" y="58" width="11" height="16" fill="#4bc4e8" />
          <path d="M110 57h18v12h-18M64 74h66" fill="none" stroke="#d7e5ff" strokeWidth="4" />
          <rect x="51" y="71" width="92" height="8" fill="#53658f" />
        </>
      );
    case "life-support":
      return (
        <>
          <rect x="65" y="34" width="42" height="43" fill="#436d82" stroke="#d7f6ff" strokeWidth="3" />
          <rect x="72" y="42" width="28" height="12" fill="#80d8ca" />
          <circle cx="78" cy="48" r="3" fill="#14233e" />
          <circle cx="94" cy="48" r="3" fill="#14233e" />
          <rect x="72" y="60" width="28" height="10" fill="#233d5b" />
          <path d="M65 46H51v26h14M107 46h14v26h-14" fill="none" stroke="#8be3db" strokeWidth="4" />
          <path d="M56 72v8h60v-8" fill="none" stroke="#d7f6ff" strokeWidth="3" />
        </>
      );
    case "solar-array":
      return (
        <>
          <path d="M87 49v31M87 54L62 40M87 54l26-17" stroke="#d7e5ff" strokeWidth="4" />
          <path d="M29 24h35v23H29zM34 29h25v13H34zM113 20h35v23h-35zM118 25h25v13h-25z" fill="#2874a9" stroke="#8fe0ff" strokeWidth="3" />
          <path d="M42 24v23m12-23v23M29 35h35m28 0h21m22-15v23m12-23v23m-35-11h35" stroke="#8fe0ff" strokeWidth="2" />
          <rect x="77" y="78" width="20" height="6" fill="#d7e5ff" />
        </>
      );
    case "airlock":
      return (
        <>
          <rect x="48" y="38" width="38" height="38" fill="#6c7896" stroke="#d7e5ff" strokeWidth="3" />
          <rect x="96" y="38" width="38" height="38" fill="#6c7896" stroke="#d7e5ff" strokeWidth="3" />
          <rect x="58" y="48" width="18" height="28" fill="#263d69" />
          <rect x="106" y="48" width="18" height="28" fill="#263d69" />
          <path d="M86 57h10m-5-5 5 5-5 5" fill="none" stroke="#ffd166" strokeWidth="3" />
          <rect x="61" y="31" width="60" height="7" fill="#8597bc" />
        </>
      );
    case "radiation-shield":
      return (
        <>
          <path d="M51 74V58a37 37 0 0 1 74 0v16z" fill="#546d61" stroke="#c6f0b5" strokeWidth="3" />
          <path d="M59 74V59a29 29 0 0 1 58 0v15z" fill="#263d69" />
          <rect x="80" y="59" width="16" height="15" fill="#67bf9d" />
          <path d="M74 39h28M65 49h47M59 61h58" stroke="#9dba8c" strokeWidth="3" />
          <path d="M83 51h8l5 8-5 8h-8l-5-8z" fill="#ffd166" stroke="#263d69" strokeWidth="2" />
        </>
      );
    case "water-recycler":
      return (
        <>
          <rect x="59" y="34" width="58" height="43" fill="#356d8c" stroke="#d7f6ff" strokeWidth="3" />
          <rect x="68" y="42" width="40" height="8" fill="#8fe0ff" />
          <path d="M88 51c-9 10-7 17 0 17s9-7 0-17z" fill="#43c9ed" />
          <path d="M59 48H47v26h12m58-26h12v26h-12" fill="none" stroke="#8fe0ff" strokeWidth="4" />
          <path d="M76 78v6h24v-6" fill="none" stroke="#d7f6ff" strokeWidth="3" />
        </>
      );
    case "greenhouse":
      return (
        <>
          <path d="M48 75V42h80v33z" fill="#274b59" stroke="#bcebd6" strokeWidth="3" />
          <path d="M55 49h66v21H55z" fill="#375d56" />
          <path d="M70 69V54m18 15V49m18 20V54" stroke="#75ce91" strokeWidth="4" />
          <path d="M70 59l-8-7m8 11 8-8m10 1-8-8m8 13 9-9m9 8-8-8m8 13 8-8" stroke="#a8f08a" strokeWidth="3" />
          <rect x="53" y="71" width="70" height="7" fill="#8c684f" />
        </>
      );
  }
}

export default function ModuleIllustration({ moduleId, name }: Props) {
  return (
    <svg
      className="module-illustration"
      viewBox="0 0 176 104"
      role="img"
      aria-label={`${name} modülünün pixel-art çizimi`}
      shapeRendering="crispEdges"
    >
      <rect width="176" height="104" fill="#10182e" />
      <path d="M0 85h176v19H0z" fill="#252b42" />
      <path d="M0 85h176" stroke="#697398" strokeWidth="2" />
      <path d="M18 20h3v3h-3zm29 16h3v3h-3zm99-20h3v3h-3zm-19 25h3v3h-3z" fill="#d5e8ff" />
      <circle cx="145" cy="23" r="9" fill="#ffd166" />
      <ModuleShape moduleId={moduleId} />
    </svg>
  );
}
