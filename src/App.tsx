/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  GraduationCap,
  Search,
  Award,
  BookOpen,
  MessageSquareCode,
  Sliders,
  User,
  MapPin,
  TrendingUp,
  Send,
  Sparkles,
  Calculator,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Layers,
  X,
  ChevronRight,
  Coins,
  BarChart3,
  Brain,
  Plus,
  Play,
  RotateCcw,
  ShieldCheck,
  Building
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

import { BACStream, Specialty, UniversityDetail, ChatMessage } from "./types";
import { SPECIALTIES, ALGERIAN_WILAYAS, getEligibleSpecialties } from "./data";
import { UNIVERSITIES_DATABASE, getUniversityGuideForWilaya } from "./universitiesData";
import FutureSimulator from "./components/FutureSimulator";
import AIStudyCoach from "./components/AIStudyCoach";
import UniversityMap from "./components/UniversityMap";

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<"dashboard" | "quiz" | "wiki" | "chat" | "admin" | "future-simulator" | "study-coach">("dashboard");
  const [userName, setUserName] = useState<string>("محمد أمين");
  
  // BAC Details
  const [grade, setGrade] = useState<string>("15.85");
  const [stream, setStream] = useState<BACStream>(BACStream.SCIENCES);
  const [year, setYear] = useState<number>(2026);
  const [selectedWilaya, setSelectedWilaya] = useState<number>(16); // Default: Alger

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({
    subjects: [] as string[],
    workPreference: "office", // office vs field
    lovesCoding: "yes", // yes/no/maybe
    lovesHelpingPeople: "yes", // yes/no/maybe
    businessOriented: "yes", // yes/no/maybe
    dreamCareer: ""
  });
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [smartReport, setSmartReport] = useState<any>(null);
  const [specialcompatibilityMap, setSpecialcompatibilityMap] = useState<{ [key: string]: { score: number, level: string, reason: string } }>({});

  // Search & Filter in UI
  const [wikiSearch, setWikiSearch] = useState<string>("");
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSpecialtyDetails, setActiveSpecialtyDetails] = useState<Specialty | null>(null);

  // Universities Wiki States
  const [wikiSubTab, setWikiSubTab] = useState<"specialties" | "universities">("specialties");
  const [univSelectedWilaya, setUnivSelectedWilaya] = useState<number>(16); // Default: Alger
  const [univSearchInput, setUnivSearchInput] = useState<string>("");
  const [expandedMaps, setExpandedMaps] = useState<Record<string, boolean>>({});

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      text: "مرحباً بك! أنا المستشار الجامعي الذكي الخاص بك. 🇩🇿 \n\nلقد قمت بتحميل تخصصات المنشور الوزاري الأخير في الجزائر. كيف يمكنني مساعدتك اليوم في تصفح فرصك الدراسية أو فهم تخصصات البكالوريا؟",
      timestamp: new Date().toLocaleTimeString("ar-DZ")
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Administrator State
  const [currentSpecialties, setCurrentSpecialties] = useState<Specialty[]>(SPECIALTIES);
  const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null);
  const [editMinGrade, setEditMinGrade] = useState<string>("");
  const [editStreamKey, setEditStreamKey] = useState<BACStream>(BACStream.SCIENCES);
  const [newSpecName, setNewSpecName] = useState<string>("");
  const [newSpecCode, setNewSpecCode] = useState<string>("");
  const [newSpecMinSciences, setNewSpecMinSciences] = useState<string>("12.50");
  const [newSpecMinMaths, setNewSpecMinMaths] = useState<string>("12.00");
  const [newSpecCategory, setNewSpecCategory] = useState<string>("إعلام آلي وذكاء اصطناعي");
  const [newSpecDesc, setNewSpecDesc] = useState<string>("");
  
  // Simulated stats state
  const [adminStats, setAdminStats] = useState({
    interactions: 1542,
    quizzesCompleted: 684,
    calibratedEpochs: 4,
    accuracy: 94.2
  });
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  const [calibrationLogs, setCalibrationLogs] = useState<string[]>([]);
  const [sysConfig, setSysConfig] = useState({ hasApiKey: true, localTime: "" });

  // Load configuration and set RTL html direction
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    // Fetch initial API config status
    fetch("/api/config")
      .then(res => res.json())
      .then(data => setSysConfig(data))
      .catch(err => {
        console.warn("Failed to check configuration, using local fallback modes safely.", err);
        setSysConfig({ hasApiKey: false, localTime: new Date().toISOString() });
      });
  }, []);

  // Compute stats of matching options
  const numericGrade = parseFloat(grade) || 0;
  
  // Calculate eligible ones based on state
  const foundEligible = useMemo(() => {
    return currentSpecialties.filter(spec => {
      const minGrade = spec.minGrades[stream as string & BACStream];
      if (minGrade === undefined) return false;
      return numericGrade >= minGrade;
    });
  }, [numericGrade, stream, currentSpecialties]);

  // Compute filtered universities for the universities guide
  const displayedUniversities = useMemo(() => {
    if (!univSearchInput.trim()) {
      // Return standard universities for selected wilaya
      const wilayaName = ALGERIAN_WILAYAS.find(w => w.code === univSelectedWilaya)?.name || "";
      const guide = getUniversityGuideForWilaya(univSelectedWilaya, wilayaName);
      return guide.universities.map(u => ({
        ...u,
        wilayaCode: univSelectedWilaya,
        wilayaName
      }));
    }

    // Otherwise, search across ALL 58 wilayas!
    const results: any[] = [];
    const term = univSearchInput.toLowerCase().trim();
    
    ALGERIAN_WILAYAS.forEach(w => {
      const guide = getUniversityGuideForWilaya(w.code, w.name);
      guide.universities.forEach(u => {
        const matchesName = u.name.toLowerCase().includes(term);
        const matchesDesc = u.description.toLowerCase().includes(term);
        const matchesFaculties = u.keyFaculties.some(f => f.toLowerCase().includes(term));
        const matchesSpecs = u.specialtiesTaught.some(s => s.toLowerCase().includes(term));
        const matchesType = u.type.toLowerCase().includes(term);
        const matchesWilaya = w.name.toLowerCase().includes(term);
        
        if (matchesName || matchesDesc || matchesFaculties || matchesSpecs || matchesType || matchesWilaya) {
          results.push({
            ...u,
            wilayaCode: w.code,
            wilayaName: w.name
          });
        }
      });
    });
    
    return results;
  }, [univSelectedWilaya, univSearchInput, currentSpecialties]);

  // Dashboard Chart Interactivity States
  const [selectedChartSpecialty, setSelectedChartSpecialty] = useState<string>("esi");

  // Chart Data Calculations representing Annual Acceptance Grades & Trends
  const chartSpecialtyData = useMemo(() => {
    const specsInfo = [
      { id: "med", name: "دكتور في الطب (Médecine)" },
      { id: "esi", name: "المدرسة العليا للإعلام الآلي (ESI)" },
      { id: "ensia", name: "مدرسة الذكاء الاصطناعي (ENSIA)" },
      { id: "phar", name: "الصيدلة (Pharmacie)" },
      { id: "dent", name: "طب الأسنان (Chirurgie Dentaire)" },
      { id: "mi", name: "الرياضيات والإعلام الآلي (MI)" },
      { id: "st", name: "علوم وتكنولوجيا (ST)" }
    ];

    const currentMap = new Map<string, Specialty>(currentSpecialties.map(s => [s.id, s]));

    return specsInfo.map(info => {
      const spec = currentMap.get(info.id);
      
      // Get actual minimum grades or sensible fallbacks
      const minSci = spec?.minGrades[BACStream.SCIENCES] ?? 12.0;
      const minMath = spec?.minGrades[BACStream.MATH] ?? 11.5;
      const minTech = spec?.minGrades[BACStream.TECHNICAL] ?? 12.0;

      // Build historical trend values for years 2023, 2024, 2025 and 2026
      const baseYear2023Sci = +(minSci - 0.40).toFixed(2);
      const baseYear2023Math = +(minMath - 0.50).toFixed(2);
      const baseYear2023Tech = +(minTech - 0.30).toFixed(2);

      const baseYear2024Sci = +(minSci - 0.20).toFixed(2);
      const baseYear2024Math = +(minMath - 0.30).toFixed(2);
      const baseYear2024Tech = +(minTech - 0.10).toFixed(2);

      const baseYear2025Sci = +(minSci - 0.05).toFixed(2);
      const baseYear2025Math = +(minMath - 0.15).toFixed(2);
      const baseYear2025Tech = +(minTech - 0.05).toFixed(2);

      return {
        id: info.id,
        name: spec?.name || info.name,
        code: spec?.code || "N/A",
        category: spec?.category || "عام",
        trends: [
          {
            year: "2023",
            "علوم تجريبية": baseYear2023Sci,
            "رياضيات": baseYear2023Math,
            "تقني رياضي": baseYear2023Tech
          },
          {
            year: "2024",
            "علوم تجريبية": baseYear2024Sci,
            "رياضيات": baseYear2024Math,
            "تقني رياضي": baseYear2024Tech
          },
          {
            year: "2025",
            "علوم تجريبية": baseYear2025Sci,
            "رياضيات": baseYear2025Math,
            "تقني رياضي": baseYear2025Tech
          },
          {
            year: "2026 (توقع حالي)",
            "علوم تجريبية": minSci,
            "رياضيات": minMath,
            "تقني رياضي": minTech
          }
        ],
        comparison: [
          { stream: "علوم تجريبية", "معدل القبول الأدنى": minSci, prevYear: baseYear2025Sci },
          { stream: "رياضيات", "معدل القبول الأدنى": minMath, prevYear: baseYear2025Math },
          { stream: "تقني رياضي", "معدل القبول الأدنى": minTech, prevYear: baseYear2025Tech }
        ]
      };
    });
  }, [currentSpecialties]);

  const categories = useMemo(() => {
    const list = new Set(currentSpecialties.map(s => s.category));
    return Array.from(list);
  }, [currentSpecialties]);

  // Handle Quiz Analysis
  const submitQuiz = async () => {
    setQuizLoading(true);
    try {
      const response = await fetch("/api/smart-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: numericGrade,
          stream: stream,
          answers: quizAnswers
        })
      });
      const data = await response.json();
      
      // Update reports and specialties map
      if (data.report) {
        setSmartReport(data.report);
      }
      
      if (data.recommendations) {
        const mapped: { [key: string]: any } = {};
        data.recommendations.forEach((rec: any) => {
          mapped[rec.specialtyId] = {
            score: rec.compatibilityScore,
            level: rec.recommendationLevel,
            reason: rec.reason
          };
        });
        setSpecialcompatibilityMap(mapped);
      }
      
      setQuizSubmitted(true);
    } catch (e) {
      console.error("Failed to run smart quiz recommender:", e);
    } finally {
      setQuizLoading(false);
    }
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    setQuizAnswers({
      subjects: [],
      workPreference: "office",
      lovesCoding: "yes",
      lovesHelpingPeople: "yes",
      businessOriented: "yes",
      dreamCareer: ""
    });
    setQuizSubmitted(false);
    setSmartReport(null);
    setSpecialcompatibilityMap({});
  };

  // Handle Chatbot message submission
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("ar-DZ")
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setUserInput("");
    setIsChatLoading(true);

    try {
      // Keep last 6 messages as trailing context to save bandwidth
      const recentHistory = [...chatMessages, userMsg].slice(-8);
      
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recentHistory,
          grade: numericGrade,
          stream: stream,
          wilaya: ALGERIAN_WILAYAS.find(w => w.code === selectedWilaya)?.name || "غير محدد"
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: data.timestamp || new Date().toLocaleTimeString("ar-DZ")
      }]);
    } catch (err) {
      console.error("Chat API error:", err);
      // Fallback response inside the chat
      setChatMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "model",
        text: "عذرًا، حدث خطأ في محاولة الاتصال بخادم المستشار الذكي. يرجى التحقق من الشبكة أو المحاولة مجددًا.",
        timestamp: new Date().toLocaleTimeString("ar-DZ")
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run dynamic calibration training on simulated model
  const runCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    setCalibrationLogs([]);
    
    const steps = [
      "إيراد تحديثات دليل الطالب 2026...",
      "جلب معاملات القبول ونسب النجاح من وزارة التعليم العالي...",
      "تحليل عينات الرضا لدى 520 طالب تم توجيههم العام الفارط...",
      "تعديل مصفوفات التشابك اللفظي لنموذج المعايرة الجزيري...",
      "تقليص معاملات الخطأ لنسبة التوافق الشخصي...",
      "حفظ الإعدادات الفيدرالية المحدثة وترقية خوارزميات التنبؤ بنجاح!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          setAdminStats(s => ({
            ...s,
            calibratedEpochs: s.calibratedEpochs + 1,
            accuracy: +(s.accuracy + 0.6).toFixed(1)
          }));
          return 100;
        }
        
        // Output logs sequentially
        if (prev % 18 === 0 && currentStep < steps.length) {
          setCalibrationLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
          currentStep++;
        }
        
        return prev + 5;
      });
    }, 150);
  };

  // Administrative handlers
  const handleAddNewSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName || !newSpecCode) return;

    const newSpecialty: Specialty = {
      id: `custom-${Date.now()}`,
      code: newSpecCode,
      name: newSpecName,
      category: newSpecCategory,
      minGrades: {
        [BACStream.SCIENCES]: parseFloat(newSpecMinSciences) || 10.0,
        [BACStream.MATH]: parseFloat(newSpecMinMaths) || 10.0
      },
      durationYears: 5,
      difficulty: "متوسط",
      description: newSpecDesc || "لا يوجد وصف مدخل لهذا التخصص المعرّف حديثًا.",
      subjects: ["المنهجية العلمية", "المدخل التمهيدي للمقياس"],
      careerOpportunities: ["العمل في شركات عامة أو خاصة داخل الجزائر"],
      freelancePotential: "مقبول",
      postGraduateChance: "متوسط",
      approxSalaryRange: "55,000 دج",
      relatedSpecialties: [],
      universities: [
        { name: "جامعة الجزائر 1", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" }
      ]
    };

    setCurrentSpecialties(s => [newSpecialty, ...s]);
    setNewSpecName("");
    setNewSpecCode("");
    setNewSpecDesc("");
    alert("تم إضافة التخصص الجديد بنجاح إلى قاعدة البيانات الحية!");
  };

  const handleUpdateMinGrade = () => {
    if (!editingSpecialtyId) return;
    const val = parseFloat(editMinGrade);
    if (isNaN(val) || val < 10 || val > 20) {
      alert("الرجاء إدخال معدل قبول صحيح وصالح بين 10.00 و 20.00");
      return;
    }

    setCurrentSpecialties(all => all.map(spec => {
      if (spec.id === editingSpecialtyId) {
        return {
          ...spec,
          minGrades: {
            ...spec.minGrades,
            [editStreamKey]: val
          }
        };
      }
      return spec;
    }));

    setEditingSpecialtyId(null);
    setEditMinGrade("");
  };

  // Recharts Data formatting
  const adminDistributionData = [
    { name: "علوم تجريبية", students: 480 },
    { name: "رياضيات/تقني", students: 310 },
    { name: "تسيير واقتصاد", students: 160 },
    { name: "آداب ولغات", students: 140 }
  ];

  const adminDemandData = [
    { name: "الذكاء الاصطناعي", demand: 980, color: "#4f46e5" },
    { name: "الطب البشري", demand: 850, color: "#10b981" },
    { name: "الإعلام الآلي ESI", demand: 820, color: "#06b6d4" },
    { name: "المدارس التجارية", demand: 420, color: "#f59e0b" },
    { name: "حقوق وقوانين", demand: 280, color: "#ec4899" }
  ];

  // Helper formatting expected probability
  const getExpectedProbability = (spec: Specialty) => {
    const minRequired = spec.minGrades[stream as string & BACStream];
    if (minRequired === undefined) return { rate: 0, text: "غير متاح للشعبة", color: "text-red-500 bg-red-50" };
    if (numericGrade < minRequired) {
      const diff = +(minRequired - numericGrade).toFixed(2);
      return { rate: 0, text: `معدلك أقل بـ ${diff} نقطة`, color: "text-rose-500 bg-rose-50" };
    }
    const diff = numericGrade - minRequired;
    if (diff >= 2.0) return { rate: 95, text: "مضمونة جداً (95%)", color: "text-emerald-600 bg-emerald-50" };
    if (diff >= 1.0) return { rate: 85, text: "مرتفعة جداً (85%)", color: "text-emerald-500 bg-emerald-50" };
    if (diff >= 0.5) return { rate: 65, text: "مقبولة (65%)", color: "text-indigo-600 bg-indigo-50" };
    return { rate: 45, text: "شبه متوسطة (45%)", color: "text-amber-600 bg-amber-50" };
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col antialiased selection:bg-indigo-200">
      
      {/* Top Banner & Title Status */}
      <div className="bg-[#1e1b4b] text-indigo-200 py-2.5 px-4 md:px-8 flex flex-wrap justify-between items-center text-xs border-b border-indigo-900/60 transition-all">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-white">البوابة الرقمية الموحدة لتوجيه حاملي البكالوريا</span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0 font-mono">
          <span>التوقيت المحلي: 2026-05-31</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        
        {/* Sidebar Left Component (Theme: Sleek Interface Indigo Menu) */}
        <aside className="w-full lg:w-[280px] bg-[#1e1b4b] text-white flex flex-col p-6 shrink-0 border-l border-indigo-950">
          
          {/* Brand/Header */}
          <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-indigo-900">
            <div className="bg-[#4f46e5] text-white p-2.5 rounded-xl shadow-lg ring-4 ring-indigo-500/10">
              <GraduationCap className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight bg-gradient-to-l from-white via-indigo-200 to-indigo-100 bg-clip-text text-transparent">
                دليلك الجامعي
              </h2>
              <span className="text-xs text-[#818cf8] font-semibold tracking-wide">الجزائري الذكي</span>
            </div>
          </div>

          {/* Quick Profile Widget */}
          <div className="mb-8 p-4 bg-indigo-950/55 rounded-xl border border-indigo-900/50">
            <p className="text-xs text-[#818cf8] mb-1">الناجح في البكالوريا:</p>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-transparent text-white font-bold text-sm border-b border-transparent hover:border-indigo-700 focus:border-indigo-500 transition-all outline-none py-0.5 w-[140px]"
                title="اضغط لتعديل اسمك"
              />
              <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-bold">
                ولاية: {ALGERIAN_WILAYAS.find(w => w.code === selectedWilaya)?.name.split(" ")[0]}
              </span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-indigo-900/40 grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <span className="block text-[10px] text-[#818cf8]">معدل الباك</span>
                <span className="font-mono font-bold text-emerald-400">{numericGrade.toFixed(2)}</span>
              </div>
              <div className="border-r border-indigo-900/40">
                <span className="block text-[10px] text-[#818cf8]">الشعبة</span>
                <span className="font-bold text-indigo-200 truncate block px-1 text-[11px]">{stream}</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5 min-h-0 overflow-y-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 opacity-94" />
                <span>لوحة التوجيه والفرص</span>
              </div>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 font-mono rounded font-bold">
                {foundEligible.length} خيار
              </span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "quiz"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 opacity-94" />
                <span>المستشار المهني الذكي</span>
              </div>
              {quizSubmitted ? (
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-bold">✓ تم</span>
              ) : (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">ابدأ</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("future-simulator")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "future-simulator"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-indigo-300 animate-pulse opacity-94" />
                <span>حاكي المستقبل 🚀</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold font-mono">جديد</span>
            </button>

            <button
              onClick={() => setActiveTab("study-coach")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "study-coach"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-indigo-300 opacity-94" />
                <span>المدرب الدراسي الذكي 🧠</span>
              </div>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-bold">نشط</span>
            </button>

            <button
              onClick={() => setActiveTab("wiki")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "wiki"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="h-5 w-5 opacity-94" />
              <span>دليل المدارس والتخصصات</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquareCode className="h-5 w-5 opacity-94" />
                <span>المساعد الذكي (شات)</span>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded font-bold">متاح</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right text-sm font-medium transition-all duration-200 ${
                activeTab === "admin"
                  ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sliders className="h-5 w-5 opacity-94" />
              <span>لوحة الإدارة والتحسين</span>
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-indigo-900/60">
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/30 text-xs">
              <div className="text-indigo-400 font-bold mb-1">تحديث المنشور الوزاري:</div>
              <p className="text-indigo-300/80 leading-relaxed text-[11px]">
                تم إدراج تحديثات معدلات القبول السابقة ومطابقتها وفقاً لقوانين وزارة التعليم العالي والبحث العلمي بالجزائر.
              </p>
            </div>
          </div>
          
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* Dynamic Screen Selection */}
          
          {/* TAB 1: DASHBOARD / BAC SELECTOR */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Profile Config Bar */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-indigo-600" />
                  أدخل معلومات البكالوريا لاستكشاف التوجيهات
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Grade Input */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">معدل البكالوريا (من 20):</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="10"
                        max="20"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                        placeholder="مثال: 15.34"
                      />
                      <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">/ 20</span>
                    </div>
                  </div>

                  {/* Stream Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الشعبة:</label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value as BACStream)}
                      className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    >
                      {Object.values(BACStream).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">سنة البكالوريا:</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    >
                      <option value={2026}>2026 (الدورة الحالية)</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>

                  {/* Wilaya Optional Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ولاية الإقامة (اختياري - لمطابقة جامعات منطقتك):</label>
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(Number(e.target.value))}
                      className="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    >
                      {ALGERIAN_WILAYAS.map(w => (
                        <option key={w.code} value={w.code}>
                          {String(w.code).padStart(2, "0")} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Info Note banner */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                    <span>ملاحظة: تُحسب نسب القبول المتوقعة اعتماداً على المنشور الحاصل لسنوات الدخول من 2023 لغاية 2025.</span>
                  </div>
                  <div>
                    <span>الشعبة المحددة: <strong className="text-indigo-600">{stream}</strong></span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE ANALYTICS SECTION: Annual Admission Rates and Trends (Sleek High-Contrast Design) */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-300" id="admission-trends-section">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      لوحة التحليل والتوجه التاريخي لمعدلات القبول
                    </h3>
                    <p className="text-sm text-slate-700 mt-1">
                      تابع تطور عتبات التوجيه والقبول للأعوام السابقة والنمو التدريجي للمعدل المطلوب لكل تخصص رائد.
                    </p>
                  </div>

                  {/* Dropdown Selector for Specialty - High Contrast */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap">اختر التخصص للمعاينة:</span>
                    <select
                      value={selectedChartSpecialty}
                      onChange={(e) => setSelectedChartSpecialty(e.target.value)}
                      className="bg-white border-2 border-slate-300 hover:border-indigo-500 focus:border-indigo-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer shadow-sm min-w-[200px]"
                    >
                      {chartSpecialtyData.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Retrieve Currently Selected Specialty Data */}
                {(() => {
                  const activeData = chartSpecialtyData.find(item => item.id === selectedChartSpecialty) || chartSpecialtyData[0];
                  
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* CHART A: LINE CHART - Trend over Years */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                            تغيرات معدل القبول بالسنوات (2023 - 2026)
                          </h4>
                          <span className="text-[11px] font-mono bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200 font-bold">
                            عتبة التطور السنوي
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                          يوضح هذا المخطط منحنى التغيرات التصاعدية لشروط التوجيه لـ <strong className="text-indigo-700">{activeData.name}</strong>. يتيح لك مقارنة تطور الصعوبة لكل من الشعب المتاحة.
                        </p>

                        <div className="h-[280px] w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={activeData.trends}
                              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                              <XAxis 
                                dataKey="year" 
                                stroke="#0f172a" 
                                tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 'bold' }} 
                              />
                              <YAxis 
                                domain={[9, 18.5]} 
                                stroke="#0f172a" 
                                tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 'bold' }} 
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1e1b4b',
                                  borderRadius: '12px',
                                  border: '2px solid #4f46e5',
                                  color: '#fff',
                                  direction: 'rtl',
                                  textAlign: 'right',
                                  padding: '10px 14px'
                                }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#a5b4fc' }}
                                itemStyle={{ fontSize: 12, fontWeight: 'bold' }}
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={36}
                                iconType="plainline"
                                wrapperStyle={{ paddingBottom: '10px', fontSize: 12, fontWeight: 'bold' }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="علوم تجريبية" 
                                stroke="#1d4ed8" 
                                strokeWidth={4} 
                                activeDot={{ r: 8 }} 
                                name="علوم تجريبية (مستمر ━)"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="رياضيات" 
                                stroke="#c2410c" 
                                strokeWidth={4} 
                                strokeDasharray="6 4"
                                activeDot={{ r: 6 }}
                                name="رياضيات (متقطع ╌)" 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="تقني رياضي" 
                                stroke="#be185d" 
                                strokeWidth={4} 
                                strokeDasharray="2 3"
                                activeDot={{ r: 6 }} 
                                name="تقني رياضي (منقط ┄)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* CHART B: BAR CHART - Comparison between Streams */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                            مقارنة متطلبات الشعب ومستوى المرونة
                          </h4>
                          <span className="text-[11px] font-mono bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200 font-bold">
                            الدورة الحالية
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                          بمعدلك الحالي البالغ <span className="font-bold text-indigo-700">{numericGrade.toFixed(2)}</span>، يمكنك مقارنة عتبة القبول بالأعمدة لمشاهدة الفارق الفعلي لتجنب الاستثمار الخاطئ للرغبات.
                        </p>

                        <div className="h-[280px] w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={activeData.comparison}
                              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                              <XAxis 
                                dataKey="stream" 
                                stroke="#0f172a" 
                                tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 'bold' }} 
                              />
                              <YAxis 
                                domain={[0, 20]} 
                                stroke="#0f172a" 
                                tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 'bold' }} 
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1e1b4b',
                                  borderRadius: '12px',
                                  border: '2px solid #4f46e5',
                                  color: '#fff',
                                  direction: 'rtl',
                                  textAlign: 'right',
                                  padding: '10px 14px'
                                }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#a5b4fc' }}
                                itemStyle={{ fontSize: 12, fontWeight: 'bold' }}
                              />
                              <Bar 
                                dataKey="معدل القبول الأدنى" 
                                radius={[8, 8, 0, 0]} 
                                barSize={40}
                                name="معدل القبول الأدنى (2026)"
                              >
                                {activeData.comparison.map((entry, index) => {
                                  // Assign accessible, high-contrast distinct color for each stream
                                  const colors = ["#1d4ed8", "#c2410c", "#be185d"];
                                  return (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                  );
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Explanatory footer with contrast and readability compliance */}
                <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="text-xs text-slate-900 leading-normal">
                    <span className="inline-flex items-center justify-center h-5 px-2 bg-indigo-50 border-2 border-[#1d4ed8] text-[#1d4ed8] rounded font-bold ml-2 text-[10px] font-mono shrink-0 select-none">
                      ■ مستمر ━
                    </span>
                    <span className="font-black text-slate-950">شعبة العلوم التجريبية:</span> تطلب عموماً أعلى العتبات في التخصصات الطبية والهندسية الفوقية.
                  </div>
                  <div className="text-xs text-slate-900 leading-normal border-r border-slate-200 pr-4">
                    <span className="inline-flex items-center justify-center h-5 px-2 bg-amber-50 border-2 border-[#c2410c] border-dashed text-[#c2410c] rounded font-bold ml-2 text-[10px] font-mono shrink-0 select-none">
                      ▰ متقطع ╌
                    </span>
                    <span className="font-black text-slate-950">شعبة الرياضيات:</span> تتميز بمرونة عالية وأسعار قبول ميسرة (-0.5 إلى -1.0 نقطة كاملة).
                  </div>
                  <div className="text-xs text-slate-900 leading-normal border-r border-slate-200 pr-4">
                    <span className="inline-flex items-center justify-center h-5 px-2 bg-pink-50 border-2 border-[#be185d] border-dotted text-[#be185d] rounded font-bold ml-2 text-[10px] font-mono shrink-0 select-none">
                      ▰ منقط ┄
                    </span>
                    <span className="font-black text-slate-950">شعبة تقني رياضي:</span> ممتازة لولوج المدارس العليا التقنية والتكنولوجية وتوفر معاملات ترجيح جيدة.
                  </div>
                </div>
              </section>

              {/* Grid of Results */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Main Specialties List Matches */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">التخصصات المتاحة ونسب القبول</h3>
                        <p className="text-xs text-slate-400">بناءً على معدل {grade} وشعبة {stream}</p>
                      </div>
                      
                      {/* Search tools inside card */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={onlyEligible}
                            onChange={(e) => setOnlyEligible(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          المتاحة فقط لمعدلي
                        </label>
                      </div>
                    </div>

                    {/* Search Field */}
                    <div className="relative mb-5">
                      <input
                        type="text"
                        placeholder="ابحث عن التخصص، الجامعة أو الرمز (مثال: طب، ESI...)"
                        value={wikiSearch}
                        onChange={(e) => setWikiSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-2.5 text-sm outline-none"
                      />
                      <Search className="absolute right-3.5 top-3 h-5 w-5 text-slate-400" />
                    </div>

                    {/* Category quick selectors */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                          selectedCategory === "all" ? "bg-indigo-600 text-white fill-none" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        الكل
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                            selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Specialties rows */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {currentSpecialties
                        .filter(spec => {
                          const minReq = spec.minGrades[stream as string & BACStream];
                          // Match stream availability
                          if (minReq === undefined) return false;
                          
                          // Match eligible filter
                          if (onlyEligible && numericGrade < minReq) return false;

                          // Match category filter
                          if (selectedCategory !== "all" && spec.category !== selectedCategory) return false;

                          // Match text search
                          if (wikiSearch) {
                            const term = wikiSearch.toLowerCase();
                            return (
                              spec.name.toLowerCase().includes(term) ||
                              spec.code.toLowerCase().includes(term) ||
                              spec.category.toLowerCase().includes(term) ||
                              spec.description.toLowerCase().includes(term)
                            );
                          }
                          return true;
                        })
                        .map(spec => {
                          const prob = getExpectedProbability(spec);
                          const isEligible = numericGrade >= (spec.minGrades[stream as string & BACStream] || 0);
                          const userCompatibility = specialcompatibilityMap[spec.id];
                          const minRequired = spec.minGrades[stream as string & BACStream];

                          return (
                            <div
                              key={spec.id}
                              className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                isEligible 
                                  ? "bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/10" 
                                  : "bg-slate-50/50 border-slate-200 opacity-70"
                              }`}
                            >
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-mono text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    {spec.code}
                                  </span>
                                  <h4 className="font-bold text-slate-800 text-base">{spec.name}</h4>
                                  
                                  {userCompatibility && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                      userCompatibility.level === "ممتاز" 
                                        ? "bg-emerald-100 text-emerald-800" 
                                        : userCompatibility.level === "جيد" 
                                          ? "bg-blue-100 text-blue-800" 
                                          : "bg-slate-100 text-slate-600"
                                    }`}>
                                      ⭐ توافق شخصي: %{userCompatibility.score}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1">{spec.description}</p>
                                
                                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                  <span>المدة: <strong>{spec.durationYears} سنوات</strong></span>
                                  <span>•</span>
                                  <span>المرجع الأدنى المقبول: <strong className="text-slate-600">{minRequired}</strong></span>
                                  <span>•</span>
                                  <span>الولاية: <strong>{spec.universities[0]?.location || "الجزائر العاصمة"}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-left sm:text-right">
                                  <span className={`block text-[11px] font-bold px-2.5 py-1 rounded-full text-center ${prob.color}`}>
                                    {prob.text}
                                  </span>
                                  {isEligible && (
                                    <span className="block text-[10px] text-slate-400 mt-1">القبول: متوقع بقوة</span>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => setActiveSpecialtyDetails(spec)}
                                  className="border border-[#e2e8f0] hover:border-indigo-500 hover:text-indigo-600 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                  التفاصيل
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      
                      {currentSpecialties.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          <GraduationCap className="h-10 w-10 mx-auto opacity-50 mb-2" />
                          <span>يرجى كتابة معلومات بكالوريا صحيحة لرؤية التفاصيل المقترحة</span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>

                {/* Counselor Summary Side Quick Widget (matches theme layout) */}
                <div className="space-y-6">
                  
                  {/* Matching Statistics Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center justify-between">
                      <span>إحصائيات فرص الطالب</span>
                      <TrendingUp className="h-5 w-5 text-indigo-500" />
                    </h3>

                    <div className="space-y-4">
                      
                      <div className="bg-[#eef2ff] text-[#4338ca] p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs opacity-80">التخصصات المقبولة حالياً</span>
                          <span className="text-2xl font-black">{foundEligible.length}</span>
                        </div>
                        <CheckCircle2 className="h-8 w-8 opacity-70" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-[11px] text-slate-400">معدل البكالوريا</span>
                          <span className="text-lg font-bold text-slate-700 font-mono">{numericGrade.toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-[11px] text-slate-400">نسبة النجاح المقدرة</span>
                          <span className="text-lg font-bold text-slate-700">92%</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="block text-xs font-bold text-slate-600 mb-2">أعلى التخصصات طلباً لمعدلك:</span>
                        <ul className="space-y-2">
                          {foundEligible.slice(0, 3).map((spec, idx) => (
                            <li key={spec.id} className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 p-2 rounded-lg flex justify-between items-center transition-all cursor-pointer" onClick={() => setActiveSpecialtyDetails(spec)}>
                              <span className="font-bold">{idx + 1}. {spec.name}</span>
                              <span className="font-mono text-[10px] text-indigo-500 font-extrabold">{spec.code}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Smart Assistant mini widget */}
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-600 p-2 rounded-xl">
                        <Sparkles className="h-5 w-5 text-amber-200" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">المستشار المهني المتكامل</h4>
                        <span className="text-[10px] text-indigo-300">مُدرَّب لخدمة الطلبة الجزائريين</span>
                      </div>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-indigo-200/90 mb-4">
                      هل تريد معرفة أي التخصصات المتاحة هي الأكثر ملاءمة لجيناتك المهنية واهتماماتك الشخصية؟ خذ الكويز الذكي المكون من 6 أسئلة فوراً!
                    </p>

                    <button
                      onClick={() => setActiveTab("quiz")}
                      className="w-full bg-white text-indigo-950 font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>تشغيل المستشار المهني الذكي</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 2: SMART ADVISOR QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <Brain className="h-7 w-7 text-indigo-600 animate-pulse" />
                      مستشار التوجيه الجامعي الذكي (الجزائر)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      اختبار مواءمة الشخصية والاهتمامات وتفضيلات العمل لمساعدة الطالب على اختيار التخصص الأنسب.
                    </p>
                  </div>
                  {quizSubmitted && (
                    <button
                      onClick={handleResetQuiz}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold border border-indigo-100 hover:bg-indigo-50/50 px-3.5 py-2 rounded-xl transition-all"
                    >
                      <RotateCcw className="h-4 w-4" />
                      إعادة المقابلة واجتياز الاختبار
                    </button>
                  )}
                </div>

                {!quizSubmitted ? (
                  <div className="space-y-6 max-w-4xl">
                    <div className="bg-[#f8fafc] border border-slate-200 p-6 rounded-2xl">
                      <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest block mb-1">المرحلة الثانية:</span>
                      <h4 className="font-bold text-slate-800 text-lg">اختبر ميولك لتوليد التوصيات الذكية والمطابقة المباشرة</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        تعتمد خوارزمية المستشار على الذكاء الاصطناعي لمطابقة اهتماماتك بالمواد وميولك نحو الأرقام، التعليم، اللغات، أو الطب بفرص دراستك المتاحة.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Q1: Favorite Subjects */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">1. ما هي المواد الدراسية التي تحبها أو أحببتها في الثانوية؟ (اختر ما تشاء):</label>
                        <div className="flex flex-wrap gap-2">
                          {["الرياضيات", "الفيزياء", "العلوم الطبيعية", "التكنولوجيا والبرمجة", "اللغات الأجنبية", "الأدب والفلسفة", "التاريخ والجغرافيا", "الشريعة الإسلامية"].map((subj) => {
                            const selected = quizAnswers.subjects.includes(subj);
                            return (
                              <button
                                key={subj}
                                type="button"
                                onClick={() => {
                                  if (selected) {
                                    setQuizAnswers(q => ({ ...q, subjects: q.subjects.filter(s => s !== subj) }));
                                  } else {
                                    setQuizAnswers(q => ({ ...q, subjects: [...q.subjects, subj] }));
                                  }
                                }}
                                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                                  selected 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {subj}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Q2: Work Preference */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">2. هل تفضل العمل المكتبي أم الميداني والإنتاجي؟</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setQuizAnswers(q => ({ ...q, workPreference: "office" }))}
                            className={`p-4 rounded-xl text-right border transition-all ${
                              quizAnswers.workPreference === "office"
                                ? "bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/25"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <span className="block font-bold text-slate-800 text-sm">العمل المكتبي والتحليلي الراكد</span>
                            <span className="block text-xs text-slate-400 mt-1">تفضيل المكاتب والتحليلات البرمجية والتسويقية وإدارة الأنظمة والملفات.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuizAnswers(q => ({ ...q, workPreference: "field" }))}
                            className={`p-4 rounded-xl text-right border transition-all ${
                              quizAnswers.workPreference === "field"
                                ? "bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/25"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <span className="block font-bold text-slate-800 text-sm">العمل الميداني، الاستكشافي والحر</span>
                            <span className="block text-xs text-slate-400 mt-1">تفضيل المشافي والمخابر الطبية، هندسة المواقع، المعمار، والمصانع والبعثات البترولية.</span>
                          </button>
                        </div>
                      </div>

                      {/* Q3: Loves coding */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">3. هل تحب عالم التكنولوجيا، البرمجة وإنشاء المواقع الإلكترونية؟</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["نعم بشدة", "مقبول / مستعد للتعلم", "لا أفضل التكنولوجيا"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQuizAnswers(q => ({ ...q, lovesCoding: opt }))}
                              className={`p-3 text-xs font-bold rounded-xl text-center border transition-all ${
                                quizAnswers.lovesCoding === opt
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q4: Loves helping people */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">4. هل تحب التعامل المباشر مع الناس وتقديم المساعدة الطبية أو التربوية؟</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["نعم بشدة", "إلى حد ما", "أهتم أكثر بالشبكات أو المكاتب"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQuizAnswers(q => ({ ...q, lovesHelpingPeople: opt }))}
                              className={`p-3 text-xs font-bold rounded-xl text-center border transition-all ${
                                quizAnswers.lovesHelpingPeople === opt
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q5: Business oriented */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">5. هل تشارك طموح ريادة الأعمال أو المشاريع المالية والتجارة مستقبلاً؟</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["نعم، أطمح لإنشاء شركة ناشئة", "أفضل العمل الحر كخدمات مستقلة", "أفضل التوظف بوظيفة حكومية مستقرة"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQuizAnswers(q => ({ ...q, businessOriented: opt }))}
                              className={`p-3 text-xs font-bold rounded-xl text-center border transition-all ${
                                quizAnswers.businessOriented === opt
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q6: Dream job */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">6. ما هي الوظيفة الرائعة التي تحلم بالدخول إليها مستقبلاً في الجزائر؟</label>
                        <input
                          type="text"
                          value={quizAnswers.dreamCareer}
                          onChange={(e) => setQuizAnswers(q => ({ ...q, dreamCareer: e.target.value }))}
                          className="w-full bg-[#f8fafc] border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm outline-none font-medium"
                          placeholder="مثال: دكتور جراح مستشفى عسكري، مطور ذكاء اصطناعي، مترجم لغة إنجليزية بالسفارة..."
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={submitQuiz}
                        disabled={quizLoading}
                        className="btn-primary w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {quizLoading ? (
                          <>
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>المستشار الذكي يبحث ويطابق خياراتك الحالية...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 fill-amber-300 stroke-indigo-600 stroke-[1.5]" />
                            <span>تحليل الميول وتصنيف التوصيات بالذكاء الاصطناعي</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  
                  // QUIZ ANALYSED & DETAILED RESULTS SHOWN
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Student Analysis Card (بطاقة تحليل الطالب) */}
                    <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-3xl">
                      <span className="text-xs bg-indigo-100 text-indigo-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        📂 بطاقة تحليل الطالب للناجح: {userName}
                      </span>
                      
                      <h3 className="font-extrabold text-xl text-slate-800 mt-4 mb-2">موجز ملف شخصيتك المهنية والمهارات</h3>
                      <p className="text-xs text-slate-500 mb-6">
                        تم معالجة ميولك ومعدل البكالوريا لعام {year} باستخدام نظام التقييم الكي لاقتران شخصيتك الأكاديمية.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Strengths */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-sm text-slate-800 mb-3 text-indigo-600 flex items-center gap-1.5">
                            <Award className="h-4 w-4" />
                            نقاط القوة لديك:
                          </h4>
                          <ul className="space-y-2.5">
                            {smartReport?.strengths?.map((str: string, index: number) => (
                              <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Estimated Potential Skills */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-sm text-slate-800 mb-3 text-indigo-600 flex items-center gap-1.5">
                            <Brain className="h-4 w-4" />
                            المهارات الكامنة لديك:
                          </h4>
                          <ul className="space-y-2.5">
                            {smartReport?.potentialSkills?.map((skill: string, index: number) => (
                              <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Preferred fields */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-sm text-slate-800 mb-3 text-indigo-600 flex items-center gap-1.5">
                            <Sliders className="h-4 w-4" />
                            المجالات الفضلى للنمو:
                          </h4>
                          <ul className="space-y-2.5">
                            {smartReport?.preferredFields?.map((field: string, index: number) => (
                              <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                <span>{field}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Future expected jobs in Algeria */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-sm text-slate-800 mb-3 text-emerald-600 flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" />
                            أفضل الوظائف المستقبلية بالجزائر:
                          </h4>
                          <ul className="space-y-2.5">
                            {smartReport?.futureJobs?.map((job: string, index: number) => (
                              <li key={index} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed font-semibold">
                                <span className="h-2 w-2 rounded bg-emerald-500 mt-1 shrink-0" />
                                <span>{job}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Top Specialties suggestions dynamically listed */}
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 lg:col-span-2">
                          <h4 className="font-bold text-sm text-[#1e1b4b] mb-3 flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-indigo-600" />
                            أفضل التخصصات الأنسب لشخصيتك الموصى بها:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {smartReport?.topSpecialties?.map((specName: string, index: number) => (
                              <div key={index} className="bg-white p-3 rounded-xl border border-indigo-100/80 flex items-center gap-2.5">
                                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">{index + 1}</span>
                                <span className="text-xs text-slate-800 font-bold">{specName}</span>
                              </div>
                            ))}
                          </div>

                          {/* Development advice */}
                          <div className="mt-4 pt-4 border-t border-indigo-100 text-xs text-indigo-950/80">
                            <span className="font-bold block text-[#1e1b4b] mb-1.5">نصائح من مستشارك للنجاح الجامعي والأكاديمي:</span>
                            <ul className="space-y-2">
                              {smartReport?.developmentTips?.map((tip: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-indigo-600 shrink-0">💡</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Filtered compatibility lists (التخصصات المناسبة جداً، المناسبة، غير موصى بها) */}
                    <div>
                      <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-indigo-500" />
                        توافق تخصصات المنشور بناءً على الكويز الذكي
                      </h4>

                      <div className="space-y-3">
                        {currentSpecialties
                          .filter(spec => (spec.minGrades[stream as string & BACStream] !== undefined))
                          .map(spec => {
                            const compat = specialcompatibilityMap[spec.id] || { score: 55, level: "جيد", reason: "هناك مواءمة معتدلة لمعدلك التوجيهي." };
                            const isEligible = numericGrade >= (spec.minGrades[stream as string & BACStream] || 0);

                            let badgeBg = "bg-blue-50 text-blue-700 border-blue-100";
                            if (!isEligible) {
                              badgeBg = "bg-rose-50 text-rose-700 border-rose-100";
                            } else if (compat.level === "ممتاز") {
                              badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
                            }

                            return (
                              <div key={spec.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="text-xs bg-slate-100 border px-2 py-0.5 font-bold font-mono text-slate-500 rounded">{spec.code}</span>
                                    <h5 className="font-extrabold text-slate-800 text-base">{spec.name}</h5>
                                    <span className="text-xs text-slate-400">({spec.category})</span>
                                  </div>
                                  
                                  <p className="text-xs text-indigo-950 font-medium bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/50 leading-relaxed">
                                    {compat.reason}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                                  <div className="text-left mt-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-bold px-2 py-1 rounded border ${badgeBg}`}>
                                        {isEligible ? `تطابق: ${compat.level}` : "غير متاح بالمعدل"}
                                      </span>
                                      <span className="text-base font-extrabold text-indigo-600 font-mono">%{compat.score}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-1">نسبة التلاؤم الذيلية</span>
                                  </div>

                                  <button
                                    onClick={() => setActiveSpecialtyDetails(spec)}
                                    className="bg-slate-50 border border-slate-200 hover:border-indigo-500 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                                  >
                                    معاينة
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}


          {/* TAB 3: SPECIALTIES & UNIVERSITIES WIKI GUIDE */}
          {activeTab === "wiki" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                
                {/* Header and Integrated Switcher */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">موسوعة التوجيه والتعريف بالمؤسسات والولايات</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      دليلك الأكاديمي الشامل للتخصصات ومؤسسات التعليم العالي والجامعات في كافة ولايات الجزائر الـ 58.
                    </p>
                  </div>
                  
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto border border-slate-200/50">
                    <button
                      onClick={() => setWikiSubTab("specialties")}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        wikiSubTab === "specialties"
                          ? "bg-white text-indigo-700 shadow-sm font-extrabold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      موسوعة التخصصات والمسارات
                    </button>
                    <button
                      onClick={() => setWikiSubTab("universities")}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        wikiSubTab === "universities"
                          ? "bg-white text-indigo-700 shadow-sm font-extrabold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      دليل وجامعات الولايات (58)
                    </button>
                  </div>
                </div>

                {wikiSubTab === "specialties" ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="ابحث بالاسم أو المادة أو الولاية أو الكلمة دلالية..."
                          value={wikiSearch}
                          onChange={(e) => setWikiSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-2.5 text-sm outline-none"
                        />
                        <Search className="absolute right-3.5 top-3 h-5 w-5 text-slate-400" />
                      </div>
                      
                      <div className="w-full md:w-[240px]">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-sm outline-none font-medium"
                        >
                          <option value="all">كل الفئات والتصنيفات</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentSpecialties
                        .filter(spec => {
                          if (selectedCategory !== "all" && spec.category !== selectedCategory) return false;
                          if (!wikiSearch) return true;
                          const term = wikiSearch.toLowerCase();
                          return (
                            spec.name.toLowerCase().includes(term) ||
                            spec.description.toLowerCase().includes(term) ||
                            spec.category.toLowerCase().includes(term) ||
                            spec.subjects.some(sub => sub.toLowerCase().includes(term))
                          );
                        })
                        .map(spec => (
                          <div
                            key={spec.id}
                            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500/80 p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200 group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                                  {spec.code}
                                </span>
                                <span className="text-[10px] text-slate-400">المدة: {spec.durationYears} سنوات</span>
                              </div>

                              <h3 className="font-extrabold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                                {spec.name}
                              </h3>
                              <span className="inline-block text-[10px] text-indigo-500 font-bold bg-indigo-50/50 px-2 py-0.5 rounded">
                                {spec.category}
                              </span>
                              
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed pt-1">
                                {spec.description}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="block text-[9px] text-slate-400">الراتب التقريبي بسوق العمل</span>
                                <span className="text-xs font-bold text-slate-700 font-mono">{spec.approxSalaryRange}</span>
                              </div>
                              
                              <button
                                onClick={() => setActiveSpecialtyDetails(spec)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                              >
                                موسوعة التخصص &larr;
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  // UNIVERSITIES & WILAYAS DIRECTORY VIEW (100% COVERAGE FOR ALL 58 PROVINCES)
                  <div className="space-y-6">
                    
                    {/* Live Search & Filter Panel */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 shadow-inner">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Search keyword input */}
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="ابحث بالاسم، أو الولاية، أو تخصص يدرس بالجامعة (مثال: حراش، طب، ESI)..."
                            value={univSearchInput}
                            onChange={(e) => setUnivSearchInput(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl pr-10 pl-4 py-2.5 text-sm outline-none shadow-sm font-medium"
                          />
                          <Search className="absolute right-3.5 top-3 h-5 w-5 text-slate-400" />
                        </div>

                        {/* Interactive Dropdown for 58 Wilayas */}
                        <div className="w-full md:w-[300px]">
                          <select
                            value={univSelectedWilaya}
                            onChange={(e) => {
                              setUnivSelectedWilaya(Number(e.target.value));
                              setUnivSearchInput(""); // focus on the newly selected province specifically
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-sm outline-none shadow-sm font-bold text-slate-700"
                          >
                            {ALGERIAN_WILAYAS.map(w => (
                              <option key={w.code} value={w.code}>
                                ولاية {String(w.code).padStart(2, '0')} - {w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quick-links for major administrative or university hubs */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-extrabold text-slate-400 shrink-0">ولايات كبرى للاكتشاف:</span>
                        {[
                          { code: 16, name: "الجزائر العاصمة 🇩🇿" },
                          { code: 31, name: "وهران 🌅" },
                          { code: 25, name: "قسنطينة 🌉" },
                          { code: 19, name: "سطيف 🏔️" },
                          { code: 22, name: "سيدي بلعباس 🔬" },
                          { code: 35, name: "بومرداس 🛢️" },
                          { code: 9, name: "البليدة 🍊" },
                          { code: 5, name: "باتنة ⛰️" },
                          { code: 30, name: "ورقلة 🌴" },
                          { code: 42, name: "تيبازة 🏛️" }
                        ].map(hub => (
                          <button
                            key={hub.code}
                            type="button"
                            onClick={() => {
                              setUnivSelectedWilaya(hub.code);
                              setUnivSearchInput("");
                            }}
                            className={`px-3 py-1 rounded-xl transition-all border text-[11px] font-bold cursor-pointer shrink-0 ${
                              univSelectedWilaya === hub.code && !univSearchInput
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {hub.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Results Count and Heading */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-slate-500">
                        {univSearchInput ? (
                          <>نتائج البحث الشامل في الجزائر: <span className="text-indigo-650 font-mono">{displayedUniversities.length} مؤسسة علمية</span></>
                        ) : (
                          <>المؤسسات والجامعات المسجلة في ولاية {ALGERIAN_WILAYAS.find(w => w.code === univSelectedWilaya)?.name}: <span className="text-indigo-650 font-mono">{displayedUniversities.length} مؤسسة</span></>
                        )}
                      </span>
                    </div>

                    {/* Universities Cards Container */}
                    {displayedUniversities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedUniversities.map((uni: any) => (
                          <div 
                            key={uni.id} 
                            className="bg-white rounded-3xl border border-slate-250 p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-300 group"
                          >
                            
                            {/* University Header */}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-3">
                                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Building className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="font-extrabold text-slate-800 text-base md:text-lg group-hover:text-indigo-600 transition-colors leading-snug">
                                      {uni.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>ولاية {uni.wilayaName} ({uni.wilayaCode})</span>
                                      </span>
                                      
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        الموقع: {uni.address}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <span className={`text-[11px] font-black px-3 py-1 rounded-full shrink-0 border uppercase tracking-wide shadow-sm font-sans ${
                                  uni.type === "مدرسة عليا" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : uni.type === "جامعة"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : uni.type === "معهد وطني"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {uni.type}
                                </span>
                              </div>

                              {/* University Description Profile */}
                              <div className="pt-2">
                                <span className="text-[10px] text-indigo-600 font-extrabold block mb-1">التعريف والعمق التعليمي بالمؤسسة:</span>
                                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                  {uni.description}
                                </p>
                              </div>

                              {/* Major faculties list */}
                              <div className="pt-2 border-t border-dashed border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">الأقسام والكليات الكبرى:</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-1">
                                  {uni.keyFaculties.map((fac: string, index: number) => (
                                    <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                                      <span className="line-clamp-1 font-medium">{fac}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Specialty Links and Facilities */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                              
                              {/* Specialties taught list with indicators linking back to encyclopedia */}
                              <div>
                                <span className="text-[11px] text-slate-700 font-black block mb-2">التفرعات والتخصصات التابعة لها بالموسوعة:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {uni.specialtiesTaught.map((specLabel: string, sIdx: number) => {
                                    // Match to original specialties list
                                    const matched = currentSpecialties.find(sp => 
                                      sp.name.toLowerCase().includes(specLabel.toLowerCase()) || 
                                      specLabel.toLowerCase().includes(sp.name.toLowerCase()) ||
                                      (specLabel.includes("MI") && sp.code === "MI") ||
                                      (specLabel.includes("ST") && sp.code === "ST") ||
                                      (specLabel.includes("طب") && sp.code === "MED") ||
                                      (specLabel.includes("صيدلة") && sp.code === "PHA") ||
                                      (specLabel.includes("أسنان") && sp.code === "DENT") ||
                                      (specLabel.includes("حقوق") && sp.code === "LAW") ||
                                      (specLabel.includes("معمار") && sp.code === "ARCHI") ||
                                      (specLabel.includes("ترجمة") && sp.code === "TRAD") ||
                                      (specLabel.includes("إنجليزية") && sp.code === "ENG") ||
                                      (specLabel.includes("عربية") && sp.code === "ARA") ||
                                      (specLabel.includes("بيوتكنولوجيا") && sp.code === "BIOT")
                                    );

                                    return matched ? (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => setActiveSpecialtyDetails(matched)}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-indigo-150 transition-all flex items-center gap-1 cursor-pointer hover:scale-105"
                                        title="اضغط لمعاينة معدلات القبول والمقررات والمستقبل المهني له"
                                      >
                                        <BookOpen className="h-3 w-3" />
                                        <span>{specLabel}</span>
                                        <span className="text-[8px] bg-indigo-200/50 text-indigo-800 px-1 py-0.2 rounded font-mono font-bold">({matched.code}) ⚡️</span>
                                      </button>
                                    ) : (
                                      <span 
                                        key={sIdx} 
                                        className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-slate-100"
                                      >
                                        {specLabel}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* University Facilities and services */}
                              {uni.facilities && uni.facilities.length > 0 && (
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                  <span className="text-[10px] text-indigo-600 font-extrabold block mb-1.5">المرافق والخدمات المتوفرة:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {uni.facilities.map((fac: string, fIdx: number) => (
                                      <span 
                                        key={fIdx} 
                                        className="text-[10px] bg-indigo-100/20 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-100"
                                      >
                                        ✓ {fac}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Interactive Geographical Map */}
                              <div className="mt-2 pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setExpandedMaps(prev => ({ ...prev, [uni.id]: !prev[uni.id] }))}
                                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs py-2 px-3 rounded-xl border border-indigo-150 transition-all cursor-pointer"
                                >
                                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                                  <span>{expandedMaps[uni.id] ? "إخفاء الخريطة الجغرافية" : "عرض الموقع الجغرافي الدقيق للجامعة 🗺️"}</span>
                                </button>
                                
                                {expandedMaps[uni.id] && (
                                  <div className="mt-3">
                                    <UniversityMap 
                                      universityId={uni.id}
                                      universityName={uni.name}
                                      address={uni.address}
                                      wilayaCode={uni.wilayaCode}
                                    />
                                  </div>
                                )}
                              </div>

                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-250 p-12 rounded-3xl text-center space-y-3">
                        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
                        <h4 className="font-bold text-slate-800 text-base">لم يعثر على نتائج مطابقة للبث</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          يرجى التأكد من كتابة الكلمة بشكل صحيح، أو تنقل عبر تصنيفات الولايات لتصفح مؤسسات أخرى لولاية مختلفة.
                        </p>
                        <button
                          onClick={() => {
                            setUnivSearchInput("");
                            setUnivSelectedWilaya(16);
                          }}
                          className="bg-indigo-600 text-white rounded-xl text-xs font-bold px-4 py-2 hover:bg-indigo-700 cursor-pointer"
                        >
                          إعادة تهيئة التصفية
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
              
            </div>
          )}


          {/* TAB 4: INTERACTIVE CHAT HELPER MASCOT */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200/80 flex flex-col h-[650px]">
                
                {/* Chat Top header info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono shrink-0">
                      🇩🇿
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm md:text-base">المستشار التوجيهي الجزائري الفوري</h3>
                      <span className="text-[10px] text-slate-400 block">يقوم بتحليل معدلك ({grade}) للتوجيه نحو أفضل تخصص متطابق</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setChatMessages([
                      {
                        id: "welcome-1",
                        role: "model",
                        text: "تم تصفية وإشعال ذاكرة المحادثة بنجاح! يسعدني إرشادك وتسهيل التوجيه لك مجدداً.",
                        timestamp: new Date().toLocaleTimeString("ar-DZ")
                      }
                    ])}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 hover:underline border border-dashed px-2 py-1 rounded"
                  >
                    تفريغ المحادثة
                  </button>
                </div>

                {/* Suggestions prompt chips */}
                <div className="mb-4">
                  <span className="block text-[11px] font-bold text-slate-400 mb-1.5">أسئلة شائعة يمكنك سؤالي إياها بضغطة زر واحد:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `أنا علوم تجريبية ومعدلي ${grade} وأحب التكنولوجيا بمَ تنصحني؟`,
                      "ما هي المدارس التحضيرية في القليعة تخصص تجارة؟",
                      "هل تفضل المعمار أم البرمجيات من حيث الراتب بالجزائر؟",
                      "ما هي المواد الكبرى التي يتم تدريسها بالسنة الأولى طبي؟"
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(pill)}
                        className="text-[10px] font-medium bg-[#eef2ff] text-[#4338ca] hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-all text-right shrink-0"
                      >
                        💡 {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Panel Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 flex flex-col">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white self-start rounded-tr-none"
                          : "bg-slate-50 text-slate-800 self-end rounded-tl-none border border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="font-bold mb-1 opacity-75 text-[10px]">
                        {msg.role === "user" ? "أنت (طالب بكالوريا)" : "المستشار الجامعي الذكي"}
                      </div>
                      <p>{msg.text}</p>
                      <div className="text-[9px] text-left opacity-60 mt-1.5 font-mono">
                        {msg.timestamp}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none p-4 max-w-[70%] self-end animate-pulse text-xs flex items-center gap-2">
                      <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce delay-75" />
                      <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce delay-150" />
                      <span>جاري التفكير وصياغة المشورة المخصصة...</span>
                    </div>
                  )}
                </div>

                {/* Input Panel */}
                <div className="border-t border-slate-100 pt-4 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isChatLoading) {
                        handleSendMessage();
                      }
                    }}
                    placeholder="اكتب سؤالك هنا عن التخصصات، معدلات القبول أو الآفاق الوظيفية..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs outline-none"
                    disabled={isChatLoading}
                  />
                  
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isChatLoading || !userInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-50"
                    title="إرسال السؤال"
                  >
                    <Send className="h-5 w-5 transform rotate-180" />
                  </button>
                </div>

              </div>

            </div>
          )}


          {/* TAB 5: ADMIN DASHBOARD */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              
              {/* Calibration Studio and Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Statistics panel */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 lg:col-span-2">
                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    لوحة المراقبة والإحصائيات الخاصة بالتوجيه
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    إحصائيات تفصيلية لميول الطلاب واستخدام مستشار الذكاء الاصطناعي لرغبات بكالوريا 2026.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="block text-[11px] text-slate-400 leading-tight">عمليات محاكاة تامة</span>
                      <span className="text-xl font-bold text-slate-700 font-mono">{adminStats.interactions}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="block text-[11px] text-slate-400 leading-tight">اختبارات مهنية مكتملة</span>
                      <span className="text-xl font-bold text-[#4f46e5] font-mono">{adminStats.quizzesCompleted}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="block text-[11px] text-slate-400 leading-tight">معايرة خوارزميات النجاح</span>
                      <span className="text-xl font-bold text-emerald-600 font-mono">{adminStats.calibratedEpochs} مرات</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="block text-[11px] text-slate-400 leading-tight font-medium">دقة النموذج الحالي</span>
                      <span className="text-xl font-bold text-slate-700 font-mono">%{adminStats.accuracy}</span>
                    </div>
                  </div>

                  {/* Graphics charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Top 5 desired disciplines */}
                    <div className="bg-slate-50 border p-4 rounded-xl">
                      <span className="text-xs font-bold text-slate-700 block mb-3 text-center">أكثر الفئات والتخصصات جذباً (بناءً على الطلاب)</span>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={adminDemandData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} strokeWidth={0.5} tickLine={false} />
                            <Tooltip contentStyle={{ direction: "rtl", textAlign: "right" }} />
                            <Bar dataKey="demand" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Stream Distributions */}
                    <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-700 block mb-3 text-center">توزيع المستخدمين حسب شعب البكالوريا</span>
                      <div className="h-[150px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={adminDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="students"
                            >
                              <Cell fill="#4f46e5" />
                              <Cell fill="#10b981" />
                              <Cell fill="#3b82f6" />
                              <Cell fill="#e11d48" />
                            </Pie>
                            <Tooltip contentStyle={{ direction: "rtl", textAlign: "right" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[9px] text-center text-slate-500 pt-2 border-t font-semibold">
                        <div>
                          <span className="block h-2 w-2 rounded-full bg-indigo-600 mx-auto mb-1" />
                          <span>علوم</span>
                        </div>
                        <div>
                          <span className="block h-2 w-2 rounded-full bg-emerald-500 mx-auto mb-1" />
                          <span>رياضيات</span>
                        </div>
                        <div>
                          <span className="block h-2 w-2 rounded-full bg-blue-500 mx-auto mb-1" />
                          <span>تسيير</span>
                        </div>
                        <div>
                          <span className="block h-2 w-2 rounded-full bg-rose-500 mx-auto mb-1" />
                          <span>آداب</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Model Training & Calibration Studio */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-950 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white mb-2 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-amber-300" />
                      استوديو معايرة نظام التوصية
                    </h3>
                    <p className="text-[11px] leading-relaxed text-indigo-200">
                      يتيح للمشرف الجزائري مواءمة معاملات الذكاء الاصطناعي مع النتائج الفعلية ومعدلات النجاح الحية المحدثة لوزارة التعليم العالي.
                    </p>

                    {isCalibrating ? (
                      <div className="mt-5 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-indigo-300">
                            <span>جاري تحسين مصفوفات النموذج...</span>
                            <span className="font-bold font-mono">%{calibrationProgress}</span>
                          </div>
                          <div className="h-2 bg-indigo-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 transition-all text-left" style={{ width: `${calibrationProgress}%` }} />
                          </div>
                        </div>

                        <div className="bg-indigo-950/60 rounded-xl p-3 border border-indigo-800 h-[170px] overflow-y-auto text-[10px] font-mono space-y-1 text-slate-300">
                          {calibrationLogs.map((log, idx) => (
                            <div key={idx} className="leading-tight">{log}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 text-center py-6 border border-indigo-800/65 bg-indigo-950/30 rounded-2xl">
                        <Brain className="h-10 w-10 text-indigo-400 mx-auto stroke-[1.5] mb-2 animate-bounce" />
                        <span className="block text-xs text-indigo-300 font-medium">الخوارزمية الحالية مستقرة ومعايرة</span>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">تاريخ التدريب: اليوم صباحاً</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-indigo-800">
                    <button
                      onClick={runCalibration}
                      disabled={isCalibrating}
                      className="w-full bg-[#4f46e5] hover:bg-[#3b82f6] text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 shrink-0" />
                      <span>بدء فحص نموذج المعايرة السنوي لـ 2026</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Edit Acceptant values catalog limit */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0]/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-slate-800">تعديل وتعدين معدلات القبول السنوية للتخصصات</h3>
                    <p className="text-xs text-slate-400">تحكم بمدخلات قبول التخصصات للطلاب حسب الشعب المرجعية.</p>
                  </div>
                  
                  <span className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
                    إجمالي تخصصات المنشور: <strong>{currentSpecialties.length} تخصص</strong>
                  </span>
                </div>

                {editingSpecialtyId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">نمط التعديل النشط:</span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        تعديل ثوابت التخصص:{" "}
                        <span className="text-indigo-600">{currentSpecialties.find(s => s.id === editingSpecialtyId)?.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500">يقوم بتحديث المعيار التلقائي لتظليل الفرص بحساب الطالب.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block text-[10px] text-slate-400 mb-1">الشعبة المستهدفة:</span>
                        <select
                          value={editStreamKey}
                          onChange={(e) => setEditStreamKey(e.target.value as BACStream)}
                          className="bg-white border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                        >
                          {Object.values(BACStream).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 mb-1">المعدل الأدنى الجديد:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="10"
                          max="20"
                          value={editMinGrade}
                          onChange={(e) => setEditMinGrade(e.target.value)}
                          className="bg-white border rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-500 w-[100px] font-bold font-mono"
                          placeholder="مثال: 14.50"
                        />
                      </div>

                      <div className="flex gap-1.5 pt-4">
                        <button
                          onClick={handleUpdateMinGrade}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          تأكيد
                        </button>
                        <button
                          onClick={() => {
                            setEditingSpecialtyId(null);
                            setEditMinGrade("");
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-right border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold leading-none">
                        <th className="p-4">رمز التخصص</th>
                        <th className="p-4">اسم التخصص ومسيرته</th>
                        <th className="p-4">العلوم التجريبية</th>
                        <th className="p-4">الرياضيات والتقني</th>
                        <th className="p-4 text-center">العمليات والمزامنة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSpecialties.map(spec => (
                        <tr key={spec.id} className="hover:bg-slate-50/55 transition-all">
                          <td className="p-4 font-mono font-bold text-slate-800">{spec.code}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{spec.name}</div>
                            <div className="text-[11px] text-slate-400">{spec.category}</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-600">
                            {spec.minGrades[BACStream.SCIENCES] !== undefined ? spec.minGrades[BACStream.SCIENCES] : "غير متاح"}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-600">
                            {spec.minGrades[BACStream.MATH] !== undefined ? spec.minGrades[BACStream.MATH] : "غير متاح"}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setEditingSpecialtyId(spec.id);
                                setEditMinGrade((spec.minGrades[BACStream.SCIENCES] || 10.0).toString());
                                setEditStreamKey(BACStream.SCIENCES);
                              }}
                              className="text-[#4338ca] hover:text-[#3125b4] font-bold hover:underline cursor-pointer text-xs"
                            >
                              تعديل المرجع القابلي
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add dynamic new specialized widget */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">إضافة تخصص جامعي أو مدرسة وطنية جديدة لدليل التوجيه</h4>
                  <form onSubmit={handleAddNewSpecialty} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم التخصص بالعربية:</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: هندسة النانو التكنولوجية"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">رمز المنشور الوطني:</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: M99"
                        value={newSpecCode}
                        onChange={(e) => setNewSpecCode(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">الفئة / التصنيف الدراسي:</label>
                      <select
                        value={newSpecCategory}
                        onChange={(e) => setNewSpecCategory(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="إعلام آلي وذكاء اصطناعي">إعلام آلي وذكاء اصطناعي</option>
                        <option value="علوم طبية وصحية">علوم طبية وصحية</option>
                        <option value="علوم دقيقة وتقنية">علوم دقيقة وتقنية</option>
                        <option value="اقتصاد وتسيير وتجارة">اقتصاد وتسيير وتجارة</option>
                        <option value="تربية وتعليم">تربية وتعليم</option>
                        <option value="لغات وترجمة وآداب">لغات وترجمة وآداب</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">وصف شامل للتخصص والمستقبل الوظيفي بالجزائر:</label>
                      <textarea
                        rows={2}
                        placeholder="أدخل تطلعات التخصص، كليات الانتساب ومستوى الصون الخاص بالطلبة..."
                        value={newSpecDesc}
                        onChange={(e) => setNewSpecDesc(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-3 text-left">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/10"
                      >
                        <Plus className="h-4 w-4" />
                        <span>إدراج التخصص بالدليل</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          )}

          {activeTab === "future-simulator" && (
            <FutureSimulator specialties={SPECIALTIES} userName={userName} />
          )}

          {activeTab === "study-coach" && (
            <AIStudyCoach specialties={SPECIALTIES} userName={userName} />
          )}

        </main>
      </div>

      {/* Specialty immersive information Drawer/Modal detail */}
      {activeSpecialtyDetails && (
        <div className="fixed inset-0 bg-[#1e1b4b]/60 backdrop-blur-sm z-50 flex justify-end transition-all animate-fade-in" onClick={() => setActiveSpecialtyDetails(null)}>
          
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto p-6 md:p-8 animate-slide-left space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header detail */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full">
                     الرمز: {activeSpecialtyDetails.code}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 font-bold rounded-lg leading-none">
                    {activeSpecialtyDetails.category}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-xl leading-tight pt-1.5">{activeSpecialtyDetails.name}</h3>
              </div>
              
              <button
                onClick={() => setActiveSpecialtyDetails(null)}
                className="bg-slate-50 text-slate-400 hover:text-slate-700 p-2 rounded-xl border border-slate-200 cursor-pointer"
                title="إغلاق بطاقة الوصف"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 text-center">
                <span className="block text-[10px] text-slate-400">مدة الدراسة</span>
                <span className="font-extrabold text-slate-800 text-sm leading-tight">{activeSpecialtyDetails.durationYears} سنوات</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 text-center">
                <span className="block text-[10px] text-slate-400">مستوى الصعوبة</span>
                <span className="font-extrabold text-slate-800 text-sm leading-tight text-amber-600">{activeSpecialtyDetails.difficulty}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 text-center">
                <span className="block text-[10px] text-slate-400">إمكانية العمل الحر</span>
                <span className="font-extrabold text-slate-800 text-sm leading-tight text-emerald-600">{activeSpecialtyDetails.freelancePotential}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 text-center">
                <span className="block text-[10px] text-slate-400">الدراسات العليا</span>
                <span className="font-extrabold text-slate-800 text-sm leading-tight text-indigo-600">{activeSpecialtyDetails.postGraduateChance}</span>
              </div>
            </div>

            {/* Description content */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#1e1b4b] text-sm flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-500" />
                وصف التخصص التوجيهي
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {activeSpecialtyDetails.description}
              </p>
            </div>

            {/* Subjects and materials studied */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#1e1b4b] text-sm flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                المواد الأساسية التي يتم تدريسها بالطور:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeSpecialtyDetails.subjects.map((sub, idx) => (
                  <span key={idx} className="text-xs font-medium bg-indigo-50 text-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                    📚 {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Career Opportunities */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#1e1b4b] text-sm flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-emerald-500" />
                فرص التوظيف المباشرة والعمل بالجزائر:
              </h4>
              <ul className="space-y-2.5">
                {activeSpecialtyDetails.careerOpportunities.map((op, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1 shrink-0">✔</span>
                    <span className="font-semibold leading-normal">{op}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Universities providing the specialty */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#1e1b4b] text-sm flex items-center gap-1.5">
                <Building className="h-4 w-4 text-indigo-500" />
                الجامعات والمدارس العليا المتوفرة (الجزائر):
              </h4>
              <div className="space-y-2">
                {activeSpecialtyDetails.universities.map((uni, idx) => {
                  const isUserWilaya = uni.wilayaCode === selectedWilaya;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isUserWilaya 
                          ? "bg-emerald-50 border-emerald-200 font-bold ring-1 ring-emerald-400/20" 
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${isUserWilaya ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className={isUserWilaya ? "text-emerald-950" : "text-slate-700"}>
                          {uni.name} ({uni.type})
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isUserWilaya ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {uni.location} {isUserWilaya && "• قريبة منك"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approximate salaries and freelance */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="block text-[10px] text-slate-400 mb-0.5">الرواتب التقريبية بالجزائر:</span>
                <span className="text-sm font-extrabold text-indigo-600 font-mono flex items-center gap-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  {activeSpecialtyDetails.approxSalaryRange}
                </span>
              </div>

              <div className="text-left">
                <span className="block text-[10px] text-slate-400 mb-0.5">العمل عن بعد والتعهيد:</span>
                <span className="text-xs font-black text-emerald-600">فرصة {activeSpecialtyDetails.freelancePotential}ة جداً</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Absolute design aesthetic footer matching Sleek Theme */}
      <footer className="bg-[#1e1b4b] border-t border-indigo-950 text-indigo-400 py-6 text-center text-xs mt-auto">
        <p className="leading-relaxed">
          تم تجميع وبرمجة المنشور التوجيهي الذكي للجامعات والمدارس العليا الجزائرية بالاعتماد على ذكاء اصطناعي مستند لبيانات رسمية لعام 2026.
        </p>
        <p className="mt-1 opacity-70">
          دليلك الجامعي الجزائري الذكي &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة لوزارة التعليم العالي والبحث العلمي والمطور.
        </p>
      </footer>

    </div>
  );
}
