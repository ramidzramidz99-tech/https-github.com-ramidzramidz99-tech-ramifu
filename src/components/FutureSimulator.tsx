/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Coins,
  Briefcase,
  Layers,
  ArrowRight,
  Send,
  Loader2,
  Building,
  HelpCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowLeftRight
} from "lucide-react";
import { Specialty } from "../types";

interface FutureSimulatorProps {
  specialties: Specialty[];
  userName: string;
}

export default function FutureSimulator({ specialties, userName }: FutureSimulatorProps) {
  // Inputs
  const [selectedSpecId, setSelectedSpecId] = useState<string>(specialties[0]?.id || "esi");
  const [typedUniversity, setTypedUniversity] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ماستر (Master)");
  const [selectedCountry, setSelectedCountry] = useState<string>("الجزائر");

  // Output State
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Interactive UI Stages
  const [activeRoadmapStage, setActiveRoadmapStage] = useState<string>("بكالوريا");
  const [activeCareerNodeIdx, setActiveCareerNodeIdx] = useState<number>(2); // Default to junior employee

  // Assistant chatbot inside simulator
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "sim-welcome",
      role: "model",
      text: "أنا رفيقك ومستشارك المهني هنا. عند تشغيل المحاكاة، يمكنك سؤالي عن الآفاق الوظيفية، تفاصيل التخصص، الرواتب، أو نصائح سوق العمل المباشرة لهذه الخيارات!",
      timestamp: new Date().toLocaleTimeString("ar-DZ")
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of bot chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Loading steps animation
  const loadingPhrases = [
    "جاري قراءة المنشور الوزاري لوزارة التعليم العالي الحالي...",
    "جاري فك بنية التخصص الأكاديمي وتحديد مقررات السنوات المقررة...",
    "جاري استقراء اتجاهات التوظيف بالجزائر وخارجها مستندين للذكاء الاصطناعي التنبؤي...",
    "جاري معالجة مستويات الدخل، سلم الأجور الوطنية والعقود الدولية...",
    "جاري ضبط المخطط التفاعلي المستقبلي لشجرتك المهنية والأكاديمية..."
  ];

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingPhrases.length - 1) {
            return 0; // Loop or stay at last
          }
          return prev + 1;
        });
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleSimulate = async () => {
    setLoading(true);
    setSimulationData(null);
    setErrorReason(null);
    try {
      const response = await fetch("/api/future-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialtyId: selectedSpecId,
          universityName: typedUniversity,
          academicLevel: selectedLevel,
          targetCountry: selectedCountry
        })
      });

      if (!response.ok) {
        throw new Error("Failed to receive simulation data");
      }

      const data = await response.json();
      setSimulationData(data);
      // Automatically reset some UI states inside simulation
      setActiveRoadmapStage("اختيار التخصص");
      setActiveCareerNodeIdx(2); // junior employee
      
      // Update chatbot welcomed message specifically for the new simulation
      setChatMessages([
        {
          id: `sim-welcome-${Date.now()}`,
          role: "model",
          text: `تم تحميل محاكاة مسار **${data.specialtyName}** بنجاح! \n\nلقد قمت ببرمجة دليلك المهني والأكاديمي والدخل لبلد **${data.targetCountry}**. يمكنك الآن التفاعل معي، مثل طرح أسئلة كـ: \n- "ما هي فرص الترقية من موظف مبتدئ إلى موظف محترف؟"\n- "هل يتطلب هذا التخصص السفر بكثافة؟"\n- "كيف يمكنني تجهيز نفسي للسوق الدولية؟"`,
          timestamp: new Date().toLocaleTimeString("ar-DZ")
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorReason("لم نتمكن من الاتصال بخادوم المحاكاة حاليًا. الرجاء التحقق من جودة الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput("");
    
    const userMsg = {
      id: `chat-usr-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("ar-DZ")
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const specText = simulationData ? `التخصص الحالي للمحاكاة: ${simulationData.specialtyName}، الجامعة: ${simulationData.universityName}، درجة الدراسة: ${simulationData.academicLevel}، دولة المستقبل المهني: ${simulationData.targetCountry}. ` : `التخصص: ${specialties.find(s => s.id === selectedSpecId)?.name}. `;
      const payloadMessages = [
        { role: "user", text: `${specText} سؤال الطالب للتوجيه والمستقبل هو: ${userText}` }
      ];

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          grade: "14", // context grade
          stream: "علوم تجريبية",
          wilaya: "الجزائر"
        })
      });

      if (!response.ok) throw new Error("Bot error");

      const botMsg = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `chat-bot-${Date.now()}`,
          role: "model",
          text: botMsg.text,
          timestamp: new Date().toLocaleTimeString("ar-DZ")
        }
      ]);

    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `chat-bot-err-${Date.now()}`,
          role: "model",
          text: "أعتذر منك، واجهت عطلاً مؤقتاً في معالجة طلبك بذكاء. يرجى تكراره مجددًا.",
          timestamp: new Date().toLocaleTimeString("ar-DZ")
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl translate-x-16 translate-y-16" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/30">
            <Sparkles className="h-4 w-4 animate-pulse text-indigo-300" />
            <span>المرشد التفاعلي الرائد لآفاق سوق العمل وبكالوريا 2026</span>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
            حاكي المستقبل 🚀 التوجيه القائم على عوائد سوق العمل والمسار المهني
          </h1>
          <p className="text-slate-200 leading-relaxed text-sm md:text-base max-w-3xl">
            أهلاً بك يا <span className="font-extrabold text-indigo-300 underline underline-offset-4">{userName}</span>! لا تختر تخصصك الجامعي بناء على اسمه فقط أو لمجرد إلقاء نظرة على معدل القبول المرجعي للعام الماضي. هذا القسم الحصري يستنير بالذكاء الاصطناعي والتحليلات العميقة ليرسم لك خارطة طريق بصرية تفاعلية تبدأ من أول يوم دراسي، وتصل بك لأعتاب سوق العمل والرواتب والمستقبل القيادي الفعلي.
          </p>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <span>قم بتهيئة سيناريو التوجيه المستقبلي الخاص بك</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Specialty Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500">التخصص الجامعي المقترح:</label>
            <select
              value={selectedSpecId}
              onChange={(e) => setSelectedSpecId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all"
            >
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} ({spec.code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. University selection or custom typing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500">الجامعة المرجوة (اختياري):</label>
            <input
              type="text"
              placeholder="مثال: جامعة هواري بومدين USTHB، المدرسة العليا للإعلام ESI"
              value={typedUniversity}
              onChange={(e) => setTypedUniversity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 3. Expected Target Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500">الشهادة / المستوى الأكاديمي المستهدف:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all"
            >
              <option value="ليسانس (Bachelor/Licence)">ليسانس (بكالوريوس - 3 سنوات)</option>
              <option value="ماستر (Master)">ماستر / مهندسة دولة (5 سنوات)</option>
              <option value="دكتوراه (PhD/Doctorate)">دكتوراه (ألمع مسار بحثي وأكاديمي)</option>
            </select>
          </div>

          {/* 4. Country of Professional Activity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500">الدولة المرجوة للنشاط المهني مستقبلاً:</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all"
            >
              <option value="الجزائر">الجزائر 🇩🇿 (الاستثمار الوطني وسوق العمل المحلي)</option>
              <option value="الخليج العربي (الإمارات/قطر)">الخليج العربي 🇦🇪 🇶🇦 (بيئة مالية وتوسعية قياسية)</option>
              <option value="فرنسا وكندا">كندا وأوروبا 🇨🇦 🇫🇷 (التفوق الدولي والأبحاث المشتركة)</option>
              <option value="الولايات المتحدة وألمانيا">الولايات المتحدة وألمانيا 🇺🇸 🇩🇪 (أعلى تكنولوجيات وشركات قارية)</option>
            </select>
          </div>
        </div>

        {/* Trigger Section */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-slate-400 max-w-xl">
             النظام يستعين ببيانات خريجي التخصص بالتوظيف والذكاء الاصطناعي لمحاكاة الأثر. يستغرق التوليد ثوانٍ معدودة.
          </p>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-extrabold text-xs transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>جاري معالجة المستقبل ومعدلات التوظيف الاستقراء الاستراتيجي...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 text-white fill-white" />
                <span>ابدأ محاكاة المستقبل وتصميم المسار المهني الآن ⚡️</span>
              </>
            )}
          </button>
        </div>

        {errorReason && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold p-3 rounded-xl mt-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-rose-500 rotate-180" />
            <span>{errorReason}</span>
          </div>
        )}
      </div>

      {/* LOADING SCREEN CONTAINER */}
      {loading && (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">جاري تحضير المحاكاة التفاعلية...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {loadingPhrases[loadingStep]}
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${((loadingStep + 1) / loadingPhrases.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* SIMULATED RESULTS DASHBOARD */}
      {simulationData && !loading && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header Summary Stats Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-3 py-1 rounded-full uppercase">
                ملخص سيناريو المحاكاة المبرمج
              </span>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {simulationData.specialtyName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-indigo-500" />
                  <span>المؤسسة: <strong className="text-slate-700">{simulationData.universityName}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                  <span>المستوى: <strong className="text-slate-700">{simulationData.academicLevel}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <span>دولة العمل: <strong className="text-slate-700">{simulationData.targetCountry}</strong></span>
                </span>
              </div>
            </div>

            {/* AI Probability Indicator */}
            <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-95">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#4f46e5" strokeWidth="6" 
                    strokeDasharray={`${2 * Math.PI * 28}`} 
                    strokeDashoffset={`${((100 - 94) / 100) * (2 * Math.PI * 28)}`}
                  />
                </svg>
                <span className="absolute text-sm font-black text-indigo-600 font-mono">94%</span>
              </div>
              <div>
                <dt className="text-[10px] text-slate-400 font-bold">نسبة النجاح المتوقعة</dt>
                <dd className="text-xs font-black text-slate-700">تقاطع عالي مع سوق الشغل</dd>
                <dd className="text-[9px] text-emerald-600 font-semibold mt-0.5">فرص متميزة ومأمونة ✓</dd>
              </div>
            </div>
          </div>

          {/* Interactive Future Roadmap Hub (Visualizing bac -> study -> job -> expert -> company) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <span>الخريطة التفاعلية للمستقبل والشجرة الأكاديمية المهنية</span>
              </h3>
              <p className="text-slate-500 text-xs">
                تنقل عبر شجرة تطور مسارك بالضغط على أي مرحلة من المراحل لرؤية مخرجاتها ونصائح المحاكاة الذكية المرافقة لها.
              </p>
            </div>

            {/* Tree nodes layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-3">
              {[
                { label: "بكالوريا 2026", desc: "بوابة الانطلاق الأكاديمية", icon: GraduationCap },
                { label: "اختيار التخصص", desc: "التوجيه الذكي الموحد", icon: Layers },
                { label: "السنة الأولى ليسانس", desc: "بناء الرصيد العلمي الأساسي", icon: BookOpen },
                { label: "السنتين التاليتين ماستر", desc: "التعمق والتطبيق الميداني", icon: Building },
                { label: "الوظيفة الأولى", desc: "طرق كسب الخبرة والابتداء والجهد", icon: Briefcase },
                { label: "الخبرة المتقدمة / خبير", desc: "أعلى تدرج مع تراخيص دولية", icon: Award },
                { label: "القيادة / مدير", desc: "إستراتيجيات قيادة المشاريع والناس", icon: ShieldCheck },
                { label: "صاحب مشروع ريادي", desc: "الاستقلال المالي التام والابتكار", icon: Coins }
              ].map((stage, sIdx) => {
                const isSelected = activeRoadmapStage === stage.label;
                const StageIcon = stage.icon;
                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setActiveRoadmapStage(stage.label)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all h-full justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                        : "bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-2 ${isSelected ? "bg-indigo-500 text-white" : "bg-white text-indigo-600 border border-slate-100 shadow-inner"}`}>
                      <StageIcon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black leading-tight">{stage.label}</h4>
                      <p className={`text-[9px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {stage.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Display active tree stage context */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded border border-indigo-100">
                  تفاصيل المرحلة المحددة: {activeRoadmapStage}
                </span>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed text-justify max-w-3xl">
                  {activeRoadmapStage === "بكالوريا 2026" && "تعد مرحلة الحصول على شهادة البكالوريا الرصيد الأول المتاح والأساس لبناء مستقبلك. في هذا السيناريو، مخرجاتك مبنية على اختيار واعد ينقلك إلى البوابة المهنية المرموقة."}
                  {activeRoadmapStage === "اختيار التخصص" && `اختيار تخصص ${simulationData.specialtyName} يوفر التوازن المثالي بين ميولك الأكاديمي والاهتمامات وسوق المتطلبات الحية، بفرص استمرار دراسي متفوق.`}
                  {activeRoadmapStage === "السنة الأولى ليسانس" && `تتلقى في هذه المرحلة المواد والمقررات التوجيهية للفرع في جامعة ${simulationData.universityName}. التركيز ينصب على فهم الأساسيات والتأقلم الصارم مع وتيرة الجامعة.`}
                  {activeRoadmapStage === "السنتين التاليتين ماستر" && `فترة التعمق الكبرى بمناهج تخصص ${simulationData.specialtyName} وحيازة مهارات العمل الميداني وتربص في الميدان لتجسيد المعارف.`}
                  {activeRoadmapStage === "الوظيفة الأولى" && `خطوتك الأولى بسوق عمل ${simulationData.targetCountry} كمساعد فني أو مطور أو ممارس مبتدئ لتفعيل ملف المهام وكسب الخبرة.`}
                  {activeRoadmapStage === "الخبرة المتقدمة / خبير" && "الانتقال لقراءة البنى الكبرى وحل المشكلات والتنبؤ بأنماط المؤسسة بالشهادات الاحترافية المعترف بها دولياً."}
                  {activeRoadmapStage === "القيادة / مدير" && "فهم الإدارة المالية، وتنسيق الأقسام الإعلانية والإنتاجية، وصناعة السياسات الكبرى للمؤسسة."}
                  {activeRoadmapStage === "صاحب مشروع ريادي" && "تجسيد شركة ناشئة خاصة أو مركز استشاري يوظف خيرة خريجي التخصص ويأخذ بعملك نحو الريادة والسيادة المالية."}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">معرفة مسبقة ومثبتة ✓</span>
            </div>
          </div>

          {/* Academic Path & Subjects (المسار الدراسي) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* First Year Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-indigo-650 font-black text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>سنتك الجامعية الأولى الجامعية</span>
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                    البداية والدعائم
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Difficulty element */}
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-xs text-slate-500 font-medium">مستوى صعوبة التأقلم الأولي:</span>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {simulationData.academicPath.firstYear.difficulty}
                    </span>
                  </div>

                  {/* Subjects list */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-extrabold block">المواد الأساسية المقررة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {simulationData.academicPath.firstYear.subjects.map((sub: string, index: number) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/50 font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acquired Skills */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="text-[11px] text-indigo-600 font-extrabold block">المهارات والملكات المكتسبة بالسنة الأولى:</span>
                    <ul className="space-y-1">
                      {simulationData.academicPath.firstYear.skills.map((skill: string, index: number) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
              <span className="text-[10px] text-slate-400">معدل انتقال مرجعي آمن: 20/12</span>
            </div>

            {/* Subsequent Years Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-indigo-650 font-black text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>السنوات اللاحقة ومحطات التعمق</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                    تخصص واختيار
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Subspecials list */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-extrabold block">التفرعات والتخصصات الفرعية الممكنة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {simulationData.academicPath.subsequentYears.subSpecialties.map((sub: string, index: number) => (
                        <span key={index} className="text-xs bg-emerald-50/50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-bold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Study Projects */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="text-[11px] text-slate-400 font-extrabold block">المشاريع الدراسية المحددة بالمنظومة:</span>
                    <ul className="space-y-1">
                      {simulationData.academicPath.subsequentYears.projects.map((proj: string, index: number) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                          <span>{proj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Training/internships opportunities */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="text-[11px] text-indigo-600 font-extrabold block">فرص وعقود التدريب والتمثيل المقترحة:</span>
                    <ul className="space-y-1">
                      {simulationData.academicPath.subsequentYears.internships.map((intern: string, index: number) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">✓</span>
                          <span>{intern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">إشراف أكاديمي معتد بمؤسستنا</span>
            </div>

            {/* Post graduation & certificates */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-indigo-650 font-black text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>عقب التخرج والحواز المهني العالمي</span>
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">
                    ترصيع الكفاءة
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Degrees */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-extrabold block">الشهادات الصادرة والمصادق عليها:</span>
                    {simulationData.academicPath.afterGraduation.degrees.map((deg: string, index: number) => (
                      <span key={index} className="text-xs bg-slate-50 text-slate-800 p-2 rounded-xl border border-slate-200 font-bold block">
                        🎓 {deg}
                      </span>
                    ))}
                  </div>

                  {/* Recommended complimentary training */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="text-[11px] text-indigo-600 font-extrabold block">تكوينات ملحقة مقترحة (التنمية الجانبية):</span>
                    <ul className="space-y-1">
                      {simulationData.academicPath.afterGraduation.trainings.map((tr: string, index: number) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-500">•</span>
                          <span>{tr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required credentials/certificates */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="text-[11px] text-slate-400 font-extrabold block font-mono">الشهادات الاحترافية والاعتمادات المطلوبة (Certifications):</span>
                    <div className="flex flex-wrap gap-1">
                      {simulationData.academicPath.afterGraduation.certificates.map((cert: string, index: number) => (
                        <span key={index} className="text-[10px] bg-indigo-50/50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100/50 font-bold font-sans">
                          🏆 {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">تفتح بوابة التوظيف الدولية</span>
            </div>

          </div>

          {/* Career Growth Miletones (المسار المهني وعبر شجرة التדרج) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>المخطط المهني المفصل لتدرج المراتب والمهارات الجزائري</span>
            </h3>

            {/* Horizontal Nodes progress */}
            <div className="relative pt-2 pb-6 max-w-5xl mx-auto overflow-x-auto">
              {/* background connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 hidden md:block" />
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 min-w-max md:min-w-0 md:px-4">
                {simulationData.careerPath.steps.map((node: any, nIdx: number) => {
                  const isActive = activeCareerNodeIdx === nIdx;
                  return (
                    <button
                      key={nIdx}
                      type="button"
                      onClick={() => setActiveCareerNodeIdx(nIdx)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${isActive ? "text-indigo-200" : "text-indigo-600"} font-mono`}>
                        المرحلة {nIdx + 1}
                      </span>
                      <span className="text-xs font-black pt-1">{node.stage}</span>
                      <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded ${isActive ? "bg-indigo-500 text-indigo-100" : "bg-slate-100 text-slate-500"}`}>
                        {node.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Node Details display */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-[10px] text-indigo-700 font-black bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                  تفاصيل عتبة التدرج المهنية: {simulationData.careerPath.steps[activeCareerNodeIdx].stage}
                </span>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-705">
                      المدة المقدرة للبقاء في هذه المرتبة: <span className="text-indigo-600 font-mono font-black">{simulationData.careerPath.steps[activeCareerNodeIdx].duration}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-500 block">المهارات الكفاءات المطلوبة لإثبات التميز والانتقال للمستوى التالي:</span>
                    <ul className="space-y-1 pl-1">
                      {simulationData.careerPath.steps[activeCareerNodeIdx].skillsRequired.map((s: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-100/50 space-y-2">
                <span className="text-xs font-bold text-indigo-650 block">فرص التطور ونوعية الصعود المتاحة:</span>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {simulationData.careerPath.steps[activeCareerNodeIdx].opportunities.map((o: string) => o).join("، ")}
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex justify-between">
                  <span>تم التنسيق بنجاح ✓</span>
                  <span>الرمز: {activeCareerNodeIdx + 1}/7</span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Future Jobs Market Grid (الوظائف المستقبلية) */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <span>الخيارات والمسارات الوظيفية الأربعة المتاحة في الأفق</span>
              </h3>
              <p className="text-xs text-slate-500">
                يقدم سيناريو المحاكاة توزيعاً متكاملاً للوظائف: المنصب المباشر، منصب الخبرة، العمل الفردي الحر، وبناء شركتك الناشئة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {simulationData.futureJobs.map((job: any, jIdx: number) => (
                <div key={jIdx} className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        job.type === "مباشر"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : job.type === "بعد خبرة"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : job.type === "عمل حر"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {job.type === "مباشر" && "💼 وظيفة مباشرة"}
                        {job.type === "بعد خبرة" && "🌟 منصب قيادي بالخبرة"}
                        {job.type === "عمل حر" && "🌍 العمل الحر الدولي"}
                        {job.type === "شركة خاصة" && "🚀 ريادة وشركة ناشئة"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">طراز {jIdx + 1}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight leading-snug">
                      {job.title}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed text-justify line-clamp-4">
                      {job.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold">مهارات السلاح:</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {job.skills.slice(0, 2).map((sk: string, sIdx: number) => (
                          <span key={sIdx} className="bg-slate-150 text-slate-700 px-1.5 py-0.2 rounded text-[9px] font-semibold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold">نسبة الطلب بالوطن:</span>
                      <span className="font-extrabold text-indigo-600">{job.demand}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold">كثافة المنافسة:</span>
                      <span className="font-bold text-slate-700">{job.competition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Simulation Dashboard (محاكاة الدخل وعتبات الأجور) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Coins className="h-5 w-5 text-indigo-600" />
                <span>التقرير والمسار المالي المتوقع لسلم الدخل والرواتب</span>
              </h3>
              <p className="text-xs text-slate-500">
                تقدير مستويات الدخل الشهري لمرمى المحاكاة المحسوبة بعملة الـ <strong className="text-indigo-600">{simulationData.incomeSimulation.currency}</strong> تدرجاً مع الخبرة المتنامية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {[
                { title: "الأجر الابتدائي (متخرج حديث)", value: simulationData.incomeSimulation.entrySalary, color: "border-slate-200 bg-slate-50/50" },
                { title: "بعد 5 سنوات من العطاء والخبرة", value: simulationData.incomeSimulation.fiveYearsSalary, color: "border-indigo-150 bg-indigo-50/30" },
                { title: "بعد 10 سنوات من المرجعية والتحكم", value: simulationData.incomeSimulation.tenYearsSalary, color: "border-indigo-200 bg-indigo-50/60" },
                { title: "سقف الدخل الأعلى (استشارات أو شركة)", value: simulationData.incomeSimulation.maxPotential, color: "border-emerald-250 bg-emerald-50/30 text-emerald-800" }
              ].map((sal, sIdx) => (
                <div key={sIdx} className={`rounded-2xl border p-4 text-center space-y-2 shadow-inner transition-all flex flex-col justify-center ${sal.color}`}>
                  <dt className="text-xs text-slate-500 font-bold leading-tight">{sal.title}</dt>
                  <dd className="text-xl md:text-2xl font-black">{sal.value}</dd>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 text-justify bg-slate-50 p-3 rounded-xl border border-slate-200/50 leading-relaxed">
              * <strong>ملاحظة فقهية قانونية هامة:</strong> {simulationData.incomeSimulation.notes}
            </p>
          </div>

          {/* AI Predictive Intelligence Report (التحليلات التنبؤية بالذكاء الاصطناعي) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Predictive items */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span>الذكاء الاصطناعي التنبؤي للتخصص وحاجات 2030</span>
              </h3>
              
              <div className="space-y-3 text-xs">
                {/* growing trends */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 space-y-1.5">
                  <span className="font-black text-slate-700 block">✓ التوجهات الكبرى الصاعدة بسوق العمل:</span>
                  <div className="space-y-1 pl-1">
                    {simulationData.predictiveInsights.marketTrends.map((tr: string, tIdx: number) => (
                      <div key={tIdx} className="flex gap-2 text-slate-600 font-semibold items-start">
                        <span className="text-indigo-650">•</span>
                        <span>{tr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* future in demand skills */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 space-y-1.5">
                  <span className="font-black text-indigo-700 block">✓ المهارات الحيوية المطلوب بناؤها للمستقبل:</span>
                  <div className="space-y-1 pl-1">
                    {simulationData.predictiveInsights.futureSkills.map((tr: string, tIdx: number) => (
                      <div key={tIdx} className="flex gap-2 text-slate-600 font-semibold items-start">
                        <span className="text-indigo-650">•</span>
                        <span>{tr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* sectors */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 space-y-1.5">
                  <span className="font-black text-slate-700 block">✓ القطاعات الحيوية التي تشهد أعلى نماء بالجزائر:</span>
                  <div className="space-y-1 pl-1">
                    {simulationData.predictiveInsights.growingSectors.map((tr: string, tIdx: number) => (
                      <div key={tIdx} className="flex gap-2 text-slate-600 font-semibold items-start">
                        <span className="text-indigo-650">•</span>
                        <span>{tr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized evaluation report */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/60 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-sm">
              <div className="space-y-3">
                <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-full uppercase self-start inline-block">
                  تقرير استقراء الجدوى والنجاح التنبؤي المخصص لك
                </span>

                <h4 className="font-bold text-slate-800 text-base">
                  ملاءمة {simulationData.specialtyName} مع المستقبل الأكاديمي والمهني
                </h4>

                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {simulationData.predictiveInsights.successProbabilityReport}
                </p>
              </div>

              <div className="pt-4 border-t border-indigo-200/40 flex items-center justify-between text-[11px] text-indigo-800 font-bold">
                <span>توصية المستشار التنبؤية: خيار واعد</span>
                <span>بوابة بكالوريا 2026</span>
              </div>
            </div>

          </div>

          {/* Interactive AI Future Assistant (مساعد المستقبل الذكي - chatbot inline) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Context/prompts guide */}
            <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                  <span>مساعد المستقبل الأكاديمي الذكي</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  مستشار التوجيه الجامعي الموجه بالذكاء الاصطناعي جاهز للإجابة عن أسئلة تخصصك التفاعلية كتحسين مهارات العمل، مستويات الشغف، أو فرص عقود السقوف.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-extrabold block">أسئلة توجيهية شائعة للاقتراح:</span>
                <div className="flex flex-col gap-1.5 align-start items-start">
                  {[
                    "ما هي وتيرة صعوبة ومناهج السنوات الأولى؟",
                    "كيف أتميز للوصول لفرص العمل الحر الدولي؟",
                    "ما نسبة توازن هذا التخصص للنشاط المكتبي؟",
                    "هل تخصصي متاح فيه تحضير دكتوراه بسهولة بالجزائر؟"
                  ].map((qLabel, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setChatInput(qLabel)}
                      className="text-right text-[11px] text-indigo-700 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 text-indigo-500 rotate-180" />
                      <span>{qLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat message flow */}
            <div className="lg:col-span-2 border border-slate-200 rounded-2xl flex flex-col h-[320px] overflow-hidden bg-slate-50">
              
              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "mr-auto items-start" : "ml-auto items-end"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl leading-relaxed text-justify whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tl-none font-medium"
                          : "bg-white text-slate-800 border border-slate-250 rounded-tr-none shadow-sm font-semibold"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.timestamp}</span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span>جاري صياغة الاستجابة الاستشارية والمحاكاة الفنية...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="اطرح أي تفاصيل عن التخصص أو فرص العمل أو تدرج سوق الشغل..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send className="h-4 w-4 text-white rotate-180" />
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER ADVICE CARD */}
      {!simulationData && !loading && (
        <div className="bg-slate-50 border border-dashed border-slate-250 p-12 rounded-3xl text-center space-y-4">
          <GraduationCap className="h-10 w-10 text-indigo-400 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">بوابة تصميم المستقبل وحساب الجدوى</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            الرجاء اختيار التخصص والجامعة وسقف الدرجة المقررة من اللوحة بالأعلى، ثم أطلق محاكاة المستقبل لترى مخطط تخرجك وحجم الدخل المهني في مسارك بالكامل.
          </p>
        </div>
      )}
    </div>
  );
}
