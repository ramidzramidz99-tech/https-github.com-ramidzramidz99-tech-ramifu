import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  FileText, 
  MessageSquare, 
  Activity, 
  Timer, 
  Lock, 
  CheckCircle, 
  X, 
  Plus, 
  User, 
  Trash2, 
  ChevronRight, 
  Sliders, 
  HelpCircle, 
  UploadCloud, 
  Check, 
  Brain, 
  BarChart, 
  Database,
  RefreshCw,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIStudyCoachProps {
  specialties?: any[];
  userName?: string;
}

// Custom Markdown to styled React utility
function formatMarkdown(text: string) {
  if (!text) return "";
  
  // Clean LaTeX equations for visual representation if any
  let processed = text
    .replace(/\$\$(.*?)\$\$/g, '<div class="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30 font-mono text-center my-3 text-indigo-300 overflow-x-auto">$1</div>')
    .replace(/\$(.*?)\$/g, '<span class="font-mono text-indigo-300 bg-indigo-950/30 px-1 py-0.5 rounded">$1</span>')
    .replace(/### (.*?)\n/g, '<h4 class="text-indigo-200 font-bold text-lg mt-4 mb-2">$1</h4>')
    .replace(/## (.*?)\n/g, '<h3 class="text-indigo-100 font-bold text-xl mt-5 mb-3 border-r-4 border-indigo-500 pr-2">$1</h3>')
    .replace(/\* \*\*(.*?)\*\*(.*?)\n/g, '<li class="mr-4 list-disc mt-1 text-gray-300"><strong class="text-indigo-200">$1</strong>$2</li>')
    .replace(/\* (.*?)\n/g, '<li class="mr-4 list-disc mt-1 text-gray-300">$1</li>')
    .replace(/-\s(.*?)\n/g, '<li class="mr-4 list-disc mt-1 text-gray-300">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-200">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="font-mono bg-indigo-950/50 text-indigo-300 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n/g, "<br />");
    
  return <div className="leading-relaxed text-gray-300 space-y-2 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: processed }} />;
}

// Static subjects based on Algerian school curriculums
const SUBJECTS_LIST = [
  "الرياضيات",
  "العلوم الطبيعية",
  "الفيزياء والكيمياء",
  "الفلسفة",
  "التاريخ والجغرافيا",
  "اللغة العربية وآدابها",
  "العلوم الإسلامية",
  "اللغة الإنجليزية",
  "اللغة الفرنسية"
];

const GRADE_LEVELS = [
  "بكالوريا (ثالثة ثانوي)",
  "ثانية ثانوي",
  "أولى ثانوي",
  "رابعة متوسط"
];

const ALGERIAN_STREAMS = [
  "علوم تجريبية",
  "رياضيات",
  "تقني رياضي",
  "تسيير واقتصاد",
  "آداب وفلسفة",
  "لغات أجنبية"
];

// Achievements setup
interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpNeeded: number;
  unlocked: boolean;
}

const INITIAL_BADGES: Badge[] = [
  { id: "b1", title: "تأسيس الشغف", description: "أكملت إعداد ملفك الدراسي والتحقت ببرنامج المدرب الذكي", icon: "🌟", xpNeeded: 100, unlocked: true },
  { id: "b2", title: "مكافح الثغرات", description: "قمت بحل أول تمرين ذكي مقترح لك بنجاح", icon: "🛡️", xpNeeded: 250, unlocked: false },
  { id: "b3", title: "بطل المحاكاة", description: "أنهيت امتحاناً تجريبياً محاكياً تحت ضغط الوقت", icon: "🏆", xpNeeded: 500, unlocked: false },
  { id: "b4", title: "قمة الالتزام", description: "أتممت جميع المهام اليومية المدرجة في جدول مراجعتك", icon: "🎯", xpNeeded: 800, unlocked: false },
  { id: "b5", title: "المتنبئ الإحصائي", description: "قمت بتدوين علاماتك في الفروض لتحليل مسارك الدراسي", icon: "📊", xpNeeded: 1200, unlocked: false }
];

export default function AIStudyCoach({ specialties = [], userName = "محمد" }: AIStudyCoachProps) {
  // Navigation inside Study Coach
  const [activeSubTab, setActiveSubTab] = useState<"plans" | "dashboard" | "generators" | "explainer" | "chat" | "admin">("plans");
  
  // XP & Gamification
  const [xp, setXp] = useState<number>(150);
  const [level, setLevel] = useState<number>(1);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [unlockedAnimationClass, setUnlockedAnimationClass] = useState<string | null>(null);

  // Profile Form States
  const [isRegistered, setIsRegistered] = useState<boolean>(true); // default to a registered profile
  const [loading, setLoading] = useState<boolean>(false);
  const [gradeLevel, setGradeLevel] = useState<string>("بكالوريا (ثالثة ثانوي)");
  const [stream, setStream] = useState<string>("علوم تجريبية");
  const [currentGPA, setCurrentGPA] = useState<number>(12.5);
  const [targetGPA, setTargetGPA] = useState<number>(16.0);
  const [selectedFavs, setSelectedFavs] = useState<string[]>(["الرياضيات", "العلوم الطبيعية"]);
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>(["الفيزياء والكيمياء", "الفلسفة"]);

  // Generated Profile Information
  const [profileSummary, setProfileSummary] = useState<string>(
    `أهلاً بك يا ${userName}. بناءً على ملفك الدراسي لشعبة **علوم تجريبية**، قمنا بإعداد خطة تكييفية ذكية للارتقاء بمعدلك الحالي المالي من **12.5** إلى معدلك المستهدف الطموح **16.0**. ترتكز استراتيجيتنا على تكثيف المراجعة التفاعلية في مادة الفيزياء والكيمياء ومادة الفلسفة مع الإبقاء على حافز الامتياز في الرياضيات والعلوم.`
  );
  const [strengths, setStrengths] = useState<string[]>([
    "علامات متميزة واهتمام عالي بالمقررات التطبيقية (الرياضيات والعلوم).",
    "نظام دراسة ذاتي مستقر ورغبة عالية جداً في التطور وتحدي الصعاب.",
    "القدرة الإحصائية على تنظيم المحاور وتخزين القوانين الأساسية."
  ]);
  const [weaknesses, setWeaknesses] = useState<string[]>([
    "ضعف جزئي في منهجية الإجابة للفيزياء وتحليل الوضعيات المعقدة.",
    "صعوبة في تبويب مقالات الفلسفة والتحكم في عناصر المنطق الصوري.",
    "تشتت في جدولة الحفظ الطويل للمواد الأدبية قبل فترة غلق الفصول."
  ]);

  // Plans (Daily, Weekly, Monthly, Seasonal)
  const [dailyPlan, setDailyPlan] = useState<any>({
    studyHours: 4.5,
    restHours: 2.0,
    schedule: [
      { id: "ds1", time: "05:30 - 06:45", text: "مراجعة الفجر للوضعية والحفظ (شريعة إسلامية / تاريخ وجغرافيا)", completed: false, xpReward: 20 },
      { id: "ds2", time: "17:30 - 19:30", text: "جلسة الفهم الاستكشافي والتطبيقات لحل تمرينين في المادة المعقدة (الفيزياء / الفلسفة)", completed: false, xpReward: 30 },
      { id: "ds3", time: "20:30 - 22:00", text: "إعداد بطاقات مراجعة سريعة وحل وضعيات ذكية في المواد الأساسية", completed: false, xpReward: 25 }
    ]
  });

  const [weeklyPlan, setWeeklyPlan] = useState<any>({
    targets: [
      { text: "حل 3 اختبارات بكالوريا تجريبية في مادة الفيزياء", completed: false },
      { text: "كتابة مخطط مقالين فلسفيين حول إشكالية السؤال العلمي والفلسفي", completed: false },
      { text: "إتمام مراجعة وحفظ الوحدة الثالثة في التاريخ", completed: false }
    ],
    tasks: [
      { text: "حضور شرح الأستاذ بالفيديو لدروس الكهرباء ثنائية القطب RC", completed: false },
      { text: "البدء بكتابة كراس الأخطاء لتلخيص القوانين وحمايتها من النسيان", completed: false }
    ]
  });

  const [monthlyPlan, setMonthlyPlan] = useState<any>({
    goals: [
      "السيطرة المطلقة على مجالات الثلاثي الأول والثاني في المواد العلمية",
      "الاستقرار بنسبة 90% في توقيت الحفظ الأسبوعي والالتزام بالجدول"
    ],
    milestones: [
      "إجراء امتحان محاكاة شامل نهاية الشهر لقياس التطور",
      "نيل معدل تقديري لا يقل عن 14.5 في الفروض التجريبية المنجزة"
    ]
  });

  const [seasonalPlan, setSeasonalPlan] = useState<any>({
    examTip: "قبل اختبارات البكالوريا الرسمية، خصص الأيام الـ 10 الأخيرة للمراجعة عن طريق خرائط المفاهيم وحل المواضيع الحولية فقط لتأكيد الهضم المنهجي واسترجاع ثقتك بنفسك.",
    examSchedule: [
      "الأسبوع التحضيري: معالجة كراسات الأخطاء وسد ثغرات المعادلات والترجمة الفرنسية والإنجليزية.",
      "الأيام الثلاثة الأخيرة: استعادة التوازن، تقليص فترات السهر، والراحة النفسية الكاملة لضمان التركيز الذهني."
    ]
  });

  // Performance Log State & Predictions
  const [quizGrades, setQuizGrades] = useState<any[]>([
    { id: "qg1", subject: "الرياضيات", grade: 16 },
    { id: "qg2", subject: "العلوم الطبيعية", grade: 14.5 },
    { id: "qg3", subject: "الفيزياء والكيمياء", grade: 11.5 }
  ]);
  const [examGrades, setExamGrades] = useState<any[]>([
    { id: "eg1", subject: "الرياضيات", grade: 15.5 },
    { id: "eg2", subject: "العلوم الطبيعية", grade: 15 }
  ]);
  const [newGradeSubject, setNewGradeSubject] = useState<string>("الرياضيات");
  const [newGradeValue, setNewGradeValue] = useState<string>("");
  const [newGradeType, setNewGradeType] = useState<"quiz" | "exam">("quiz");

  const [predictiveResult, setPredictiveResult] = useState<any>({
    strengthsAnalysis: [
      "ثبات علامات مادتك الأساسية الأولى التي حصدت فيها علامة مشجعة تفوق 15.5.",
      "فجوة النقاط ضيقة في التقييم التراكمي للعلوم الطبيعية، مما يمهد للارتقاء السريع."
    ],
    weaknessesAnalysis: [
      "علامة مادة الفيزياء والكيمياء المتراجعة (11.5) تعيق المعدل العام ويجب دعمها.",
      "نقص تدوين علامات الفلسفة والمواد الأدبية يؤخر الحساب الكلي الدقيق للمحيط التنبؤي."
    ],
    projectedGPA: 13.8,
    targetReachProbability: 75,
    actionableTips: [
      "ابدأ فوراً بتوليد 'تمرين ذكي متوسط الصعوبة' في محور الفيزياء لمعالجة نقاط الضعف التراكمية.",
      "واظب على حل الامتحانات التجريبية بالوقت المقترح لكسر حاجز الخوف وتنظيم الورقة بكفاءة.",
      "أضف علامات بقية المواد حال الحصول عليها ليعاد بناء المحاكاة التنبؤية الفعالة لك."
    ]
  });

  // Smart Exercise Generator State
  const [execSubject, setExecSubject] = useState<string>("الرياضيات");
  const [execTopic, setExecTopic] = useState<string>("المتتاليات العددية");
  const [execDifficulty, setExecDifficulty] = useState<string>("متوسط");
  const [exerciseResult, setExerciseResult] = useState<any>(null);
  const [solvingState, setSolvingState] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Exam Simulator State
  const [simSubject, setSimSubject] = useState<string>("الرياضيات");
  const [simTopic, setSimTopic] = useState<string>("الدوال اللوغاريتمية والأسية");
  const [simActive, setSimActive] = useState<boolean>(false);
  const [simExamData, setSimExamData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examReport, setExamReport] = useState<any>(null);

  // Lesson Explainer Space
  const [explainQuery, setExplainQuery] = useState<string>("");
  const [explainSubject, setExplainSubject] = useState<string>("الرياضيات");
  const [explainTopic, setExplainTopic] = useState<string>("النهايات والاستمرار");
  const [explainerResponse, setExplainerResponse] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileSim, setFileSim] = useState<string>("");

  // Chatbot Assistant Local State
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: "cm1", role: "model", text: `أهلاً بك يا ${userName} في مساحتك الاستشارية المخصصة! 👋\n\nأنا مدربك الدراسي الذكي الحاضر معك دائماً. كيف يمكن أن أساعدك اليوم في سد الثغرات وتحقيق معدلك المستهدف **${targetGPA}**؟\nيمكنك سؤالي عن نصائح الحفظ، كسر القلق، أو كيفية معالجة الفروق في الرياضيات والفيزياء.`, timestamp: "16:20" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Admin Configuration parameters
  const [aiPromptWeight, setAiPromptWeight] = useState<number>(0.85);
  const [activeCurriculumsCount, setActiveCurriculumsCount] = useState<number>(9);
  const [systemIntegrities, setSystemIntegrities] = useState<string>("ممتازة ومستقرة بنسبة 100%");
  const [sampleExercisesTemplates, setSampleExercisesTemplates] = useState<any[]>([
    { id: "t1", subject: "الرياضيات", topic: "المتتاليات الحسابية والهندسية", type: "نموذجي بكالوريا" },
    { id: "t2", subject: "الفيزياء والكيمياء", topic: "متابعة تطور جملة كيميائية", type: "تجريبي فصلي" },
    { id: "t3", subject: "الفلسفة", topic: "السؤال العلمي والسؤال الفلسفي", type: "مقالي تحليلي" }
  ]);
  const [adminStatusLog, setAdminStatusLog] = useState<string>("جاهز وجاري الاتصال مع خوادم معالجة الذكاء الاصطناعي.");

  // General Notification Alert Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Countdown timer for simulator
  useEffect(() => {
    let interval: any;
    if (simActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (simActive && timeLeft === 0) {
      handleCompleteExam();
    }
    return () => clearInterval(interval);
  }, [simActive, timeLeft]);

  // Toast notifier
  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // XP & Level calculations
  const gainXP = (amount: number) => {
    setXp(prev => {
      const nextXp = prev + amount;
      const nextLevel = Math.floor(nextXp / 300) + 1;
      if (nextLevel > level) {
        setLevel(nextLevel);
        triggerToast(`🎉 مبروك! لقد ارتقيت إلى المستوى التعليمي والتحفيزي ${nextLevel}!`);
        // Unlock badge related to level if possible
        const updatedBadges = [...badges];
        const nextLockedBadgeIndex = updatedBadges.findIndex(b => !b.unlocked && b.xpNeeded <= nextXp);
        if (nextLockedBadgeIndex !== -1) {
          updatedBadges[nextLockedBadgeIndex].unlocked = true;
          setBadges(updatedBadges);
          setUnlockedAnimationClass(updatedBadges[nextLockedBadgeIndex].title);
          setTimeout(() => setUnlockedAnimationClass(null), 5000);
        }
      }
      return nextXp;
    });
  };

  // Submit Profile Generation Form
  const handleGenerateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/study-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-profile",
          body: {
            gradeLevel,
            stream,
            favoriteSubjects: selectedFavs,
            difficultSubjects: selectedDiffs,
            currentGPA,
            targetGPA
          }
        })
      });
      const data = await response.json();
      if (data) {
        setProfileSummary(data.profileSummary || "");
        setStrengths(data.strengths || []);
        setWeaknesses(data.weaknesses || []);
        if (data.dailyPlan) {
          setDailyPlan({
            studyHours: data.dailyPlan.studyHours,
            restHours: data.dailyPlan.restHours,
            schedule: (data.dailyPlan.schedule || []).map((text: string, index: number) => ({
              id: `ds_${index}`,
              time: text.substring(0, text.indexOf("|")).trim() || "08:00 - 09:30",
              text: text.substring(text.indexOf("|") + 1).trim() || text,
              completed: false,
              xpReward: 20 + index * 5
            }))
          });
        }
        if (data.weeklyPlan) {
          setWeeklyPlan({
            targets: (data.weeklyPlan.targets || []).map((t: string) => ({ text: t, completed: false })),
            tasks: (data.weeklyPlan.tasks || []).map((tk: string) => ({ text: tk, completed: false }))
          });
        }
        if (data.monthlyPlan) {
          setMonthlyPlan({
            goals: data.monthlyPlan.goals || [],
            milestones: data.monthlyPlan.milestones || []
          });
        }
        if (data.seasonalPlan) {
          setSeasonalPlan({
            examTip: data.seasonalPlan.examTip || "",
            examSchedule: data.seasonalPlan.examSchedule || []
          });
        }
        if (data.gpaProjection) {
          setPredictiveResult((prev: any) => ({
            ...prev,
            projectedGPA: data.gpaProjection.estimated || prev.projectedGPA,
            targetReachProbability: data.gpaProjection.successProbability || prev.targetReachProbability,
            actionableTips: data.gpaProjection.tips || prev.actionableTips
          }));
        }
        setIsRegistered(true);
        gainXP(100);
        triggerToast("✨ تم تحديث وتحليل ملفك الدراسي وحساب خطة المراجعة الشخصية بنجاح!");
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ عذراً، حصل خطأ في معالجة طلبك الأكاديمي.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Daily Plan Task Completion
  const toggleDailyTask = (id: string, completed: boolean, xpReward: number) => {
    setDailyPlan((prev: any) => ({
      ...prev,
      schedule: prev.schedule.map((item: any) => 
        item.id === id ? { ...item, completed: !completed } : item
      )
    }));
    if (!completed) {
      gainXP(xpReward);
      triggerToast(`🌟 رائع! كسبت +${xpReward} نقطة خبرة لالتزامك.`);
    } else {
      setXp(prev => Math.max(0, prev - xpReward));
    }
  };

  // Toggle Weekly target Task completion
  const toggleWeeklyTarget = (index: number, completed: boolean) => {
    const updatedTargets = [...weeklyPlan.targets];
    updatedTargets[index].completed = !completed;
    setWeeklyPlan((prev: any) => ({ ...prev, targets: updatedTargets }));
    if (!completed) {
      gainXP(35);
      triggerToast("🎯 تم تسجيل تقدم في أهداف الأسبوع! +35 نقطة خبرة.");
    } else {
      setXp(prev => Math.max(0, prev - 35));
    }
  };

  // Add a Grade to log
  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeValue || isNaN(Number(newGradeValue)) || Number(newGradeValue) < 0 || Number(newGradeValue) > 20) {
      triggerToast("⚠️ يرجى إدخال علامة صحيحة تتراوح بين 0 و 20.");
      return;
    }

    const item = {
      id: `custom_${Date.now()}`,
      subject: newGradeSubject,
      grade: Number(newGradeValue)
    };

    if (newGradeType === "quiz") {
      setQuizGrades(prev => [...prev, item]);
    } else {
      setExamGrades(prev => [...prev, item]);
    }

    triggerToast(`📉 تم تسجيل علامة ${newGradeValue} في مادة ${newGradeSubject}!`);
    setNewGradeValue("");
    
    // Recalculate predictive feedback based on state grades
    triggerAnalysis();
    gainXP(40);
  };

  // Delete Grade from log
  const handleDeleteGrade = (id: string, type: "quiz" | "exam") => {
    if (type === "quiz") {
      setQuizGrades(prev => prev.filter(g => g.id !== id));
    } else {
      setExamGrades(prev => prev.filter(g => g.id !== id));
    }
    triggerToast("🗑️ تم حذف العلامة المسجلة.");
    setTimeout(() => triggerAnalysis(), 100);
  };

  // Trigger analysis recalculation with backend
  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/study-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-results",
          body: {
            quizGrades,
            examGrades,
            currentGPA,
            targetGPA
          }
        })
      });
      const data = await response.json();
      if (data) {
        setPredictiveResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Quick Custom Exercise
  const handleGenerateExercise = async () => {
    setSolvingState(true);
    setShowSolution(false);
    setExerciseResult(null);
    try {
      const response = await fetch("/api/study-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-exercise",
          body: {
            subject: execSubject,
            topic: execTopic,
            difficulty: execDifficulty,
            stream
          }
        })
      });
      const data = await response.json();
      if (data) {
        setExerciseResult(data);
        gainXP(40);
        // unlock badge check
        const updatedBadges = [...badges];
        if (!updatedBadges[1].unlocked) {
          updatedBadges[1].unlocked = true;
          setBadges(updatedBadges);
          setUnlockedAnimationClass(updatedBadges[1].title);
          setTimeout(() => setUnlockedAnimationClass(null), 5000);
          gainXP(150);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ فشل في استخدام مولد التمارين. جرب مادة أخرى.");
    } finally {
      setSolvingState(false);
    }
  };

  // Start Exam Simulation
  const handleStartExamSimulation = async () => {
    setSolvingState(true);
    setExamSubmitted(false);
    setUserAnswers({});
    try {
      const response = await fetch("/api/study-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate-exam",
          body: {
            subject: simSubject,
            topic: simTopic,
            stream
          }
        })
      });
      const data = await response.json();
      if (data) {
        setSimExamData(data);
        setTimeLeft((data.durationMinutes || 45) * 60);
        setSimActive(true);
        triggerToast(`⏱️ تم تحميل الامتحان الموجه وبدء التوقيت: ${data.durationMinutes || 45} دقيقة!`);
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ عذراً، حصل مشكل فني في توليد الورقة المحاكاة.");
    } finally {
      setSolvingState(false);
    }
  };

  // Click on simulation answers option
  const handleSelectOption = (qId: string, value: string) => {
    setUserAnswers((prev: any) => ({ ...prev, [qId]: value }));
  };

  // Handle structured answer textarea update
  const handleStructuredAnswer = (qId: string, value: string) => {
    setUserAnswers((prev: any) => ({ ...prev, [qId]: value }));
  };

  // Complete & Submit simulation exam
  const handleCompleteExam = () => {
    setSimActive(false);
    setExamSubmitted(true);
    
    // Evaluate MCQs and yield mock grading output
    let correctCount = 0;
    let totalScore = 0;
    let maxScorable = 0;

    const evaluatedQuestions = (simExamData?.questions || []).map((q: any) => {
      maxScorable += q.points;
      const answered = userAnswers[q.id] || "";
      let isCorrect = false;
      let review = "";

      if (q.type === "multiple_choice") {
        isCorrect = answered === q.correctAnswer;
        if (isCorrect) {
          correctCount++;
          totalScore += q.points;
          review = "ممتاز! إجابة صحيحة تامة ومطابقة للقانون المتداول.";
        } else {
          review = `إجابة خاطئة. الإجابة الدقيقة هي [${q.correctAnswer}].`;
        }
      } else {
        // Structured answers are corrected self-collaboratively
        review = "تتطلب المسألة الهيكلية مراجعة استدلالية. مقارنة إجابتك بالحل النموذجي تظهر تطابقاً متوسطاً.";
        totalScore += answered.length > 15 ? q.points : Math.round(q.points * 0.4);
      }

      return {
        ...q,
        userAnswer: answered,
        isCorrect,
        review
      };
    });

    const finalGPAOn20 = Number(((totalScore / maxScorable) * 20).toFixed(1));

    setExamReport({
      finalGPAOn20,
      totalScore,
      maxScorable,
      correctCount,
      evaluatedQuestions
    });

    gainXP(150);
    triggerToast(`🏆 تم إتمام الامتحان بنجاح وصياغة التقرير الذاتي! علامتك التقديرية: 20/${finalGPAOn20}`);
    
    // Unlock badge check
    const updatedBadges = [...badges];
    if (!updatedBadges[2].unlocked) {
      updatedBadges[2].unlocked = true;
      setBadges(updatedBadges);
      setUnlockedAnimationClass(updatedBadges[2].title);
      setTimeout(() => setUnlockedAnimationClass(null), 5000);
      gainXP(200);
    }
  };

  // Submit query for explanation
  const handleExplainQuery = async (queryCustomText?: string) => {
    const qText = queryCustomText || explainQuery;
    if (!qText.trim()) {
      triggerToast("⚠️ يرجى إدخال الدرس أو كتابة السؤال المراد شرحه.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/study-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain-lesson",
          body: {
            query: qText,
            subject: explainSubject,
            currentTopic: explainTopic
          }
        })
      });
      const data = await response.json();
      if (data) {
        setExplainerResponse(data);
        gainXP(30);
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ حدث خطأ في معالجة طلب شرح الدرس.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate file upload (images or PDFs)
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileSim(file.name);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerToast(`✅ تم رفع المستند الدراسي "${file.name}" بنجاح! جاري استخلاص المحتوى والتبسيط المنهجي...`);
          // Automatically trigger explanatory API on behalf of student
          setTimeout(() => {
            handleExplainQuery(`تبسيط وتحليل شامل للوضعية والمسألة الواردة بالملف المرفق: ${file.name}`);
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Chat message send
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const formattedContext = chatMessages.concat(userMessage);
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedContext,
          grade: currentGPA,
          stream,
          wilaya: "الجزائر العاصمة"
        })
      });

      const data = await response.json();
      if (data && data.text) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `model_${Date.now()}`,
            role: "model",
            text: data.text,
            timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        gainXP(15);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `model_err_${Date.now()}`,
          role: "model",
          text: "أعتذر منك يا بطل، يبدو أن هناك ضغطاً مؤقتاً على خوادمي في التوجيه. هل يمكنك إعادة كتابة السؤال أو تجربته مرة أخرى؟",
          timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Subject quick click to fill prompt
  const handleQuickSubjectQuestion = (question: string) => {
    setChatInput(question);
  };

  // Convert seconds to readable timer MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-[#0a0f24] text-white min-h-screen rounded-3xl overflow-hidden border border-indigo-950 shadow-2xl p-4 md:p-8 relative selection:bg-indigo-600 selection:text-white" dir="rtl">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-4 right-4 md:left-8 md:right-auto md:w-96 bg-indigo-900/90 border border-indigo-500/50 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center gap-3 z-50 text-right text-sm"
          >
            <Sparkles className="h-6 w-6 text-indigo-400 animate-spin" />
            <div className="flex-1 text-white font-medium">{notification}</div>
            <X className="h-4 w-4 text-indigo-300 cursor-pointer hover:text-white" onClick={() => setNotification(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock Achievement Animation */}
      <AnimatePresence>
        {unlockedAnimationClass && (
          <motion.div 
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
          >
            <div className="bg-gradient-to-br from-[#12183a] via-[#1b2255] to-[#0d1230] border-2 border-indigo-500 p-8 rounded-3xl max-w-md text-center shadow-indigo-500/20 shadow-2xl flex flex-col items-center">
              <Award className="h-20 w-20 text-yellow-400 animate-bounce mb-3" />
              <h2 className="text-2xl font-black text-white tracking-wide">🏆 شارة إنجاز جديدة!</h2>
              <p className="text-yellow-400 font-bold font-mono mt-1 mb-4 text-lg">{unlockedAnimationClass}</p>
              <div className="text-gray-300 text-sm mb-6 leading-relaxed">
                مبروك! لقد أظهرت شغفاً كبيراً بالدراسة في منهجية المدرب الدراسي الذكي للارتقاء بوضعيتك ونقاط البكالوريا. نبارك لك مجهودك المتواصل اليوم وسجلنا مكافأة استثنائية لك في رصيد نقاط خبرتك!
              </div>
              <button 
                onClick={() => setUnlockedAnimationClass(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-8 rounded-xl transition duration-250 w-full"
              >
                متابعة التألق 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Visual Context */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-indigo-950 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Brain className="h-7 w-7 animate-pulse text-indigo-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">المدرب الدراسي الذكي</h1>
                <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-indigo-500/30">AI Study Coach</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm mt-1">مرافقك التعليمي الشخصي المدعم بالذكاء الاصطناعي لتخطيط مراجعتك، حل الثغرات، ومحاكاة البكالوريا</p>
            </div>
          </div>
        </div>

        {/* Gamification Dashboard widgets */}
        <div className="flex items-center gap-4 bg-indigo-950/40 p-3 rounded-2xl border border-indigo-900/30 w-full md:w-auto">
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>المستوى التعليمي {level}</span>
              <span className="font-mono text-indigo-300 font-bold">{xp % 300} / 300 XP</span>
            </div>
            <div className="w-36 h-2 bg-indigo-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(xp % 300) / 3}%` }}></div>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-indigo-900/60 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-yellow-500" />
            <div className="text-right">
              <div className="text-sm font-black text-white">{badges.filter(b => b.unlocked).length} شارات</div>
              <span className="text-[10px] text-gray-400">مكتسبة طوال الفصل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Check / Unregistered view */}
      {!isRegistered ? (
        <div className="max-w-4xl mx-auto bg-indigo-950/20 border border-indigo-900/40 rounded-3xl p-6 md:p-10 text-center">
          <Sparkles className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">تأسيس ملفك الأكاديمي والمدرب الذكي</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
            يرجى تزويد نظام الذكاء الاصطناعي بمعطياتك لتدقيق المسار، وبناء جداول المراجعة التكييفية الفريدة، وتهيئة نماذج توقعات التحصيل قبل تفعيل خطط السنة.
          </p>

          <form onSubmit={handleGenerateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">المستوى الدراسي الحالي</label>
              <select 
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">شعبة البكالوريا (أو الفرع)</label>
              <select 
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
              >
                {ALGERIAN_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">المعدل العام التراكمي الحالي (من 20)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="20"
                value={currentGPA}
                onChange={(e) => setCurrentGPA(Number(e.target.value))}
                className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                placeholder="أدخل معدلك الحالي مثل 12.5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">المعدل الطموح المستهدف بالبكالوريا</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="20"
                value={targetGPA}
                onChange={(e) => setTargetGPA(Number(e.target.value))}
                className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                placeholder="أدخل معدلك المرغوب مثل 16.5"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-indigo-200 mb-2">اختر المواد التي تفضلها وتجد فيها متعة وموهبة</label>
              <div className="flex flex-wrap gap-2.5 mt-2 justify-center">
                {SUBJECTS_LIST.map(sub => {
                  const active = selectedFavs.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedFavs(prev => active ? prev.filter(p => p !== sub) : [...prev, sub])}
                      className={`text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 ${active ? "bg-indigo-600 text-white font-bold" : "bg-indigo-950/40 text-gray-400 text-xs border border-indigo-900/40 hover:bg-indigo-950/80"}`}
                    >
                      {sub} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-indigo-200 mb-2">اختر المواد الصعبة التي تحتاج فيها لدعم وإرشاد مكثف</label>
              <div className="flex flex-wrap gap-2.5 mt-2 justify-center">
                {SUBJECTS_LIST.map(sub => {
                  const active = selectedDiffs.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedDiffs(prev => active ? prev.filter(p => p !== sub) : [...prev, sub])}
                      className={`text-xs md:text-sm px-4 py-2 rounded-xl transition duration-200 ${active ? "bg-rose-600 text-white font-bold" : "bg-indigo-950/40 text-gray-400 text-xs border border-indigo-900/40 hover:bg-indigo-950/80"}`}
                    >
                      {sub} {active && "⚠️"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 mt-4 text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-10 py-3.5 rounded-xl transition duration-200 disabled:opacity-50"
              >
                {loading ? "جاري بناء وتحليل ملفك بالكامل..." : "تأسيس وبناء الخطة الدراسية الذكية 🚀"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Inside Coach Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Right Sub-tabs Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            
            <div className="text-gray-400 uppercase font-bold text-[10px] tracking-wider pr-3">قائمة الأقسام والتطبيقات</div>

            <button
              onClick={() => setActiveSubTab("plans")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "plans" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <Calendar className="h-5 w-5 text-indigo-300" />
              <span>الخطة الدراسية الذكية</span>
            </button>

            <button
              onClick={() => { setActiveSubTab("dashboard"); triggerAnalysis(); }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "dashboard" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <TrendingUp className="h-5 w-5 text-indigo-300" />
              <span>نتائجك والذكاء التنبؤي</span>
            </button>

            <button
              onClick={() => setActiveSubTab("generators")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "generators" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <FileText className="h-5 w-5 text-indigo-300" />
              <span>مُولد التمارين والامتحانات</span>
            </button>

            <button
              onClick={() => setActiveSubTab("explainer")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "explainer" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <BookOpen className="h-5 w-5 text-indigo-300" />
              <span>مساعد شرح الدروس</span>
            </button>

            <button
              onClick={() => setActiveSubTab("chat")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "chat" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <MessageSquare className="h-5 w-5 text-indigo-300 animate-bounce" />
              <span>المدرب الافتراضي المباشر</span>
            </button>

            <button
              onClick={() => setActiveSubTab("admin")}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-right text-sm font-bold transition duration-200 ${activeSubTab === "admin" ? "bg-indigo-600 text-white" : "bg-indigo-950/20 text-gray-300 hover:bg-slate-900 border border-indigo-950/60"}`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 text-indigo-400" />
                <span>لوحة الإدارة</span>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">إشراف</span>
            </button>

            {/* Quick Profile Parameters card */}
            <div className="mt-4 p-4 bg-indigo-950/30 rounded-2xl border border-indigo-900/20 text-right">
              <div className="flex items-center justify-between mb-3 border-b border-indigo-900/30 pb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">ملخص الطالب</span>
                </div>
                <button 
                  onClick={() => setIsRegistered(false)} 
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  تعديل الملف
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-gray-400">
                <div>المستوى: <span className="text-white font-medium">{gradeLevel}</span></div>
                <div>الشعبة: <span className="text-white font-medium">{stream}</span></div>
                <div>المعدل الحالي: <span className="text-indigo-300 font-bold font-mono">{currentGPA}</span></div>
                <div>المستهدف: <span className="text-green-400 font-bold font-mono">{targetGPA}</span></div>
              </div>
            </div>

            {/* Locked Achievements Widget inside and below parameters */}
            <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-900/10 mt-2">
              <div className="text-xs font-bold text-gray-400 mb-3 block">الشارات المغلقة القادمة</div>
              <div className="space-y-2.5">
                {badges.filter(b => !b.unlocked).slice(0, 2).map(b => (
                  <div key={b.id} className="flex items-start gap-2 text-right opacity-60">
                    <div className="p-1 px-2 bg-indigo-950 rounded text-xs">🔒</div>
                    <div>
                      <div className="text-xs font-bold text-gray-300">{b.title}</div>
                      <span className="text-[10px] text-gray-500">يتطلب رصيد {b.xpNeeded} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main workspace container (Takes 3 columns on large screens) */}
          <div className="lg:col-span-3 bg-indigo-950/10 rounded-3xl border border-indigo-950 p-4 md:p-6 min-h-[500px]">
            
            {/* 1. PLANS TAB CONTENT */}
            {activeSubTab === "plans" && (
              <div className="space-y-8">
                
                {/* Intro summary block */}
                <div className="p-5 bg-gradient-to-r from-indigo-950/50 to-indigo-900/30 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-indigo-500/20 text-indigo-300 font-bold text-[9px] px-3 py-1 rounded-br-2xl">الدراسة التكيفية</div>
                  <h3 className="text-md font-bold text-indigo-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                    خطة المراجعة والتوجيه الذكي المقررة:
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{profileSummary}</p>
                  
                  {/* Strengths & Weaknesses row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-indigo-900/30">
                    <div>
                      <span className="text-xs font-bold text-green-400 block mb-2">🟢 ميزات وقوى بملفك:</span>
                      <ul className="space-y-1.5 text-xs text-gray-400">
                        {strengths.map((s, i) => <li key={i} className="flex items-start gap-1"><span>-</span> <span>{s}</span></li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-400 block mb-2">🔴 نقاط تحدي واجب معالجتها:</span>
                      <ul className="space-y-1.5 text-xs text-gray-400">
                        {weaknesses.map((w, i) => <li key={i} className="flex items-start gap-1"><span>-</span> <span>{w}</span></li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sub Tab selection inside plans (Daily, Weekly, Monthly, Seasonal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Daily Plan card */}
                  <div className="bg-[#101431]/20 border border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-indigo-900/30 pb-2">
                        <span className="text-xs font-bold text-indigo-300">الخطة اليومية</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold font-mono">{dailyPlan.studyHours}h دراسة</span>
                      </div>
                      <div className="space-y-3">
                        {dailyPlan.schedule.map((item: any) => (
                          <div 
                            key={item.id} 
                            onClick={() => toggleDailyTask(item.id, item.completed, item.xpReward)}
                            className={`p-2 rounded-xl text-xs cursor-pointer border transition duration-200 ${item.completed ? "bg-indigo-950/80 border-indigo-500/50 opacity-60" : "bg-indigo-950/20 border-indigo-950 hover:border-indigo-800"}`}
                          >
                            <div className="flex items-center justify-between font-mono mb-1 text-[10px]">
                              <span className={item.completed ? "text-indigo-400 line-through" : "text-indigo-300"}>{item.time}</span>
                              {item.completed && <span className="text-green-400 font-bold">مكتملت ✓</span>}
                            </div>
                            <p className={`line-clamp-2 ${item.completed ? "line-through text-gray-500" : "text-gray-300"}`}>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-indigo-900/10 text-center">
                      <span className="text-[10px] text-gray-500">انقر على المهمة لإكمالها ونيل الـ XP</span>
                    </div>
                  </div>

                  {/* Weekly Plan targets card */}
                  <div className="bg-[#101431]/20 border border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-indigo-900/30 pb-2">
                        <span className="text-xs font-bold text-indigo-300">الأهداف الأسبوعية</span>
                        <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">نقاط ممتازة</span>
                      </div>
                      <div className="space-y-3">
                        {weeklyPlan.targets.map((tgt: any, idx: number) => (
                          <div 
                            key={idx}
                            onClick={() => toggleWeeklyTarget(idx, tgt.completed)}
                            className={`flex items-start gap-2 p-2.5 rounded-xl text-xs cursor-pointer transition ${tgt.completed ? "bg-indigo-950/50 text-gray-500 line-through" : "bg-indigo-950/10 text-gray-300 hover:bg-indigo-950/30"}`}
                          >
                            <span className={`h-4 w-4 rounded border flex items-center justify-center font-bold text-[8px] flex-shrink-0 mt-0.5 ${tgt.completed ? "border-green-500 bg-green-500/10 text-green-400" : "border-indigo-900"}`}>
                              {tgt.completed && "✓"}
                            </span>
                            <span>{tgt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-indigo-900/10 text-center">
                      <span className="text-[10px] text-gray-500">حقق الأهداف الأسبوعية لربح 35 XP</span>
                    </div>
                  </div>

                  {/* Monthly Plan milestones */}
                  <div className="bg-[#101431]/20 border border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-indigo-900/30 pb-2">
                        <span className="text-xs font-bold text-indigo-300">الرصد الشهري</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">تراكمي</span>
                      </div>
                      <div className="space-y-2.5 text-xs text-gray-300 mt-2">
                        <div className="font-bold text-indigo-200 mb-1">أهداف كبرى للشهر:</div>
                        {monthlyPlan.goals.map((g: string, i: number) => (
                          <div key={i} className="flex gap-1.5 align-top">
                            <span className="text-indigo-500">●</span>
                            <p className="text-gray-300 text-[11px] leading-relaxed">{g}</p>
                          </div>
                        ))}
                        <div className="font-bold text-indigo-200 mt-3 mb-1">نقاط القياس:</div>
                        {monthlyPlan.milestones.map((m: string, i: number) => (
                          <div key={i} className="flex gap-1.5 align-top">
                            <span className="text-green-500">★</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed">{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Exam and Bac Preparation */}
                  <div className="bg-[#101431]/20 border border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-indigo-900/30 pb-2">
                        <span className="text-xs font-bold text-indigo-300">طوارئ موسم الامتحانات</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">جاهزية</span>
                      </div>
                      <div className="p-2.5 bg-rose-950/10 border border-rose-900/10 rounded-xl text-[11px] text-gray-300 mb-3 leading-relaxed">
                        <span className="font-bold text-rose-300 block mb-0.5">⚠️ نصية ذهبية للموسم:</span>
                        {seasonalPlan.examTip}
                      </div>
                      <div className="space-y-1.5 text-[10px] text-gray-400">
                        {seasonalPlan.examSchedule.map((sch: string, index: number) => (
                          <div key={index} className="bg-indigo-950/20 p-2 rounded">
                            {sch}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Setup New Plan triggers */}
                <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-right">
                    <span className="text-xs text-indigo-400 font-bold block">هل تغيرت معطياتك أو جدولك الدراسي؟</span>
                    <p className="text-gray-400 text-xs mt-0.5">يمكنك في أي لينة إعادة تشغيل ذكاء المدرب لضبط الجدولة وفق الوحدات الحالية</p>
                  </div>
                  <button 
                    onClick={() => setIsRegistered(false)}
                    className="bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-white text-xs font-bold px-6 py-2 rounded-xl transition duration-200"
                  >
                    تعديل الملف وإعادة التوليد تلقائياً ⚙️
                  </button>
                </div>

              </div>
            )}

            {/* 2. DASHBOARD & PREDICTION TAB CONTENT */}
            {activeSubTab === "dashboard" && (
              <div className="space-y-6">
                
                {/* Stats Header Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#101431]/40 border border-indigo-900/40 rounded-2xl text-center">
                    <span className="text-xs text-gray-400 block mb-1">المعدل العام المتوقع</span>
                    <span className="text-3xl font-black font-mono text-indigo-300">{predictiveResult.projectedGPA} <span className="text-sm font-sans text-gray-400">/ 20</span></span>
                    <p className="text-[10px] text-gray-500 mt-1">بناء على النقاط المدخلة بالفروض والمسيرة</p>
                  </div>

                  <div className="p-4 bg-[#101431]/40 border border-indigo-900/40 rounded-2xl text-center relative overflow-hidden">
                    <span className="text-xs text-gray-400 block mb-1">إمكانية نيل المعدل المستهدف ({targetGPA})</span>
                    <span className="text-3xl font-black font-mono text-green-400">{predictiveResult.targetReachProbability}%</span>
                    <div className="w-24 h-1.5 bg-indigo-950 rounded-full mx-auto mt-2">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${predictiveResult.targetReachProbability}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#101431]/40 border border-indigo-900/40 rounded-2xl text-center">
                    <span className="text-xs text-gray-400 block mb-1">حجم النشاط العلمي</span>
                    <span className="text-3xl font-black font-mono text-indigo-400">{quizGrades.length + examGrades.length} <span className="text-sm font-sans text-slate-500">نقاط</span></span>
                    <p className="text-[10px] text-gray-500 mt-1">فروض وامتحانات تم تدوينها بالكامل</p>
                  </div>
                </div>

                {/* Grade registration workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  
                  {/* Register New Grade */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-900/20 rounded-2xl text-right">
                    <h3 className="text-sm font-bold text-white border-b border-indigo-900/40 pb-2 mb-4 flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-indigo-400" />
                      تسجيل علامة جديدة (فروض / اختبارات)
                    </h3>
                    <form onSubmit={handleAddGrade} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-indigo-300 mb-1.5">المادة الدراسية</label>
                          <select 
                            value={newGradeSubject}
                            onChange={(e) => setNewGradeSubject(e.target.value)}
                            className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs"
                          >
                            {SUBJECTS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-indigo-300 mb-1.5">فئة العلامة</label>
                          <select 
                            value={newGradeType}
                            onChange={(e) => setNewGradeType(e.target.value as "quiz" | "exam")}
                            className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs"
                          >
                            <option value="quiz">فرض منزلي أو فصلي</option>
                            <option value="exam">اختبار فصلي مغلق</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-indigo-300 mb-1.5">العلامة المحصل عليها (من 20)</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.25"
                            min="0"
                            max="20"
                            value={newGradeValue}
                            onChange={(e) => setNewGradeValue(e.target.value)}
                            placeholder="أدخل العلامة مثل 15.25"
                            className="flex-1 bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-2.5 text-white text-xs font-mono"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 rounded-xl transition duration-200"
                          >
                            تدوين العلامة
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Grades Table List */}
                    <div className="mt-5 space-y-2">
                      <span className="text-xs font-bold text-indigo-400 block mb-2">سجل علاماتك المسيرة:</span>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {quizGrades.length === 0 && examGrades.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-xs">لا توجد علامات مدونة حالياً.</div>
                        ) : (
                          <>
                            {quizGrades.map(q => (
                              <div key={q.id} className="flex justify-between items-center bg-[#070b1e]/60 p-2 rounded-lg border border-indigo-950 text-xs">
                                <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded text-[10px]">فرض</span>
                                <span className="font-bold text-gray-300 flex-1 mr-2">{q.subject}</span>
                                <span className="font-mono text-indigo-300 font-bold ml-4">{q.grade} / 20</span>
                                <button onClick={() => handleDeleteGrade(q.id, "quiz")} className="text-rose-500 hover:text-rose-400 mr-2 p-1">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            {examGrades.map(e => (
                              <div key={e.id} className="flex justify-between items-center bg-[#070b1e]/60 p-2 rounded-lg border border-[#312e81]/30 text-xs">
                                <span className="bg-[#312e81]/30 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">اختبار</span>
                                <span className="font-bold text-gray-300 flex-1 mr-2">{e.subject}</span>
                                <span className="font-mono text-green-400 font-bold ml-4">{e.grade} / 20</span>
                                <button onClick={() => handleDeleteGrade(e.id, "exam")} className="text-rose-500 hover:text-rose-400 mr-2 p-1">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Predictive Feedback */}
                  <div className="p-5 bg-[#101431]/20 border border-indigo-900/30 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 border-b border-indigo-900/40 pb-2 mb-3 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                        تقرير التحليل التنبؤي المنهجي
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-[11px] font-bold text-green-400 block mb-1">🔍 الاستخلاص والتميز:</span>
                          <div className="space-y-1">
                            {predictiveResult.strengthsAnalysis?.map((sa: string, i: number) => (
                              <p key={i} className="text-xs text-gray-300 leading-relaxed">- {sa}</p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-rose-400 block mb-1">⚠️ نقاط الحذر والمتابعة:</span>
                          <div className="space-y-1">
                            {predictiveResult.weaknessesAnalysis?.map((wa: string, i: number) => (
                              <p key={i} className="text-xs text-gray-300 leading-relaxed">- {wa}</p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-yellow-400 block mb-1">💡 خطوات فورية موصى بها من المدرب:</span>
                          <div className="space-y-1">
                            {predictiveResult.actionableTips?.map((tip: string, i: number) => (
                              <p key={i} className="text-[#e0f2fe] text-xs leading-relaxed font-medium bg-indigo-950/20 p-1.5 rounded border border-indigo-900/10 mb-1">★ {tip}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-center">
                      <button 
                        onClick={triggerAnalysis}
                        disabled={loading}
                        className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-white text-xs font-bold py-2 px-6 rounded-lg transition duration-200"
                      >
                        إعادة فحص وتحديث الذكاء التنبؤي 🔄
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 3. EXERCISE GENERATOR & EXAM SIMULATOR Tab */}
            {activeSubTab === "generators" && (
              <div className="space-y-8">
                
                {/* Switch sub mode selection box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* GENERATOR WORKSPACE */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl text-right">
                    <span className="text-[10px] bg-indigo-500/25 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">مولد التمارين الذكي</span>
                    <h3 className="text-md font-bold text-white mt-2 mb-3">توليد تمرين مراجعة مخصص لشعبتك</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">المادة</label>
                          <select 
                            value={execSubject}
                            onChange={(e) => setExecSubject(e.target.value)}
                            className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          >
                            {SUBJECTS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">درجة الصعوبة</label>
                          <select 
                            value={execDifficulty}
                            onChange={(e) => setExecDifficulty(e.target.value)}
                            className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          >
                            <option value="سلس">سلس وبديهي 🟢</option>
                            <option value="متوسط">متوسط المنهجية 🟡</option>
                            <option value="مرتفع">مرتفع وبكالوريا 🔴</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">العنوان أو الوحدة المعينة</label>
                        <input 
                          type="text"
                          value={execTopic}
                          onChange={(e) => setExecTopic(e.target.value)}
                          placeholder="مثلاً: المتتاليات العددية، تركيب البروتين، إلخ"
                          className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleGenerateExercise}
                        disabled={solvingState}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition duration-200"
                      >
                        {solvingState ? "جاري صياغة التمرين والحل بـ AI..." : "توليد التمرين الذكي المخصص 🚀"}
                      </button>
                    </div>

                    {/* Result Exercise Area */}
                    {exerciseResult && (
                      <div className="mt-5 p-4 bg-indigo-950/60 rounded-xl border border-indigo-900/50 text-right space-y-4">
                        <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs font-bold text-indigo-300">{exerciseResult.exerciseTitle}</span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{exerciseResult.difficultyLabel}</span>
                        </div>
                        <div className="overflow-x-auto text-xs">
                          {formatMarkdown(exerciseResult.questionText)}
                        </div>

                        {/* Show Solution hidden block */}
                        {showSolution ? (
                          <div className="mt-3 p-3 bg-indigo-950/90 rounded-lg border-r-4 border-green-500 text-right space-y-3">
                            <span className="text-xs font-bold text-green-400 block">💡 الحل النموذجي خطوة بخطوة:</span>
                            <div className="text-xs text-gray-300 leading-relaxed overflow-x-auto">
                              {formatMarkdown(exerciseResult.stepByStepSolution)}
                            </div>
                            <p className="text-[10px] text-gray-400 border-t border-indigo-900/40 pt-2">{exerciseResult.similarExerciseTip}</p>
                          </div>
                        ) : (
                          <div className="text-center pt-2">
                            <button
                              onClick={() => { setShowSolution(true); gainXP(40); }}
                              className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1.5 px-6 rounded-lg transition duration-250"
                            >
                              عرض الحل ومقارنة الإجابات 🧠
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* EXAM SIMULATOR WORKSPACE */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl text-right">
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/20">محاكي الامتحانات</span>
                    <h3 className="text-md font-bold text-white mt-2 mb-3">حاكِ الامتحان الفصلي تحت ضغط الوقت</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">اختر مادة المحاكاة</label>
                          <select 
                            value={simSubject}
                            onChange={(e) => setSimSubject(e.target.value)}
                            className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          >
                            {SUBJECTS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">عنوان أو فئة فحص الاختبار</label>
                        <input 
                          type="text"
                          value={simTopic}
                          onChange={(e) => setSimTopic(e.target.value)}
                          placeholder="مثلاً: الدوال اللوغاريتمية والأسية"
                          className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none"
                        />
                      </div>

                      {/* Launch exam simulation button */}
                      {!simActive && !examSubmitted && (
                        <button
                          onClick={handleStartExamSimulation}
                          disabled={solvingState}
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition duration-200"
                        >
                          {solvingState ? "جاري معالجة وبناء الامتحان..." : "بدء محاكاة الامتحان التجريبي ⏱️"}
                        </button>
                      )}
                    </div>

                    {/* Active Exam Countdown Simulation UI */}
                    {simActive && simExamData && (
                      <div className="mt-5 p-4 bg-[#0a0e28] rounded-xl border border-rose-500/30 text-right space-y-4">
                        <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs font-bold text-rose-300">{simExamData.examTitle}</span>
                          <span className="text-xs font-mono font-bold text-rose-400 animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{formatTime(timeLeft)} ⏱️</span>
                        </div>
                        
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                          {simExamData.questions?.map((q: any, idx: number) => (
                            <div key={q.id} className="p-3 bg-indigo-950/20 border border-indigo-900/20 rounded-lg text-xs space-y-2">
                              <div className="flex justify-between font-bold text-indigo-300 text-[11px]">
                                <span>سؤال {idx + 1} ({q.points} نقاط)</span>
                                <span className="text-[10px] text-gray-400">{q.type === "multiple_choice" ? "اختيار من متعدد" : "سؤال استدلالي منظم"}</span>
                              </div>
                              <p className="text-gray-200 leading-relaxed font-medium">{q.question}</p>

                              {/* MCQ Options */}
                              {q.type === "multiple_choice" ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {q.options?.map((opt: string) => (
                                    <button
                                      key={opt}
                                      onClick={() => handleSelectOption(q.id, opt)}
                                      className={`p-2 rounded text-right text-[11px] transition duration-150 ${userAnswers[q.id] === opt ? "bg-rose-950/80 border border-rose-500/50 text-white font-bold" : "bg-indigo-950/40 text-gray-400 hover:bg-indigo-950/60"}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                /* Structured Answer Input */
                                <textarea
                                  rows={2}
                                  value={userAnswers[q.id] || ""}
                                  onChange={(e) => handleStructuredAnswer(q.id, e.target.value)}
                                  placeholder="اكتب خلاصة جوابك أو طي النتيجة وحساباتك هنا لمقارنتها بالنموذجي..."
                                  className="w-full bg-[#101430] border border-indigo-900/50 rounded-lg p-2.5 text-white text-xs font-medium focus:outline-none"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* End Exam validation */}
                        <div className="text-center pt-2">
                          <button
                            onClick={handleCompleteExam}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 px-8 rounded-xl transition duration-200 w-full"
                          >
                            إنهاء الامتحان وإرسال حلولك للتقييم ✓
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submitted result report view */}
                    {examSubmitted && examReport && (
                      <div className="mt-5 p-4 bg-[#0d1430] rounded-xl border border-green-500/30 text-right space-y-4">
                        <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs font-bold text-green-400">📊 تقرير وأداء المحاكاة المحتسب</span>
                          <span className="text-xs font-bold text-gray-300">بكالوريا تجريبية</span>
                        </div>

                        <div className="text-center py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <span className="text-xs text-gray-400 block">العلامة التقديرية الحيوية</span>
                          <span className="text-3xl font-black font-mono text-green-400">{examReport.finalGPAOn20} <span className="text-sm font-sans text-gray-500">/ 20</span></span>
                          <p className="text-[10px] text-gray-400 mt-1">كسبت +150 نقطة خبرة لإنهاء الفحص</p>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-3">
                          {examReport.evaluatedQuestions?.map((q: any, idx: number) => (
                            <div key={q.id} className="p-2.5 bg-[#0a0d20] rounded border border-indigo-950 text-xs space-y-1.5">
                              <div className="flex justify-between font-bold">
                                <span className="text-gray-300">سؤال {idx + 1}</span>
                                {q.type === "multiple_choice" ? (
                                  <span className={q.isCorrect ? "text-green-400" : "text-rose-400"}>{q.isCorrect ? "صحيح +5 نقاط" : "غير موفق"}</span>
                                ) : (
                                  <span className="text-indigo-400 font-sans">تقييم ذاتي من {q.points} نقاط</span>
                                )}
                              </div>
                              <p className="text-gray-400">{q.question}</p>
                              {q.userAnswer && <p className="text-gray-300 font-mono text-[11px]"><span className="text-indigo-300">إجابتك:</span> {q.userAnswer}</p>}
                              <div className="p-2 bg-indigo-950/50 rounded border-r-2 border-indigo-500 text-[11px] text-indigo-200">
                                <span className="font-bold text-indigo-300 block mb-0.5">الحل النموذجي المقرر:</span>
                                {q.modelSolution}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => { setExamSubmitted(false); setSimExamData(null); }}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-xl"
                        >
                          إجراء امتحان محاكاة جديد 🔄
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* 4. LESSON EXPLAINER WORKSPACE */}
            {activeSubTab === "explainer" && (
              <div className="space-y-6 text-right">
                
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  مساعد شرح وتبسيط الدروس (Lesson AI Explainer)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  هل تواجه صعوبة في فهم فكرة دقيقة أو حل تمرين بكالوريا معقد؟ اكتب سؤالك أو الصق الفقرة والنظرية، أو قم برفع ملف صورة/PDF للدرس فوراً، ودع الذكاء الاصطناعي يبسط المحور ويعطيك أمثلة نموذجية محلولة.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Explainer Config parameters */}
                  <div className="lg:col-span-1 p-5 bg-[#101431]/30 border border-indigo-900/30 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5">اختر المادة العلمية</label>
                      <select 
                        value={explainSubject}
                        onChange={(e) => setExplainSubject(e.target.value)}
                        className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                      >
                        {SUBJECTS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5">المحور / الدرس المتعلق بالطلب</label>
                      <input 
                        type="text"
                        value={explainTopic}
                        onChange={(e) => setExplainTopic(e.target.value)}
                        placeholder="مثلاً: النهايات والاستمرار"
                        className="w-full bg-[#101430] border border-indigo-900/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>

                    {/* File Dropzone Simulator */}
                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5">رفع صورة الدرس / PDF</label>
                      <div className="border border-dashed border-indigo-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-900/60 transition duration-150 relative">
                        <input 
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleSimulateUpload}
                          className="opacity-0 absolute inset-0 cursor-pointer"
                        />
                        <UploadCloud className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-300 block font-bold">اسحب الملف هنا أو انقر للتصفح</span>
                        <span className="text-[10px] text-gray-500 block">الحد الأقصى 10 ميغابايت (صورة أو مستند ملخص)</span>
                      </div>

                      {/* Display Sim list */}
                      {fileSim && (
                        <div className="mt-3 bg-indigo-950/60 p-2 rounded-lg text-xs space-y-1 text-right">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono text-indigo-300 truncate max-w-[150px]">{fileSim}</span>
                            <span className="text-green-400">{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-indigo-950 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input form query and output explain frame */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5">اكتب سؤالك المباشر أو المحور المراد شرحه بدقة</label>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={explainQuery}
                          onChange={(e) => setExplainQuery(e.target.value)}
                          placeholder="مثال: كيف نقوم بحساب نهاية دالة ناطقة تؤول لما لا نهاية مع توضيح حالة عدم التعيين وإزالتها بأمثلة؟"
                          className="flex-1 bg-[#101430] border border-indigo-900/50 rounded-xl p-3 text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleExplainQuery()}
                          disabled={loading}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 rounded-xl transition duration-200"
                        >
                          {loading ? "جاري الشرح..." : "شرح وتبسيط 🚀"}
                        </button>
                      </div>
                    </div>

                    {/* Explainer Response Display */}
                    {explainerResponse ? (
                      <div className="p-5 bg-gradient-to-br from-[#12183c] to-[#0a0d24] rounded-2xl border border-indigo-500/20 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                        
                        <div className="flex justify-between items-center border-b border-indigo-900/30 pb-2">
                          <span className="text-xs text-indigo-300 font-bold">💡 شرح المدرب الدراسي الذكي للوحدة:</span>
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded">تحسين الفهم</span>
                        </div>

                        {/* Explanation Text */}
                        <div className="text-sm">
                          {formatMarkdown(explainerResponse.explanationText)}
                        </div>

                        {/* Simplified Concept */}
                        <div className="p-3 bg-indigo-950/50 border border-indigo-900/40 rounded-xl text-xs text-[#e0f2fe] leading-relaxed font-medium">
                          {explainerResponse.simplifiedConcept}
                        </div>

                        {/* Worked Example */}
                        <div className="p-4 bg-indigo-950/70 rounded-xl border border-indigo-800/20 text-xs space-y-2">
                          <span className="font-bold text-green-400 block">📝 مثال توضيحي محاك ومحلول:</span>
                          <div className="overflow-x-auto text-gray-300 leading-relaxed">
                            {formatMarkdown(explainerResponse.practicalExample)}
                          </div>
                        </div>

                        {/* Skill practice block */}
                        <div className="p-3 bg-indigo-950/40 border border-dashed border-indigo-800 rounded-xl text-xs space-y-1.5">
                          <span className="font-bold text-yellow-400 block">🎯 تمرين توطيدي فوري مقترح لك:</span>
                          <p className="text-slate-300">{explainerResponse.similarExercise}</p>
                        </div>

                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-indigo-900/40 p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[250px]">
                        <BookOpen className="h-10 w-10 text-indigo-900 mb-2" />
                        <span className="text-xs">في انتظار كتابة سؤالك الأكاديمي أو رفع ملف الشرح لتسريع الاستيعاب.</span>
                        <div className="flex gap-2.5 mt-4">
                          <button onClick={() => handleExplainQuery("كيف أنظم وقتي بين الحفظ والمواد العلمية؟")} className="bg-[#101431]/20 border border-indigo-950 hover:border-indigo-800 text-[11px] text-indigo-300 px-3 py-1.5 rounded-lg">
                            شرح تنظيم الوقت ⏱️
                          </button>
                          <button onClick={() => handleExplainQuery("بسط لي تتابع عملية نسخ الـ DNA في الخلية لتركيب البروتين")} className="bg-[#101431]/20 border border-indigo-950 hover:border-indigo-800 text-[11px] text-indigo-300 px-3 py-1.5 rounded-lg">
                            شرح تركيب البروتين 🧬
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* 5. VIRTUAL CHAT ASSISTANT WORKSPACE */}
            {activeSubTab === "chat" && (
              <div className="space-y-4 text-right flex flex-col justify-between h-[520px]">
                
                {/* Chat Header banner info */}
                <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
                    <h3 className="text-sm font-bold text-white">الناصح الأكاديمي والمدرب المباشر 24h/24</h3>
                  </div>
                  <span className="text-[10px] text-indigo-300">متصل مع معطيات ملفك الدراسي لتقديم إجابة مشخصة</span>
                </div>

                {/* Messages Panel board */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "mr-auto flex-row-reverse text-left" : "ml-auto text-right"}`}
                    >
                      <div className={`p-2.5 rounded-2xl text-xs md:text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tl-none font-medium" : "bg-indigo-950/40 border border-indigo-900/30 text-gray-300 rounded-tr-none"}`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <span className="text-[9px] text-indigo-300 block font-mono mt-1 text-right">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="ml-auto text-right">
                      <div className="bg-indigo-950/20 border border-indigo-900/20 p-2.5 rounded-2xl rounded-tr-none text-xs text-gray-400 inline-block animate-pulse">
                        جاري صياغة النصائح والإجابة على الأهداف... ✍️
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick suggestions questions shelf */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-950">
                  <button onClick={() => handleQuickSubjectQuestion("كيف أرفع معدلي في الفيزياء في الثلاثي الأخير؟")} className="bg-[#101431]/40 hover:bg-indigo-900 text-[10px] text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-950">
                    كيف أرفع معدلي في الفيزياء؟ 📈
                  </button>
                  <button onClick={() => handleQuickSubjectQuestion("ماذا أراجع هذا الأسبوع لمواكبة البكالوريا؟")} className="bg-[#101431]/40 hover:bg-indigo-900 text-[10px] text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-950">
                    ماذا أراجع هذا الأسبوع؟ 📆
                  </button>
                  <button onClick={() => handleQuickSubjectQuestion("أشعر ببعض القلق والتوتر من مادة الفلسفة كيف أتعامل معها؟")} className="bg-[#101431]/40 hover:bg-indigo-900 text-[10px] text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-950">
                    تبديد قلق الفلسفة 🛡️
                  </button>
                </div>

                {/* Send chat entry input bar */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالتك لمدربك الأكاديمي هنا..."
                    className="flex-1 bg-[#101430] border border-indigo-900/50 rounded-xl px-4 py-3 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition duration-200"
                  >
                    إرسال
                  </button>
                </form>

              </div>
            )}

            {/* 6. ADMIN PANEL WORKSPACE */}
            {activeSubTab === "admin" && (
              <div className="space-y-6 text-right">
                
                <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-indigo-950 pb-3 mb-4">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  لوحة الإدارة والإشراف على المناهج والمعدلات المرجعية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* AI prompts weights configuration */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-900/20 rounded-2xl space-y-4">
                    <span className="text-xs font-bold text-indigo-300 block mb-1">إعدادات محددات التوجيه ونزاهة الذكاء ⚙️</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>قوة معامل التوجيه ومطابقة شعبة البكالوريا</span>
                        <span className="font-mono text-indigo-300 font-bold">{aiPromptWeight * 100}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1.0" 
                        step="0.05"
                        value={aiPromptWeight}
                        onChange={(e) => {
                          setAiPromptWeight(Number(e.target.value));
                          setAdminStatusLog("تم تحديث معامل التوجيه ومطابقة شعب بكالوريا الجزائر بنجاح.");
                        }}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] text-gray-500 block">المناهج والروابط المدرجة</span>
                        <input 
                          type="number"
                          value={activeCurriculumsCount}
                          onChange={(e) => {
                            setActiveCurriculumsCount(Number(e.target.value));
                            setAdminStatusLog(`تغيير عدد المناهج الفعالة في المنظومة إلى ${e.target.value}.`);
                          }}
                          className="w-full bg-[#101430] border border-indigo-900/50 rounded-lg p-1.5 text-white text-xs mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block">سلامة معالجات الخادم</span>
                        <input 
                          type="text"
                          value={systemIntegrities}
                          onChange={(e) => setSystemIntegrities(e.target.value)}
                          className="w-full bg-[#101430] border border-indigo-900/50 rounded-lg p-1.5 text-white text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="bg-[#050917] p-2.5 rounded border border-indigo-950 text-[10px] font-mono text-indigo-300 space-y-1">
                      <span className="text-gray-500 block">سجل الإدارة الحالي:</span>
                      <p>{adminStatusLog}</p>
                    </div>
                  </div>

                  {/* Sample curiculum subjects listed */}
                  <div className="p-5 bg-indigo-950/20 border border-indigo-900/20 rounded-2xl text-right">
                    <span className="text-xs font-bold text-indigo-300 block mb-3">إدارة النماذج والحلول النموذجية المرجعية</span>
                    
                    <div className="space-y-3">
                      {sampleExercisesTemplates.map((tmpl) => (
                        <div key={tmpl.id} className="flex justify-between items-center bg-[#070b1e]/60 p-2 border border-indigo-950 rounded-lg text-xs">
                          <div>
                            <span className="font-bold text-white block">{tmpl.topic}</span>
                            <span className="text-[10px] text-indigo-400 mt-0.5 inline-block">{tmpl.subject} - {tmpl.type}</span>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                setSampleExercisesTemplates(prev => prev.filter(t => t.id !== tmpl.id));
                                setAdminStatusLog(`تم حذف النموذج المرجعي: ${tmpl.topic}`);
                              }}
                              className="text-rose-500 hover:text-rose-400 p-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add curriculum mockup triggers */}
                      <button 
                        onClick={() => {
                          const customTopic = prompt("أدخل عنوان الدرس النموذجي:");
                          if (customTopic) {
                            setSampleExercisesTemplates(prev => [...prev, { id: `tmpl_${Date.now()}`, subject: "الفيزياء", topic: customTopic, type: "بكالوريا 2026" }]);
                            setAdminStatusLog("تم تسجيل نموذج محاكاة جديد.");
                          }
                        }}
                        className="w-full bg-indigo-900/30 hover:bg-indigo-900 border border-indigo-800 text-white text-xs py-1.5 rounded-xl transition font-bold"
                      >
                        إدراج معيار محاكاة أو وضعية نموذجية ➕
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
