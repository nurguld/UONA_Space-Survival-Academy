export const BUILD_MODULES = [
  {
    id: "habitat", name: "Habitat", label: "Yaşam alanı", icon: "⌂", energyDemand: 3, energyOutput: 0,
    description: "Mürettebatın yaşadığı, çalıştığı ve dinlendiği basınçlı modül.",
    science: "NASA'nın yaşam alanı araştırmaları güvenli basınç, sıcaklık ve yaşanabilir hacme odaklanır."
  },
  {
    id: "life-support", name: "Life Support", label: "Yaşam desteği", icon: "◉", energyDemand: 4, energyOutput: 0,
    description: "Kabin havasını ve astronotların ihtiyaç duyduğu yaşamsal koşulları yönetir.",
    science: "ECLSS; uzay araçlarında hava, su ve kabin basıncı gibi koşulları izleyip yönetir."
  },
  {
    id: "solar-array", name: "Power", label: "Güneş paneli", icon: "☼", energyDemand: 0, energyOutput: 10,
    description: "Güneş ışığını üs sistemlerinin kullanabileceği elektrik enerjisine dönüştürür.",
    science: "Uzay araçlarında güneş panellerinin üretimi, ışık alıp almamalarına bağlıdır."
  },
  {
    id: "airlock", name: "Airlock", label: "Hava kilidi", icon: "⇄", energyDemand: 1, energyOutput: 0,
    description: "Ay yüzeyi ile yaşam alanı arasında kontrollü geçiş sağlar.",
    science: "Hava kilidi, dışarı çıkış ve dönüş sırasında habitat basıncının korunmasına yardımcı olur."
  },
  {
    id: "radiation-shield", name: "Radiation Shelter", label: "Radyasyon kalkanı", icon: "⬡", energyDemand: 1, energyOutput: 0,
    description: "Mürettebatın uzay radyasyonuna maruz kalma riskini azaltmaya yardımcı olur.",
    science: "NASA, su ve Ay regolitini radyasyon korumasında kullanma yöntemlerini araştırır."
  },
  {
    id: "water-recycler", name: "Water Recycler", label: "Su geri dönüşümü", icon: "≈", energyDemand: 2, energyOutput: 0,
    description: "Kullanılmış suyun arıtılarak yeniden kullanılmasını temsil eder.",
    science: "ISS'deki su geri kazanım sistemleri, sınırlı görev kaynaklarının tekrar kullanılmasını sağlar."
  },
  {
    id: "greenhouse", name: "Greenhouse", label: "Sera", icon: "✿", energyDemand: 2, energyOutput: 0,
    description: "Bitki yetiştirme ve kontrollü ortam araştırmaları için kullanılan modül.",
    science: "NASA, bitkilerin uzun süreli görevlerde gıda üretimine ve mürettebat sağlığına katkısını inceler."
  }
] as const;

export type ModuleId = (typeof BUILD_MODULES)[number]["id"];

export function getBuildModule(id: ModuleId) {
  return BUILD_MODULES.find((module) => module.id === id)!;
}
