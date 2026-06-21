import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { HelpCircle, MapPin, ExternalLink, Settings, Sparkles, Navigation } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Exact coordinate mappings for major Algerian universities
const UNIVERSITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "univ-adrar": { lat: 27.8741, lng: -0.2831 },
  "univ-chlef": { lat: 36.1642, lng: 1.3328 },
  "univ-laghouat": { lat: 33.7997, lng: 2.8794 },
  "univ-oeb": { lat: 35.8753, lng: 7.1084 },
  "univ-batna2": { lat: 35.5398, lng: 6.1368 },
  "univ-bejaia": { lat: 36.7511, lng: 5.0450 },
  "univ-biskra": { lat: 34.8464, lng: 5.7483 },
  "univ-bechar": { lat: 31.6215, lng: -2.2239 },
  "univ-blida1": { lat: 36.4391, lng: 2.8272 },
  "univ-blida2": { lat: 36.4172, lng: 2.7011 },
  "univ-bouira": { lat: 36.3725, lng: 3.8964 },
  "univ-tam": { lat: 22.7844, lng: 5.5228 },
  "univ-tebessa": { lat: 35.4057, lng: 8.1189 },
  "univ-tlemcen": { lat: 34.8817, lng: -1.3158 },
  "univ-tiaret": { lat: 35.3524, lng: 1.3533 },
  "univ-tizi": { lat: 36.7022, lng: 4.0483 },
  "univ-usthb": { lat: 36.7538, lng: 3.1812 },
  "univ-algiers1": { lat: 36.7719, lng: 3.0575 },
  "esi-algiers": { lat: 36.7115, lng: 3.1706 },
  "ensia-algiers": { lat: 36.7262, lng: 3.0336 },
  "univ-djelfa": { lat: 34.6644, lng: 3.2625 },
  "univ-jijel": { lat: 36.8044, lng: 5.7539 },
  "univ-setif1": { lat: 36.1912, lng: 5.3789 },
  "univ-setif2": { lat: 36.1856, lng: 5.3989 },
  "univ-saida": { lat: 34.8311, lng: 0.1517 },
  "univ-skikda": { lat: 36.8644, lng: 6.9112 },
  "univ-belabbes": { lat: 35.1950, lng: -0.6356 },
  "esi-belabbes": { lat: 35.1911, lng: -0.6289 },
  "univ-annaba": { lat: 36.9031, lng: 7.7478 },
  "univ-guelma": { lat: 36.4619, lng: 7.4258 },
  "univ-constantine1": { lat: 36.3411, lng: 6.6136 },
  "univ-constantine2": { lat: 36.3115, lng: 6.6025 },
  "ensb-constantine": { lat: 36.3311, lng: 6.6111 },
  "univ-medea": { lat: 36.2642, lng: 2.7533 },
  "univ-mosta": { lat: 35.9328, lng: 0.1014 },
  "univ-msila": { lat: 35.7031, lng: 4.5414 },
  "univ-mascara": { lat: 35.3986, lng: 0.1414 },
  "univ-ouargla": { lat: 31.9511, lng: 5.3250 },
  "univ-usto": { lat: 35.6989, lng: -0.5833 },
  "univ-oran1": { lat: 35.7011, lng: -0.6311 },
  "univ-elbayadh": { lat: 33.6811, lng: 1.0189 },
  "univ-bba": { lat: 36.0694, lng: 4.7583 },
  "univ-boumerdes": { lat: 36.7586, lng: 3.4694 },
  "univ-eloued": { lat: 33.3644, lng: 6.8483 },
  "esc-koléa": { lat: 36.6342, lng: 2.7050 }
};

// Default center coordinates of all 58 Algerian Wilayas
const WILAYA_COORDINATES: Record<number, { lat: number; lng: number }> = {
  1: { lat: 27.8741, lng: -0.2831 }, // أدرار
  2: { lat: 36.1642, lng: 1.3328 }, // الشلف
  3: { lat: 33.7997, lng: 2.8794 }, // الأغواط
  4: { lat: 35.8753, lng: 7.1084 }, // أم البواقي
  5: { lat: 35.5398, lng: 6.1368 }, // باتنة
  6: { lat: 36.7511, lng: 5.0450 }, // بجاية
  7: { lat: 34.8464, lng: 5.7483 }, // بسكرة
  8: { lat: 31.6215, lng: -2.2239 }, // بشار
  9: { lat: 36.4391, lng: 2.8272 }, // البليدة
  10: { lat: 36.3725, lng: 3.8964 }, // البويرة
  11: { lat: 22.7844, lng: 5.5228 }, // تمنراست
  12: { lat: 35.4057, lng: 8.1189 }, // تبسة
  13: { lat: 34.8817, lng: -1.3158 }, // تلمسان
  14: { lat: 35.3524, lng: 1.3533 }, // تيارت
  15: { lat: 36.7022, lng: 4.0483 }, // تيزي وزو
  16: { lat: 36.7538, lng: 3.0588 }, // الجزائر العاصمة
  17: { lat: 34.6644, lng: 3.2625 }, // الجلفة
  18: { lat: 36.8044, lng: 5.7539 }, // جيجل
  19: { lat: 36.1912, lng: 5.3789 }, // سطيف
  20: { lat: 34.8311, lng: 0.1517 }, // سعيدة
  21: { lat: 36.8644, lng: 6.9112 }, // سكيكدة
  22: { lat: 35.1950, lng: -0.6356 }, // سيدي بلعباس
  23: { lat: 36.9031, lng: 7.7478 }, // عنابة
  24: { lat: 36.4619, lng: 7.4258 }, // قالمة
  25: { lat: 36.3411, lng: 6.6136 }, // قسنطينة
  26: { lat: 36.2642, lng: 2.7533 }, // المدية
  27: { lat: 35.9328, lng: 0.1014 }, // مستغانم
  28: { lat: 35.7031, lng: 4.5414 }, // المسيلة
  29: { lat: 35.3986, lng: 0.1414 }, // معسكر
  30: { lat: 31.9511, lng: 5.3250 }, // ورقلة
  31: { lat: 35.6989, lng: -0.5833 }, // وهران
  32: { lat: 33.6811, lng: 1.0189 }, // البيض
  33: { lat: 26.4831, lng: 8.4689 }, // إليزي
  34: { lat: 36.0694, lng: 4.7583 }, // برج بوعريريج
  35: { lat: 36.7586, lng: 3.4694 }, // بومرداس
  36: { lat: 36.7642, lng: 8.3111 }, // الطارف
  37: { lat: 28.7111, lng: -8.1311 }, // تندوف
  38: { lat: 35.6111, lng: 1.8111 }, // تيسمسيلت
  39: { lat: 33.3644, lng: 6.8483 }, // الوادي
  40: { lat: 35.4311, lng: 7.1511 }, // خنشلة
  41: { lat: 36.2811, lng: 7.9511 }, // سوق أهراس
  42: { lat: 36.5911, lng: 2.4411 }, // تيبازة
  43: { lat: 36.4511, lng: 6.2511 }, // ميلة
  44: { lat: 36.2611, lng: 1.9611 }, // عين الدفلى
  45: { lat: 32.7211, lng: -0.3111 }, // النعامة
  46: { lat: 35.3011, lng: -1.1311 }, // عين تموشنت
  47: { lat: 32.4811, lng: 3.6711 }, // غرداية
  48: { lat: 35.7311, lng: 0.5511 }, // غليزان
  49: { lat: 33.9511, lng: 5.7411 }, // المغير
  50: { lat: 30.5811, lng: 2.8811 }, // المنيعة
  51: { lat: 34.3311, lng: 5.0611 }, // أولاد جلال
  52: { lat: 21.3311, lng: 0.9511 }, // برج باجي مختار
  53: { lat: 30.0811, lng: -2.1811 }, // بني عباس
  54: { lat: 27.2311, lng: 2.4811 }, // عين صالح
  55: { lat: 19.5711, lng: 5.7811 }, // عين قزام
  56: { lat: 33.1011, lng: 6.0611 }, // تقرت
  57: { lat: 24.5511, lng: 9.4811 }, // جانت
  58: { lat: 29.2511, lng: 0.2511 }  // تيميمون
};

interface UniversityMapProps {
  universityId: string;
  universityName: string;
  address: string;
  wilayaCode: number;
}

export default function UniversityMap({
  universityId,
  universityName,
  address,
  wilayaCode
}: UniversityMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Extract coordinate based on ID fallback to Wilaya code, fallback to Algiers center
  const coord = UNIVERSITY_COORDINATES[universityId] || 
                WILAYA_COORDINATES[wilayaCode] || 
                { lat: 36.7538, lng: 3.0588 };

  // Google Maps external direction url
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(universityName + ", " + address)}`;

  if (!hasValidKey) {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-4 flex flex-col items-center justify-center min-h-[220px] text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-2">
          <MapPin className="h-6 w-6 animate-pulse" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">تنشيط خارطة جوجل التفاعلية (Google Map)</h4>
        <p className="text-xs text-slate-500 max-w-sm mb-3">
          يتم جلب الموقع الجغرافي لـ <span className="font-bold text-indigo-650">{universityName}</span>. لعرض الخريطة التفاعلية الحية مع التفاصيل، يرجى تفعيل مفتاح Google Maps API.
        </p>
        <div className="bg-indigo-50/50 rounded-xl p-2.5 text-[11px] text-indigo-700 max-w-xs mb-3 text-right leading-relaxed border border-indigo-100">
          <div className="font-bold flex items-center gap-1 mb-1">
            <Sparkles className="h-3 w-3" />
            <span>طريقة إضافة مفتاح الخريطة:</span>
          </div>
          افتح <b>الإعدادات</b> (أيقونة الترس ⚙️ في الزاوية العلوية اليمنى) ← <b>الأسرار (Secrets)</b> ← أضف مفتاح باسم <code>GOOGLE_MAPS_PLATFORM_KEY</code> ومعه رمز الـ API الخاص بـ Google Maps.
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold px-3.5 py-1.5 flex items-center gap-1 transition"
          >
            <span>الحصول على مفتاح</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold px-3.5 py-1.5 flex items-center gap-1 transition"
          >
            <span>معاينة على خرائط Google 🗺️</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      <div className="flex items-center justify-between bg-slate-100 border-b border-slate-200 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-700">موقع جغرافي تفاعلي حي</span>
        </div>
        
        {/* Map Type selectors */}
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${mapType === 'roadmap' ? 'bg-indigo-650 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            خريطة
          </button>
          <button 
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${mapType === 'hybrid' ? 'bg-indigo-650 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            قمر صناعي
          </button>
        </div>
      </div>

      <div className="relative h-[220px] w-full" style={{ minHeight: '220px' }}>
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={coord}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            <AdvancedMarker position={coord} title={universityName}>
              <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#4338ca" scale={1.2}>
                <div className="text-[10px] text-white">🎓</div>
              </Pin>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>

      {/* External Navigation link */}
      <div className="bg-slate-50 border-t border-slate-200 p-2 text-center">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-indigo-650 hover:text-indigo-800 font-extrabold hover:underline"
        >
          <Navigation className="h-3 w-3 text-indigo-500" />
          <span>توجيهات الملاحة وتكبير الموقع على Google Maps</span>
        </a>
      </div>
    </div>
  );
}
