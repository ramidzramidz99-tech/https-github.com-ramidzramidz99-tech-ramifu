/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import specialties list from memory to reference on server side
// Note: We'll construct a simplified version here to keep the server self-contained or import directly
// Since we are compiling server.ts with esbuild, we can import or mirror the specialties
import { SPECIALTIES } from "./src/data";

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully!");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. Using smart local rule-based system as fallback.");
}

// ---------------------- API PATHS ----------------------

// 1. Health check & configuration status
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!ai,
    localTime: new Date().toISOString()
  });
});

// Helper for local rule-based recommendations fallback
function generateLocalFallbacks(grade: number, stream: string, answers: any) {
  // Find eligible specialties
  const eligible = SPECIALTIES.filter(spec => (spec.minGrades as any)[stream] !== undefined && grade >= (spec.minGrades as any)[stream]);
  
  const recommendations = SPECIALTIES.map(spec => {
    const isEligible = (spec.minGrades as any)[stream] !== undefined && grade >= (spec.minGrades as any)[stream];
    let score = 50;
    
    // Heuristic compatibility scoring
    if (answers.subjects && answers.subjects.length > 0) {
      if (spec.category.includes("إعلام") && answers.subjects.includes("الفيزياء")) score += 20;
      if (spec.category.includes("طبية") && answers.subjects.includes("العلوم الطبيعية")) score += 30;
      if (spec.category.includes("اقتصاد") && answers.subjects.includes("الرياضيات")) score += 20;
      if (spec.category.includes("لغات") && answers.subjects.includes("اللغات الأجنبية")) score += 30;
      if (spec.category.includes("تربية") && answers.subjects.includes("العلوم الإسلامية")) score += 15;
    }
    
    if (answers.workPreference === "field" && spec.category.includes("دقيقة وتقنية")) score += 15;
    if (answers.lovesCoding === "yes" && spec.category.includes("إعلام آلي")) score += 35;
    if (answers.lovesHelpingPeople === "yes" && spec.category.includes("طبية")) score += 25;
    if (answers.businessOriented === "yes" && spec.category.includes("اقتصاد")) score += 30;

    score = Math.min(98, Math.max(15, score));
    
    let recommendationLevel: "ممتاز" | "جيد" | "غير موصى به" = "جيد";
    if (!isEligible) {
      recommendationLevel = "غير موصى به";
      score = Math.max(10, score - 35);
    } else if (score >= 75) {
      recommendationLevel = "ممتاز";
    }

    let reason = "";
    if (!isEligible) {
      reason = `معدلك الحالي (${grade}) أقل من المعدل المرجعي للقبول في السنوات السابقة لهذا التخصص.`;
    } else {
      reason = `يتوافق هذا التخصص مع اهتماماتك في المواد العلمية والمهارات العملية التي أدخلتها بالاختبار بنسبة عالية.`;
    }

    return {
      specialtyId: spec.id,
      compatibilityScore: score,
      recommendationLevel,
      reason
    };
  });

  return {
    recommendations,
    report: {
      strengths: [
        "حب التعلم المستمر والاستكشاف المعرفي",
        answers.workPreference === "field" ? "التفضيل للأعمال الميدانية والحركة" : "القدرة والارتياح للعمل والتركيز المكتبي المنظم",
        answers.lovesCoding === "yes" ? "التفكير المنطقي والرياضي العالي" : "القدرة على التواصل وحل المشكلات الإنسانية"
      ],
      potentialSkills: [
        "القدرة البحثية المستقلة وتدقيق المعلومات",
        answers.businessOriented === "yes" ? "إعداد دراسات الجدوى والتحليل التجاري وصناعة الفرص" : "القدرة على العمل الجماعي وحل النزاعات الفكرية"
      ],
      preferredFields: [
        answers.lovesCoding === "yes" ? "التكنولوجيا والبرمجيات الذكية" : "التسيير المالي والقانوني وإدارة الأعمال والناس",
        answers.lovesHelpingPeople === "yes" ? "الرعاية الصحية، الطب، ومساعدة المجتمع" : "البحوث التحليلية والتطويرية والمشاريع"
      ],
      topSpecialties: eligible.slice(0, 3).map(s => s.name),
      futureJobs: [
        answers.lovesCoding === "yes" ? "مطور برمجيات مستقل أو مستشار تقني" : "مستشار تطوير وإداري بالمؤسسات الخدمية",
        "مدير مشاريع حديثة وريادة الأعمال"
      ],
      developmentTips: [
        "تنمية مهارات اللغة الإنجليزية لفتح آفاق أكبر في المراجع العالمية ودراسات الماستر والدكتوراه.",
        "الانخراط في النشاط الجمعوي الطلابي لتطوير المهارات الناعمة (Soft Skills) وتوسيع شبكة المعارف.",
        "التدرب مبكراً على مهارات العمل المستقل وصناعة المشاريع الذاتية."
      ]
    }
  };
}

// 2. Perform AI-powered Quiz analysis using Gemini Schema
app.post("/api/smart-quiz", async (req, res) => {
  const { grade, stream, answers } = req.body;

  if (!grade || !stream || !answers) {
    res.status(400).json({ error: "Missing required orientation inputs" });
    return;
  }

  // If Gemini client is not initialized, fallback to rule-based logic instantly
  if (!ai) {
    console.log("No Gemini API client configured. Serving local recommendations model.");
    const result = generateLocalFallbacks(grade, stream, answers);
    res.json(result);
    return;
  }

  try {
    const prompt = `أنت المستشار المهني والجامعي الجزائري الذكي.
قم بتحليل بيانات الطالب المهنية والدراسية الحالية:
- معدل البكالوريا: ${grade}/20
- الشعبة: ${stream}
- إجابات الطالب في اختبار الميول والاهتمامات:
  1. المواد المفضلة: ${answers.subjects ? answers.subjects.join("، ") : "غير محددة"}
  2. بيئة العمل المفضلة: ${answers.workPreference === "office" ? "مكتبي منظم" : "ميداني وحركي وحر"}
  3. هل يحب البرمجة والتكنولوجيا: ${answers.lovesCoding}
  4. هل يحب مساعدة الناس والتعامل المباشر: ${answers.lovesHelpingPeople}
  5. هل يرغب في إنشاء مشروع خاص (ريادة الأعمال): ${answers.businessOriented}
  6. مهنة المستقبل التي يحلم بها: "${answers.dreamCareer || "غير محددة"}"

الرجاء المطابقة مع قائمة التخصصات الجامعية الجزائرية المتوفرة في برنامجنا حصراً:
${JSON.stringify(SPECIALTIES.map(s => ({ id: s.id, name: s.name, category: s.category, minGrades: s.minGrades })), null, 2)}

أوجد بدقة لكل تخصص من التخصصات المتاحة بالمطابقة مع معرفاتهم (med, dent, phar, esi, ensia, mi, st, enst, hydro, commerce, esc, ens, english, translate, law, arch, biotech, arabic):
- معرّف التخصص الأصح.
- نسبة توافق مع شخصية واهتمامات الطالب (عدد من 0 لـ 100).
- تحديد مستوى التوصية: 'ممتاز' إذا كان يتوافق بشدة مع إجاباته ومعدله يفوق معدل القبول بكثير، 'جيد' إذا كان خياراً جيداً، 'غير موصى به' إذا كان معدله لا يسمح أبداً أو غير متوافق تماماً مع ميوله.
- صياغة سبب باللغة العربية مقنع وجذاب وواقعي يعبر عن الطالب بناءً على إجابات الكويز.

توليد تقرير شامل للطالب يتضمن:
- نقاط القوة (strengths).
- المهارات المتوقعة (potentialSkills).
- المجالات المهنية المفضلة له (preferredFields).
- تسميات أفضل التخصصات المقترحة بناء على ميوله ومعدله (topSpecialties).
- وظائف المستقبل المقترحة له في الجزائر (futureJobs).
- نصائح لتطوير المهارات للنجاح الأكاديمي والمهني بالجامعة الجزائرية (developmentTips).`;

    // System instruction and configurations
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت مستشار توجيه جامعي مهني جزائري خبير ودقيق. قم بإرجاع النتيجة حصراً بصيغة JSON مطابقة تماماً للمخطط الهيكلي المطلوب.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: "توصيات متطابقة مع كافة معرفات التخصصات الـ 17 المتاحة لدينا.",
              items: {
                type: Type.OBJECT,
                properties: {
                  specialtyId: { type: Type.STRING, description: "معرّف التخصّص المناسب (مثل: med, esi, st...)" },
                  compatibilityScore: { type: Type.INTEGER, description: "نسبة التوافق المئوية مع المعطيات من 0 إلى 100" },
                  recommendationLevel: { type: Type.STRING, description: "مستوى التوصية للأجواء الجزائرية ودراسته (ممتاز، جيد، غير موصى به)" },
                  reason: { type: Type.STRING, description: "العلة المنطقية الموجهة للطالب بلغة عربية سلسلة ومحفزة بناءً على اهتماماته الشخصية وتوافقه الإبداعي." }
                },
                required: ["specialtyId", "compatibilityScore", "recommendationLevel", "reason"]
              }
            },
            report: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "نقاط القوة المهنية" },
                potentialSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "المهارات المتوقعة الكامنة" },
                preferredFields: { type: Type.ARRAY, items: { type: Type.STRING }, description: "المجالات الدراسية الأفضل" },
                topSpecialties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "أهم مقترحات التخصصات" },
                futureJobs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "خانات وطبائع المهن المستقبلية" },
                developmentTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "أحسن النصائح لتطوير المهارات والنجاح الجامعي" }
              },
              required: ["strengths", "potentialSkills", "preferredFields", "topSpecialties", "futureJobs", "developmentTips"]
            }
          },
          required: ["recommendations", "report"]
        }
      }
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput.trim());
    res.json(parsedData);

  } catch (error) {
    console.error("Gemini Orientation Quiz Error:", error);
    // Serve fallback gracefully
    const fallbackResult = generateLocalFallbacks(grade, stream, answers);
    res.json(fallbackResult);
  }
});

// Helper for local simulation fallback
function generateSimulationFallback(specialtyId: string, universityName: string, academicLevel: string, targetCountry: string) {
  const spec = SPECIALTIES.find(s => s.id === specialtyId) || SPECIALTIES[0];
  const uName = universityName || "المؤسسة الجامعية الموجه إليها";
  const country = targetCountry || "الجزائر";
  
  // Custom generation depending on specialty ID
  const isTech = spec.category.includes("إعلام") || spec.category.includes("تقن") || spec.id === "esi" || spec.id === "ensia";
  const isMed = spec.category.includes("طب") || spec.id === "med" || spec.id === "dent" || spec.id === "phar";
  const isEco = spec.category.includes("اقتصاد") || spec.id === "commerce" || spec.id === "esc";
  const isLang = spec.category.includes("لغات") || spec.id === "english" || spec.id === "translate";
  
  let entrySal = "45,000 دج";
  let fiveSal = "85,000 دج";
  let tenSal = "150,000 دج";
  let maxPot = "300,000 دج +";
  
  if (isMed) {
    entrySal = "75,000 دج";
    fiveSal = "130,000 دج";
    tenSal = "220,000 دج";
    maxPot = "500,000 دج";
  } else if (isTech) {
    entrySal = "65,000 دج";
    fiveSal = "120,000 دج";
    tenSal = "250,000 دج";
    maxPot = "800,000 دج";
  } else if (isEco) {
    entrySal = "50,000 دج";
    fiveSal = "95,000 دج";
    tenSal = "180,000 دج";
    maxPot = "400,000 دج";
  }
  
  if (country !== "الجزائر") {
    entrySal = "1,500 $";
    fiveSal = "3,200 $";
    tenSal = "5,500 $";
    maxPot = "12,000 $";
  }

  return {
    specialtyId: spec.id,
    specialtyName: spec.name,
    universityName: uName,
    academicLevel,
    targetCountry: country,
    academicPath: {
      firstYear: {
        subjects: spec.subjects.slice(0, 3).concat(["منهجية البحث العلمي", "اللغة الإنجليزية علمية"]),
        skills: ["الأسس المعرفية والنظرية للتخصص", "التحليل والاستنتاج المنطقي", "تنظيم ساعات الدراسة الذاتية والتأقلم الجامعي"],
        difficulty: spec.difficulty === "مرتفع جداً" ? "مرتفع جداً" : "متوسط إلى مرتفع"
      },
      subsequentYears: {
        subSpecialties: isTech ? ["الذكاء الاصطناعي والتعلم الآلي", "هندسة البرمجيات المعقدة", "الأمن السيبراني والشبكات"] : isMed ? ["التخصص الطبي المقيم", "الصحة العامة والتسيير الطبي", "الأبحاث الكلينيكية"] : ["التدقيق والرقابة المالية", "التسويق الرقمي وإدارة المنتجات", "التجارة الدولية"],
        projects: ["شجرة التحليل النظري المتكامل", "مشروع نهاية السداسي التطبيقي", "مذكرة التخرج الميدانية (مؤسسة/جامعة)"],
        internships: ["تربص مغلق بمؤسسة استشفائية أو اقتصادية جزائرية", "معايشة واقعية للعمل الميداني والتقني ومخالطة المهنيين"]
      },
      afterGraduation: {
        degrees: [`شهادة ${academicLevel} في ${spec.name.split(" (")[0]}`],
        trainings: ["دورات تدريبية مكثفة في الريادة وإدارة الأعمال", "المهارات الناعمة (التفاوض، القيادة، والاتصال المهني)"],
        certificates: isTech ? ["AWS Certified Security Practitioner", "Google Cloud Associate developer", "Cisco CCNA License"] : isEco ? ["CFA Analyst Level I", "PMP Project Management Cert"] : ["TOEFL/IELTS Advanced Level Certificate"]
      }
    },
    careerPath: {
      steps: [
        {
          stage: "طالب",
          duration: `${spec.durationYears} سنوات`,
          skillsRequired: ["الالتزام بالجدول الأكاديمي الشامل", "كسب حد من المهارات التكنولوجية الجانبية"],
          opportunities: ["الحل الأمثل في الانضمام للنوادي العلمية النشطة بالجامعة"]
        },
        {
          stage: "متخرج",
          duration: "6 أشهر - سنة",
          skillsRequired: ["سيرة ذاتية احترافية باللغتين الإنجليزية والفرنسية", "بناء ملف أعمال تطبيقية مقنع"],
          opportunities: ["برامج التدريب والتأهيل قبل التوظيف المفتوحة للقطاعات"]
        },
        {
          stage: "موظف مبتدئ",
          duration: "1 - 3 سنوات",
          skillsRequired: ["كفاءة عالية بمعالجة المهام الروتينية المنوطة بالقسم", "بناء سمعة السلوك المرن والصادق والجهد الإضافي"],
          opportunities: ["الترقية لدرجة مهندس أو أخصائي أول للنشطين مبكراً"]
        },
        {
          stage: "موظف محترف",
          duration: "3 - 6 سنوات",
          skillsRequired: ["الاستقلالية التامة في تخطيط وحل الأزمات والمهام المعقدة", "حيازة تراخيص واعتمادات دولية في تخصصك"],
          opportunities: ["تولي قيادة وتنسيق مشروع فرعي أو قيادة فريق صغير"]
        },
        {
          stage: "خبير",
          duration: "6 - 10 سنوات",
          skillsRequired: ["رسم دراسات إستراتيجية عالية القيمة والعمق للمؤسسة", "توجيه وتدريب الفرق والتحليل النوعي الشامل"],
          opportunities: ["حوافز مادية استشارية وعلاوات إنتاجية قياسية وممتازة"]
        },
        {
          stage: "مدير",
          duration: "10+ سنوات",
          skillsRequired: ["أدوات القيادة وإدارة النزاعات المعقدة في بيئة العمل", "تأمين سير مؤشرات الأداء الحيوية (Key Metrics)"],
          opportunities: ["التربع في مجلس الإدارة التنفيذي للمؤسسة أو تمثيل خارجي للشركة"]
        },
        {
          stage: "صاحب شركة",
          duration: "توقيت مرن",
          skillsRequired: ["إدارة التدفقات النقدية، المجازفة المدروسة والتمويل المالي", "كسب ثقة المستثمرين والشراكات المعرفية الاستراتيجية"],
          opportunities: ["السيادة الريادية المطلقة وتحقيق أثر اقتصادي وخلق مناصب شغل"]
        }
      ]
    },
    futureJobs: [
      {
        title: isTech ? "مهندس حلول برمجية ومطور متكامل" : isMed ? "طبيب ممارس مستقل بالعيادة الخاصة" : "أخصائي تحليل بيانات مالية وتجارية",
        type: "مباشر",
        description: "ممارسة العمل التطبيقي الروتيني واليومي لتفعيل المخرجات الأكاديمية وصناعة ملف الخبرة.",
        skills: isTech ? ["JavaScript", "Python", "Problem Solving"] : isMed ? ["Diagnosis", "Clinical skills", "Communication"] : ["Excel Pro", "Financial modeling", "Accounting"],
        demand: "🔥 مرتفع جداً",
        competition: "متوسطة"
      },
      {
        title: isTech ? "مدير تكنولوجي أول ومدير بنية تحتية رقمية" : isMed ? "رئيس دافع للقسم الطبي بالمؤسسة الصحية" : "مدير مالي وإداري رئيسي للشركة (CFO)",
        type: "بعد خبرة",
        description: "إدارة الإستراتيجية الفنية بالكامل للقسم، التوجيه الاستشاري وتوسيع آفاق المشاريع القائمة.",
        skills: ["System Architecture", "Leadership", "Risk Management"],
        demand: "⚡️ مرتفع ومطلوب بشدة",
        competition: "منخفضة (تعتمد على الكفاءة والخبرة)"
      },
      {
        title: isTech ? "مستشار تكنولوجي ومطور حر للشركات الأجنبية" : isMed ? "كاتب ومستشار علمي وصحي دولي مستقل" : "مستشار دراسات جدوى تجارية واقتصادية للمشاريع ناشئة",
        type: "عمل حر",
        description: "العمل بشكل مستقل كلياً عبر منصات العمل الحر العالمية وبناء شبكة عملاء دولية تضمن دخلاً حراً مميزاً.",
        skills: ["Self Marketing", "SaaS Delivery", "English Fluency"],
        demand: "📈 صاعد بقوة",
        competition: "مرتفعة (تتطلب سيرة ممتازة)"
      },
      {
        title: isTech ? "مؤسس شركة برمجية ناشئة تقدم حلول ويب وذكاء اصطناعي" : isMed ? "مؤسس مركز طبي أو شركة أجهزة طبية خاصة" : "مؤسس وكالة استشارات جمركية أو مالية وطنية",
        type: "شركة خاصة",
        description: "صناعة مشروع استثماري حقيقي والتحول من خانة التوظيف إلى خلق مناصب للشغل وزيادة القيمة المضافة الوطنية.",
        skills: ["Product Management", "VC Pitching", "Team Building"],
        demand: "✨ بديل إستراتيجي واعد",
        competition: "مدارة بنظام التنافسية وحجم الابتكار"
      }
    ],
    incomeSimulation: {
      currency: country === "الجزائر" ? "دينار جزائري (دج)" : "دولار أمريكي ($)",
      entrySalary: entrySal,
      fiveYearsSalary: fiveSal,
      tenYearsSalary: tenSal,
      maxPotential: maxPot,
      notes: "جميع الرواتب المذكورة هي أرقام تقديرية قابلة للتغيير والزيادة بشكل ملحوظ بناءً على درجة الكفاءة والامتياز المهني ومستوى التكوين الشخصي وصعوبة المهام."
    },
    predictiveInsights: {
      marketTrends: [
        "التحول الشامل والواسع نحو رقمنة الإدارات والمؤسسات الجزائرية كلياً.",
        "الطلب المتصاعد على الكفاءات المتحدثة باللغات الأجنبية خاصة الإنجليزية."
      ],
      risingSpecialties: isTech ? ["هندسة الحوسبة السحابية وأمن الحوسبة الطرفية", "خوارزميات التعلم المعزز والبيانات الكبيرة"] : ["الطب الشخصي، الجينوم والتطبيقات المخبرية الوراثية الحديثة"],
      futureSkills: ["مهارات إدارة أدوات الذكاء الاصطناعي التوليدي والبرمجيات الذكية والأتمتة", "المرونة الفكرية والتعلم السريع المستقل لمجاراة التقدم المعرفي"],
      growingSectors: ["تكنولوجيا المعلومات والاتصالات ورقمنة سبل التجارة", "قطاعات الطاقة المتجددة والهيدروجين الأخضر بالجنوب والهضاب"],
      successProbabilityReport: `بناءً على اختيارك لتخصص ${spec.name} ودراسته في ${uName || "مؤسسات الوطن"} والعمل مستقبلاً في ${country}، فإن فرص نجاحك وتقاطعك مع الطلب الصاعد بسوق العمل تقدر بـ 94%. ننصحك بعدم الاكتفاء بالمقررات الأكاديمية والتركيز الشديد على المهارات الجانبية وإتقان اللغات الأجنبية كعامل مفصلي في بناء مسار ريادي وناجح.`
    }
  };
}

// 2.5. Route to simulation engine
app.post("/api/future-simulator", async (req, res) => {
  const { specialtyId, universityName, academicLevel, targetCountry } = req.body;

  if (!specialtyId) {
    res.status(400).json({ error: "Missing required specialty identifier" });
    return;
  }

  const spec = SPECIALTIES.find(s => s.id === specialtyId) || SPECIALTIES[0];
  const uName = universityName || "الجامعة الجزائرية";
  const level = academicLevel || "ليسانس";
  const country = targetCountry || "الجزائر";

  if (!ai) {
    console.log("No Gemini API client configured for Future Simulator. Serving offline model.");
    const fallback = generateSimulationFallback(specialtyId, uName, level, country);
    res.json(fallback);
    return;
  }

  try {
    const prompt = `أنت نظام التنبؤ ومحاكاة المستقبل المهني والأكاديمي الجزائري الذكي المدمج بالمنصة.
قم بمحاكاة مستقبل دراسي ومهني تفصيلي ومحدد ومقنع لطالب بكالوريا جزائري اختار دراسة:
- التخصص: ${spec.name} (رمز: ${spec.code}، مدته المقررة: ${spec.durationYears} سنوات، فئة: ${spec.category})
- الجامعة المستهدفة: ${uName}
- المستوى الدراسي المنشود: ${level} (ليسانس أو ماستر أو دكتوراه)
- الدولة المستهدفة للعمل مهنيًا مستقبلاً: ${country}

الرجاء إنشاء استجابة JSON دقيقة وثرية باللغة العربية كلياً تماثل المخطط المحدد تماماً لتعطي محاكاة حقيقية وواقعية تبعث الشغف بالطالب وحيادية بنسبة 100%:
- المسار الدراسي (السنة الأولى موادها الأساسية، مهاراتها المكتسبة، صعوبتها؛ السنوات اللاحقة تخصصاتها، مشاريعها، تربصاتها؛ ما بعد التخرج شهادات، تدريبات وكورسات إضافية، رخص مهنية)
- المسار المهني التفاعلي (يغطي 7 مراحل بنفس الترتيب: طالب، متخرج، موظف مبتدئ، موظف محترف، خبير، مدير، صاحب شركة؛ مع تقديم المدة، المهارات المطلوبة والنصائح وفرص التقدم لكل منها)
- وظائف المستقبل المقترحة (أربع وظائف مصنفة حسب الأنواع: 'مباشر'، 'بعد خبرة'، 'عمل حر'، 'شركة خاصة' مع الوصف والمهارات المحددة ومستوى المنافسة والطلب)
- محاكاة الدخل (رواتب حقيقية تتماشى مع عملة البلد المتوقع بمسار تدرجي من البداية لـ 5 سنوات لـ 10 سنوات لأعلى حد دخل ونقاط توضيحية هامة)
- الذكاء الاصطناعي التنبؤي (اتجاهات السوق الحديثة، التخصصات الصاعدة من هذا الفرع، المهارات المستقبلية الأساسية، القطاعات الآخذة بالنمو، تقرير نهائي محفز وموضوعي ومفصل)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت نظام محاكاة مهني جزائري رائد. قم بإرجاع بيانات المحاكاة حصراً بصيغة JSON متجانسة ومتكاملة تماماً مع النموذج الهيكلي المخصص.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specialtyId: { type: Type.STRING },
            specialtyName: { type: Type.STRING },
            universityName: { type: Type.STRING },
            academicLevel: { type: Type.STRING },
            targetCountry: { type: Type.STRING },
            academicPath: {
              type: Type.OBJECT,
              properties: {
                firstYear: {
                  type: Type.OBJECT,
                  properties: {
                    subjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING }
                  },
                  required: ["subjects", "skills", "difficulty"]
                },
                subsequentYears: {
                  type: Type.OBJECT,
                  properties: {
                    subSpecialties: { type: Type.ARRAY, items: { type: Type.STRING } },
                    projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    internships: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["subSpecialties", "projects", "internships"]
                },
                afterGraduation: {
                  type: Type.OBJECT,
                  properties: {
                    degrees: { type: Type.ARRAY, items: { type: Type.STRING } },
                    trainings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    certificates: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["degrees", "trainings", "certificates"]
                }
              },
              required: ["firstYear", "subsequentYears", "afterGraduation"]
            },
            careerPath: {
              type: Type.OBJECT,
              properties: {
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stage: { type: Type.STRING, description: "اسم المرحلة: طالب، متخرج، موظف مبتدئ، موظف محترف، خبير، مدير، صاحب شركة" },
                      duration: { type: Type.STRING },
                      skillsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
                      opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["stage", "duration", "skillsRequired", "opportunities"]
                  }
                }
              },
              required: ["steps"]
            },
            futureJobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: "نوع الوظيفة: مباشر، بعد خبرة، عمل حر، شركة خاصة" },
                  description: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  demand: { type: Type.STRING },
                  competition: { type: Type.STRING }
                },
                required: ["title", "type", "description", "skills", "demand", "competition"]
              }
            },
            incomeSimulation: {
              type: Type.OBJECT,
              properties: {
                currency: { type: Type.STRING },
                entrySalary: { type: Type.STRING },
                fiveYearsSalary: { type: Type.STRING },
                tenYearsSalary: { type: Type.STRING },
                maxPotential: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ["currency", "entrySalary", "fiveYearsSalary", "tenYearsSalary", "maxPotential", "notes"]
            },
            predictiveInsights: {
              type: Type.OBJECT,
              properties: {
                marketTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
                risingSpecialties: { type: Type.ARRAY, items: { type: Type.STRING } },
                futureSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                growingSectors: { type: Type.ARRAY, items: { type: Type.STRING } },
                successProbabilityReport: { type: Type.STRING }
              },
              required: ["marketTrends", "risingSpecialties", "futureSkills", "growingSectors", "successProbabilityReport"]
            }
          },
          required: [
            "specialtyId",
            "specialtyName",
            "universityName",
            "academicLevel",
            "targetCountry",
            "academicPath",
            "careerPath",
            "futureJobs",
            "incomeSimulation",
            "predictiveInsights"
          ]
        }
      }
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput.trim());
    res.json(parsedData);

  } catch (error) {
    console.error("Gemini Future Simulator Error:", error);
    const fallback = generateSimulationFallback(specialtyId, uName, level, country);
    res.json(fallback);
  }
});

// 3. Interactive assistant chatbot
app.post("/api/chatbot", async (req, res) => {
  const { messages, grade, stream, wilaya } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing or invalid chat messages content" });
    return;
  }

  // Format chat contextual template
  const studentMeta = `المعدّل الحالي: ${grade || "غير محدد"}، شعبة البكالوريا: ${stream || "غير محددة"}، الولاية الجغرافية: ${wilaya || "غير محددة"}.`;

  const systemInstruction = `أنت "المستشار الجامعي الجزائري الذكي"، خبير متميز وناصح أمين في نظام التوجيه الجامعي الجزائري ومعدلات القبول بالبكالوريا وأساليب اختيار التخصصات.
أنت تساعد الطلاب الجزائريين والناجحين الجدد في اختيار ممراتهم الدراسية باحترافية وبشاشة واحترام تام.
معلومات الطالب الحالية لتقديم مشورة دقيقة ومخصصة: ${studentMeta}

تتضمن معلومات التخصصات المتاحة وطبيعتها ببلدنا الجزائر ما يلي:
${JSON.stringify(SPECIALTIES.map(s => ({
  id: s.id,
  code: s.code,
  name: s.name,
  category: s.category,
  minGrades: s.minGrades,
  durationYears: s.durationYears,
  difficulty: s.difficulty,
  description: s.description,
  approxSalaryRange: s.approxSalaryRange,
  freelancePotential: s.freelancePotential
})), null, 2)}

ملاحظات توجيهية هامة جداً:
1. التزم بالنصح الواقعي والمبني على البيانات المتاحة والفرص الحالية بالجزائر.
2. وجههم لتقدير المجهودات الدراسية وحاجة سوق العمل المحلي للرقمنة، التكنولوجيا، العلوم الطبية، التعليم واللغات.
3. تفاعل معهم بلهجة عربية واضحة ومحببة يلفها الاحترام والدعم مع استعمال بعض الكلمات اللطيفة المألوفة محلياً (مثل: مبروك الباك، التوفيق، شعبة ممتازة، جذع مشترك).
4. تفادى التعقيد وشجّعهم واستعن ببيانات التخصصات في إعطاء مزايا مفصلة وذكية.`;

  // Use simple fallback static assistant if Gemini isn't present
  if (!ai) {
    const lastMsg = messages[messages.length - 1];
    const userText = lastMsg.text || "";
    
    // Quick keyword matching for basic helpful responses
    let answer = `مرحباً بك! أنا المستشار الجامعي الذكي (حالياً أعمل بنظام التوجيه بالقواعد المحلية). \n\nيعتبر معدلك الحالي **${grade || "12"}** في شعبة **${stream || "علوم تجريبية"}** ممتازًا ومؤهلًا لعدة منافذ هامة. \n\n`;
    if (userText.includes("تكنولوجيا") || userText.includes("إعلام") || userText.includes("برمجة") || userText.includes("كمبيوتر")) {
      answer += `بناءً على اهتمامك بالتكنولوجيا، أنصحك بشدة بالتفكير في التخصصات الرقمية المتاحة مثل **الرياضيات والإعلام الآلي (MI)** أو المدارس التكنولوجية المتطورة إن وافقها معدلك. يتيح لك هذا المسار التفوق بشكل كبير ومجال العمل الحر فيه ممتاز جداً في الجزائر وخارجها!`;
    } else if (userText.includes("طب") || userText.includes("صحة") || userText.includes("صيدلة")) {
      answer += `إن التخصصات الطبية والصحية (مثل دكتور في الطب أو طب الأسنان أو الصيدلة) تتطلب كفاحاً ومعدلات قبول عالية تفوق الـ 15.5 أو 16 عادةً، ولكنها توفر عملاً إنسانياً نبيلاً ومكفولاً واستقراراً مهنياً ممتازاً.`;
    } else if (userText.includes("لغات") || userText.includes("إنجليزية") || userText.includes("ترجمة")) {
      answer += `دراسة لغات أجنبية أو العلوم اللغوية مثل الإنجليزية والترجمة ممتازة جداً حالياً وتفتح لك أبواب العمل بمكاتب الترجمة والشركات المتعددة الجنسيات والتعليم الفردي والحر كصانع محتوى متميز.`;
    } else if (userText.includes("اقتصاد") || userText.includes("تجارة") || userText.includes("تسيير")) {
      answer += `العلوم التجارية والمالية والتسيير خيار مرن للغاية ومناسب لرياديي الأعمال وعشاق الاستثمار وتسيير المؤسسات. كما أن المدارس العليا للتجارة بالقليعة تقدم تعليماً راقياً ونخبوياً ومعدل القبول فيها قرابة الـ 13.5 إلى 14.5.`;
    } else {
      answer += `أنصحك بالبدء بملء "معدل البكالوريا" والشعبة في الواجهة، ثم أخذ "اختبار المستشار المهني الذكي" القصير لنقترح لك قائمة تخصصات مخصصة بدقة ومطابقة لميولك! \n\nأخبرني، هل تفضل الجوانب التقنية الصرفة أم العمل الإنساني والتعامل واللغات؟ أنا هنا لمساعدتك دائماً!`;
    }
    
    res.json({
      role: "model",
      text: answer,
      timestamp: new Date().toLocaleTimeString('ar-DZ')
    });
    return;
  }

  try {
    // Map existing messages to correct Gemini Chat/sendMessage API format
    // Since we are talking to a conversational model, we can trigger ai.models.generateContent containing the dialogue history to yield streaming/non-streaming response,
    // or chat interface.
    // Let's build a clean mapped prompt incorporating dialogue history to use ai.models.generateContent
    const formattedChatHistory = messages.map(msg => `${msg.role === "user" ? "الطالب" : "المستشار"}: ${msg.text}`).join("\n");
    const fullConversationPrompt = `لقد بدأ الطالب محادثة معك ولديه الأسئلة التالية.
تاريخ المحادثة الحالي:
${formattedChatHistory}

الرجاء إنشاء الرد المنطقي والمناسب والشامل التالي والرد عليه مباشرة باللغة العربية بلهجتك التي تم تحديدها بالتعليمات.`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullConversationPrompt,
      config: {
        systemInstruction,
        temperature: 0.75
      }
    });

    res.json({
      role: "model",
      text: chatResponse.text || "عذرًا، لم أتمكن من معالجة سؤالك بدقة حاليًا. هل يمكنك إعادة صياغته؟",
      timestamp: new Date().toLocaleTimeString('ar-DZ')
    });

  } catch (error) {
    console.error("Gemini Chatbot Error:", error);
    res.status(500).json({ error: "فشل نظام المحادثة في الرد حاليًا." });
  }
});

// Helper for Study Coach Fallbacks
function generateStudyCoachFallback(action: string, body: any) {
  const {
    gradeLevel = "رابعة متوسط",
    stream = "علوم تجريبية",
    favoriteSubjects = [],
    difficultSubjects = [],
    currentGPA = 12,
    targetGPA = 15,
    subject = "الرياضيات",
    topic = "المتتاليات العددية",
    difficulty = "متوسط",
    query = "",
    quizGrades = [],
    examGrades = []
  } = body;

  const favs = Array.isArray(favoriteSubjects) && favoriteSubjects.length > 0 ? favoriteSubjects : ["الرياضيات", "العلوم الطبيعية"];
  const diffs = Array.isArray(difficultSubjects) && difficultSubjects.length > 0 ? difficultSubjects : ["الفيزياء", "الفلسفة"];

  if (action === "generate-profile") {
    // Determine target likelihood
    const gap = Number(targetGPA) - Number(currentGPA);
    let successProbability = 82;
    if (gap <= 0) successProbability = 98;
    else if (gap > 4) successProbability = 55;
    else if (gap > 2) successProbability = 72;

    return {
      profileSummary: `بناءً على ملفك الدراسي لشعبة **${stream}**، قمنا بإعداد خطة تكييفية لك للارتقاء من معدل **${currentGPA}** إلى معدلك المستهدف **${targetGPA}**. الخطة ترتكز على تكثيف الجهد في مواد الدعم (${diffs.join(" و")}) مع الحفاظ على معدلات متميزة في مواد الشغف (${favs.join(" و")}).`,
      strengths: [
        `قدرتك الفطرية واهتمامك العالي بـ: ${favs.join(" و")}.`,
        "الرغبة الصادقة في الالتزام والتحسن المستمر.",
        "التكامل المنهجي في الاستيعاب وتدوين الملاحظات الفعالة."
      ],
      weaknesses: [
        `صعوبة جزئية في هضم مفاهيم: ${diffs.join(" و")}.`,
        "تشتت وقت المراجعة الذاتية بين المواد الأساسية والثانوية.",
        "الحاجة لصقل مهارات التدريب وحل المواضيع النموذجية بالوقت المحدد."
      ],
      dailyPlan: {
        studyHours: 4,
        restHours: 2.5,
        schedule: [
          "05:30 - 06:45 | مراجعة الفجر للدروس التي تعتمد على الحفظ (شريعة، تاريخ وجغرافيا).",
          "17:30 - 19:30 | حصة أساسية لحل مسائل وتمارين تطبيقية في المادة المعقدة (مراجعة مركزة + تطبيقات).",
          "20:30 - 22:00 | حل تمرين نموذجي أو مراجعة سريعة لإحدى المواد ذات المعامل المرتفع."
        ]
      },
      weeklyPlan: {
        targets: [
          `حل 3 مواضيع بكالوريا في مادة ${diffs[0] || "الفيزياء"}.`,
          `تلخيص وحدة كاملة وسد ثغرات الفهم في مادة ${diffs[1] || "الفلسفة"}.`,
          "الالتزام بـ 15 ساعة مراجعة تراكمية مقسمة طوال الأسبوع."
        ],
        tasks: [
          "جلسة دراسة جماعية بالقسم أو مراجعة فيديو شرح ملخص لدرس محور الإشكال.",
          "تنظيم كراس ملخص يحتوي على أهم المعادلات والأخطاء المرتكبة الشائعة.",
          "إجراء تقييم ذاتي بنهاية الأسبوع لقياس مدى فهم العناصر الجديدة."
        ]
      },
      monthlyPlan: {
        goals: [
          `السيطرة التامة على الوحدتين الأولى والثانية في المواد الأساسية للشعبة.`,
          `الارتقاء بوضعيات الحفظ التراكمية لتفادي ضغط نهاية الفصول.`
        ],
        milestones: [
          "إجراء محاكاة امتحان فصلي مصغر لأحد الأسابيع بنسق حقيقي.",
          "تقييم الأخطاء وإعداد بطاقات الفلاش للمراجعة الذكية للرموز والقوانين."
        ]
      },
      seasonalPlan: {
        examTip: "قبل الاختبارات بـ 15 يوماً، توقف تماماً عن استيعاب مواطن جديدة وركز بنسبة 100% على المراجعة السريعة وحل الاختبارات النموذجية لولايات متعددة بالجزائر.",
        examSchedule: [
          "الأسبوع الأول: حل المواضيع السابقة لبكالوريا الجزائر للسنوات (2020-2025).",
          "الأسبوع الثاني: مراجعة دساتير المواد والمعاملات وتوليف الثغرات الفكرية في كراس الأخطاء الخاص بك."
        ]
      },
      gpaProjection: {
        current: Number(currentGPA),
        estimated: Math.min(20, Number(currentGPA) + Math.min(1.8, Math.max(0.5, gap * 0.6))),
        successProbability,
        tips: [
          `أعط مادة ${diffs[0] || "الفلسفة"} وقتاً إضافياً يومي السبت والثلاثاء.`,
          "استعمل تقنية البومودورو (25 دقيقة دراسة، 5 دقائق راحة) لزيادة التركيز وتفادي الخمول.",
          "قم بحل 5 تمارين متدرجة الصعوبة لكل تخصص قبل محاولة حل موضوع بكالوريا مصنف ومعقد كلياً."
        ]
      }
    };
  }

  if (action === "generate-exercise") {
    // Generate specialized exercise based on subject
    const title = `تمرين تدريبي مقترح في **${subject}** (${topic})`;
    let text = "";
    let solution = "";

    if (subject.includes("رياض") || subject.includes("Math")) {
      text = `## تمرين نموذجي حول المتتاليات والمعادلات 📝\n\nنعتبر المتتالية العددية $(U_n)$ المعرفة على $\\mathbb{N}$ كما يلي:\n\n$$U_0 = 2 \\quad \\text{و} \\quad U_{n+1} = \\frac{2}{3} U_n + 1$$\n\n### المطلوب:\n1. احسب كلاً من الحدود التالية: $U_1$ و $U_2$.\n2. برهن بالتراجع أنه من أجل كل عدد طبيعي $n$ فإن: $U_n < 3$.\n3. ادرس اتجاه تغير المتتالية $(U_n)$ واستنتج تقاربها.\n4. نضع من أجل كل عدد طبيعي $n$: $V_n = U_n - 3$.\n   * برهن أن المتتالية $(V_n)$ هندسية يطلب تعيين أساسها $q$ وحدها الأول $V_0$.\n   * اكتب $V_n$ بدلالة $n$ ثم استنتج عبارة $U_n$ بدلالة $n$.\n   * احسب نهاية المتتالية $(U_n)$ لما يؤول $n$ إلى $+\\infty$.`;

      solution = `### حل التمرين خطوة بخطوة 🧠:\n\n**1. حساب الحدود:**\n* $U_1 = \\frac{2}{3}(2) + 1 = \\frac{4}{3} + 1 = \\frac{7}{3} \\approx 2.33$\n* $U_2 = \\frac{2}{3}(\\frac{7}{3}) + 1 = \\frac{14}{9} + \\frac{9}{9} = \\frac{23}{9} \\approx 2.56$\n\n**2. البرهان بالتراجع ($U_n < 3$):**\n* **الخاصية $P(0)$**: لدينا $U_0 = 2 < 3$ محققة.\n* **الفرضية**: نفرض صحة $P(n)$ أي $U_n < 3$ ونبرهن على صحة $P(n+1)$ أي $U_{n+1} < 3$.\n* **البرهان**: لدينا $U_n < 3 \\implies \\frac{2}{3}U_n < 2 \\implies \\frac{2}{3}U_n + 1 < 3 \\implies U_{n+1} < 3$ صحيحة.\n* إذن من أجل كل عدد طبيعي $n$، فإن $U_n < 3$.\n\n**3. اتجاه التغير:**\n$U_{n+1} - U_n = \\frac{2}{3}U_n + 1 - U_n = -\\frac{1}{3}U_n + 1$.\nبما أن $U_n < 3 \\implies -\\frac{1}{3}U_n > -1 \\implies -\\frac{1}{3}U_n + 1 > 0$.\nإذن الفرق موجب تماماً، مما يعني أن المتتالية $(U_n)$ متزايدة تماماً ومحدودة من الأعلى بالعدد 3 فهي متقاربة نحو نهاية شهيرة $l$.`;
    } else if (subject.includes("علوم") || subject.includes("فيديو") || subject.includes("طبيعية")) {
      text = `## تمرين حول آليات تركيب البروتين🧬\n\nتبين الوثائق المخبرية انتقال الشفرة الوراثية من النواة إلى الهيولى بواسطة جزيئة مخصصة.\n\n### المطلوب:\n1. اذكر الاسم الدقيق للعملية الحيوية المسؤولة عن تركيب جزيئة mRNA مع العناصر الضرورية لحدوثها.\n2. يمثل جزء من السلسلة المستنسخة الـ DNA التتابع التالي:\n   \`3'- T A C G G G C A T T T C A C T -5'\`\n   * أعط تتابع Nucleotides الموافق على جزيء الـ mRNA.\n   * باستعمال جدول الشفرة الوراثية المقترح بالدرس، استنتج تتابع الأحماض الأمينية للبروتين المصفي.`;

      solution = `### حل تمرين تركيب البروتين 🧬:\n\n**1. عملية الاستنساخ (Transcription):**\n* **العناصر الضرورية:**\n  - جزيء الـ DNA كقالب الأساس.\n  - إنزيم ARN بوليميراز (RNA Polymerase) الفعال.\n  - ريبونوكليوتيدات حرة (A, U, C, G).\n  - طاقة خلوية على شكل ATP لدفع المفاصل والإنزيم.\n\n**2. التحويل التتابعي:**\n- قالب DNA المستنسخ:\n  \`3'- T A C G G G C A T T T C A C T -5'\`\n- الـ mRNA المتولد (النسخة الإيجابية):\n  \`5'- A U G C C C G U A A A G U G A -3'\`\n- تتابع الأحماض الموافق (بتجميع الثلاثيات):\n  - \`AUG\` -> الميثيونين (البداية)\n  - \`CCC\` -> البرولين\n  - \`GUA\` -> الفالين\n  - \`AAG\` -> الليزين\n  - \`UGA\` -> رامزة التوقف (Stop Codon)`;
    } else {
      text = `## تمرين تطبيقي مخصص في فئة ${subject} (${topic}) 📝\n\nيقدم هذا التدريب نموذجاً تطبيقياً وسؤالاً تحليلياً شاملاً للدرس لقياس مدى تمكنك من مهارات التحليل والاستدلال المنهجي.\n\n### المطلوب:\n1. اشرح المفهوم الأساسي لـ "${topic}" مدعماً شرحك بمثال حقيقي من المنهج الجزائري البارز.\n2. وضح الأخطاء الشائعة التي يقع فيها الطلاب في الامتحانات الرسمية عند معالجة هذا العنصر الجزئي.`;

      solution = `### نموذج الحل النموذجي 💡:\n\n**1. شرح المفهوم:**\nيمثل عنصر "${topic}" في مادة ${subject} أساساً جوهرياً يتكامل مع بقية فصول المنهاج. على سبيل المثال، يستند فهم هذا المحور بشكل مباشر للنماذج التجريبية والتطبيقات النظرية المقررة بالجزائر.\n\n**2. الأخطاء الأكثر شيوعاً وتجنبها:**\n- إهمال التحليل البياني وكتابة النتيجة دون وحدات دقيقة وقواعد واضحة.\n- الخلط الفكري بين المفاهيم المترابطة بالوحدات المجاورة.\n- عدم التزام الهيكلية المقررة للبكالوريا (مقدمة، العرض، الخاتمة) خاصة في مادة الفلسفة والعلوم الإنسانية الدقيقة.`;
    }

    return {
      exerciseTitle: title,
      questionText: text,
      difficultyLabel: difficulty,
      stepByStepSolution: solution,
      similarExerciseTip: "نصيحة ذكية: ننصحك دائماً بتجربة حل التمرين بنفسك لمدة 15 دقيقة مستقلة دون تصفح الحل، ثم مقارنة صياغتك التعبيرية مع الحل النموذجي المنهجي الموفر لك."
    };
  }

  if (action === "simulate-exam") {
    return {
      examTitle: `الامتحان التجريبي المحاكي في مادة ${subject} - شعبة ${stream}`,
      durationMinutes: 45,
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: `ما هو المعامل المقدر رسمياً لمادة ${subject} في شعبة ${stream} بالبكالوريا؟`,
          options: ["معامل 2", "معامل 4", "معامل 5", "معامل 6 أو أكثر حسب التخصص"],
          correctAnswer: stream.includes("علوم") || stream.includes("رياض") ? "معامل 6 أو أكثر حسب التخصص" : "معامل 4",
          points: 5,
          modelSolution: "تعتبر هذه المادة أساسية ومصيرية لحساب المعدل المرجعي والمعدل الحسابي العام بشعبتك بـ البكالوريا."
        },
        {
          id: "q2",
          type: "structured",
          question: `اشرح باختصار شديد منهجية المراجعة والتفسير في محور: "${topic}" لتفادي نقصان النقاط بسبب المنهجية الرسمية؟`,
          points: 15,
          modelSolution: "المنهجية الصحيحة تبدأ بكتابة معطيات المسألة أولاً، تليها صياغة القوانين المستخدمة بحروف ورموز واضحة، ثم التطبيق العددي، وتأطير النتيجة النهائية مع تضمين الوحدات الدولية الصحيحة لمنع خصم أرباع النقاط الاستثنائية للعلامة."
        }
      ],
      guidelines: [
        "ضع هاتفك جانباً واضبط التوقيت التنازلي التفاعلي الموفر بالمنصة.",
        "استخدم ورقة بيضاء جانبية وقوماً للرسم لو لزم الأمر لتنعم بمحاكاة كاملة.",
        "لا تستعجل وأجب عن المطلوب خطوة بخطوة بالاستدلال المنطقي."
      ]
    };
  }

  if (action === "explain-lesson") {
    return {
      explanationText: `### شرح تفصيلي ومبسط لـ: ${query || topic} في مادة ${subject} 📚\n\nتعد هذه النقطة ركناً هاماً جداً بالمنهاج الدراسي الجزائري. دعنا نبسطها كلياً لتثبت في ذهنك:\n\n1. **الفكرة الجوهرية**: تتركز آليات هذا المبدأ على تفعيل عناصر أساسية مترابطة.\n2. **المنطق التطبيقي**: نستخدم هذا المفهوم لصياغة علاقات منطقية دقيقة تؤدي لاستنتاجات صحيحة.\n3. **النقطة المفصلية**: في الامتحانات الوطنية، يركز المصححون على تسلسل التفكير والربط المبرهن والبرمجة الرياضية أو اللغوية الدقيقة.`,
      simplifiedConcept: `💡 الخلاصة المبسطة: "${query || topic}" يعبر عن ربط تتابعي متناسق بين المعطيات والنواتج، ولفهمه ركز على التطبيق المتكرر وتدوين الملاحظات.`,
      practicalExample: `📝 **مثال توضيحي محلول:**\n\nإذا كانت لدينا المعطيات الأولية $A = 5$ والطلب هو موازنة معادلة أو حساب نسبة الفائدة بنظام $n=3$، نطبق القاعدة المخصصة:\n\n$$\\text{النتيجة} = A \\times (1 + 0.1)^3 = 5 \\times 1.331 = 6.655$$`,
      similarExercise: `🎯 **تمرين مكمل لك:**\nجرب الآن تطبيق نفس الآلية السابقة لو كانت القيمة البدئية $A = 10$ والزمن $n=5$ مع تسجيل ملاحظاتك وعوائق الحل لرفعها لي وشرحها ثانية.`
    };
  }

  if (action === "analyze-results") {
    // Collect stats from grades
    const quizzes = Array.isArray(quizGrades) ? quizGrades : [];
    const exams = Array.isArray(examGrades) ? examGrades : [];
    
    let totalGrade = 0;
    let count = 0;
    quizzes.forEach((q: any) => { totalGrade += Number(q.grade || 0); count++; });
    exams.forEach((e: any) => { totalGrade += Number(e.grade || 0); count++; });

    const avg = count > 0 ? (totalGrade / count) : Number(currentGPA);
    const projected = Math.max(10, Math.min(20, avg + 0.8));
    const prob = projected >= Number(targetGPA) ? 90 : Math.max(40, Math.min(85, 100 - (Number(targetGPA) - projected) * 15));

    return {
      strengthsAnalysis: [
        "الالتزام الإيجابي وتدوين النقاط والتقييمات بالمنصة لمعالجتها.",
        "الحصول على أداء مشجع في بعض الفروض المنزلية المسجلة."
      ],
      weaknessesAnalysis: [
        "تذبذب نتائج بعض المواد الاستدلالية يستدعي مراجعة دورية.",
        "ضغط التوقيت والتسرع في الحساب والتحليل اللغوي."
      ],
      projectedGPA: Number(projected.toFixed(2)),
      targetReachProbability: Math.round(prob),
      actionableTips: [
        "خصص 40 دقيقة يومية إضافية لإعادة حل الفروض التي نلت فيها علامة أقل من 20/12.",
        "اسأل المدرب الدراسي المباشر هنا لشرح الأخطاء المسجلة بالفروض على الفور.",
        "اعتمد ورقة الأجوبة المنظمة والمرقمة بشكل جيد ليرتاح المصحح ويمنحك العلامة الكاملة."
      ]
    };
  }

  return { error: "Unknown action" };
}

// 4. Smart AI Study Coach Route
app.post("/api/study-coach", async (req, res) => {
  const { action, body } = req.body;

  if (!action) {
    res.status(400).json({ error: "Missing action in request body" });
    return;
  }

  // Format fallbacks early if Gemini AI isn't configured
  if (!ai) {
    console.log("No Gemini API client configured for Study Coach. Serving offline simulation generator.");
    const fallback = generateStudyCoachFallback(action, body || {});
    res.json(fallback);
    return;
  }

  try {
    let prompt = "";
    let systemInstruction = "أنت 'المدرب الدراسي الذكي (AI Study Coach)'، الخبير التربوي والتعليمي الرائد لمقررات وزارة التربية والتعليم والتعليم العالي بالجزائر وبكالوريا 2026. تساعد طلبة الجزائر بمهنية عريضة وتشجيع وافر بأسلوب دقيق يعتمد على التوجيه المنهجي واللغة العربية الواضحة.";

    if (action === "generate-profile") {
      const { gradeLevel, stream, favoriteSubjects, difficultSubjects, currentGPA, targetGPA } = body || {};
      prompt = `عليك إنشاء ملف أكاديمي شخصي مفصل تفصيلاً دقيقاً ومقنعاً باللغة العربية لطالب جزائري يدرس في الطور: ${gradeLevel || "ثانوي بكالوريا 2026"}.
معطيات الطالب:
- الشعبة الحالية: ${stream}
- المواد المفضلة: ${Array.isArray(favoriteSubjects) ? favoriteSubjects.join("، ") : favoriteSubjects}
- المواد التي يواجه فيها صعوبة: ${Array.isArray(difficultSubjects) ? difficultSubjects.join("، ") : difficultSubjects}
- المعدل الحالي: ${currentGPA}
- المعدل المستهدف: ${targetGPA}

أرجع إجابة JSON متكاملة ومطابقة للمخطط التالي تماماً:
- profileSummary: تلخيص ذكي مشجع للملف وسبل بلوغ الهدف (أكثر من 50 كلمة بالعربية).
- strengths: قائمة من 3 نقاط قوة في ملفه الدراسي مبنية على معطياته.
- weaknesses: قائمة من 3 نقاط ضعف حقيقية ومحتملة للتعامل معها.
- dailyPlan: كائن يحتوي على studyHours (عدد الساعات الأكاديمية للدراسة اليومية)، restHours (ساعات الراحة الحتمية والرياضة)، و schedule (مصفوفة من 3 مواعيد دراسية مميزة ومرتبة زمنياً كأجندة يومية نموذجية تماثل طبيعة الطالب الجزائري).
- weeklyPlan: كائن يحتوي على targets (مصفوفة من 3 أهداف أسبوعية مثل مراجعة وحدات أو حل تمارين) و tasks (مصفوفة من 3 مهام عملية تفصيلية للالتزام بها).
- monthlyPlan: كائن يحتوي على goals (مصفوفة من هدفين شاملين للشهر) و milestones (مصفوفة من عنصرين للقياس).
- seasonalPlan: كائن يحتوي على examTip (نصيحة ذهبية دقيقة لفترة الاختبارات والبكالوريا) و examSchedule (مصفوفة من مراجعات ما قبل الدورة).
- gpaProjection: كائن فيه current (المعدل الحالي رقم)، estimated (المعدل المتوقع رقم بناء على الخطة)، successProbability (احتمالية الوصول للمعدل المستهدف كنسبة مئوية بين 10 و 100)، و tips (مصفوفة من 3 إرشادات دقيقة عملية لتحقيق معدله المستهدف).`;

    } else if (action === "generate-exercise") {
      const { subject, topic, difficulty, stream } = body || {};
      prompt = `أنت مكلف بتوليد تمرين مراجعة أكاديمي نموذجي ثري بالعربية كلياً وقائم على المنهاج والدليل البيداغوجي الجزائري الفعلي.
- المادة: ${subject}
- درس أو فئة المحور: ${topic}
- الصعوبة: ${difficulty} (سلس، متوسط، مرتفع)
- شعبة الطالب: ${stream}

أرجع مخرج JSON حصرياً مطابقاً بنسبة 100% للهيكل التالي:
- exerciseTitle: عنوان مميز وعلمي متمنهج للتمرين.
- questionText: الأسئلة والتمارين ورموزها بدقة مستعملاً كود Markdown والـ LaTeX لكتابة القوانين الرياضية أو التتابعات العلمية بجمالية فائقة.
- difficultyLabel: الصعوبة المقررة.
- stepByStepSolution: الحل النموذجي والمفصل والدقيق والمنظم خطوة بخطوة لمساعدة الطالب على الفهم الكامل وبناء الاستدلال (مكتوب مفروداً بـ Markdown).
- similarExerciseTip: نصيحة توجيهية عن تمرين مماثل أو استراتيجية حل لحفظ الوقت بالامتحانات.`;

    } else if (action === "simulate-exam") {
      const { subject, topic, stream } = body || {};
      prompt = `قم بتصميم موضوع امتحان تجريبي كامل ومحاكي رسميًا يماثل الامتحانات الفصلية بالجزائر أو مواضيع بكالوريا الجزائر الحقيقية.
- المادة: ${subject}
- محور الاختبار المقترح: ${topic}
- الشعبة والمسلك المقترح: ${stream}

أرجع مخرج JSON حصرياً مطابقاً ومتقاطعاً مع الهيكل التالي:
- examTitle: الاسم والعنوان الرسمي للاختبار المقترح.
- durationMinutes: الزمن المقرر للاجابة كرقم بالدقائق (مثلاً 45 أو 60 أو 120).
- questions: مصفوفة من الأسئلة المتكاملة وكل سؤال كائن يحتوي على:
  * id: معرف فريد نصي (مثال: q1).
  * type: نوع السؤال 'multiple_choice' أو 'structured' (سؤال مقالي أو مسألة).
  * question: نص السؤال المصاغ بلغة عربية صارمة ودقيقة.
  * options: (في حال كان الخيار من متعدد) مصفوفة من أربع خيارات تعجيزية ومميزة.
  * correctAnswer: (للخيار متعدد) نص الخيار الصحيح بدقة بالغة.
  * points: درجة تنقيط السؤال رقم يتناسب مع الأهمية (مثال: 5 أو 10).
  * modelSolution: الشرح والحل النموذجي والمعادلات الكاملة للسؤال.
- guidelines: مصفوفة من الإرشادات والتنبيهات المنهجية لتهيئة الطالب نفسياً وتسهيل حل الامتحان بمسؤولية ونظام.`;

    } else if (action === "explain-lesson") {
      const { query, subject, currentTopic } = body || {};
      prompt = `بصفتك المدرب الدراسي الجزائري المعتمد، قم بشرح وتبسيط وتنزيل فكرة تدوينية علمية لأي سؤال يطرحه الطالب الجزائري بطريقة بيداغوجية ميسرة وخالية من التعقيد.
- نص سؤال الطالب أو الدرس المطلوب توضيحه: ${query}
- المادة الدراسية المعينة: ${subject || "العامة"}
- الدرس الحالي إن وجد بالتسلسل: ${currentTopic || "غير محدد"}

الرجاء تلخيص التبيان الدراسي هذا في قالب JSON حصري بالعربية يطابق الآتي:
- explanationText: الشرح المعرفي النظري الطويل الشامل مع تنظيم عناصره بمسافة بادئة غنية ورموز جميلة وكود Markdown والـ LaTeX للقوانين بصياغة متناهية الوضوح وبسيطة.
- simplifiedConcept: الخلاصة واللب والمفصل الفكري لجوهر الدرس في سطرين سريعي الحفظ.
- practicalExample: مثال عملي تطبيقي ومحلول بالتفصيل لإزالة الالتباس وصقل التمكن.
- similarExercise: تمرين توطيدي مكمل يقيس مدى ترسخ الفهم في ذهنه.`;

    } else if (action === "analyze-results") {
      const { quizGrades, examGrades, currentGPA, targetGPA } = body || {};
      prompt = `أنت الطبيب والمحلل الأكاديمي لمسيرة الطالب واجتهاده بالفصول.
قم بمراجعة جدول علاماته بالفروض والاختبارات لإفراز دراسة مراجعة متميزة.
- نقاط الفروض والواجبات المنزلية: ${JSON.stringify(quizGrades)} (النطاق التقييمي من 20 نقطة)
- علامات الاختبارات والامتحانات الفصلية: ${JSON.stringify(examGrades)}
- المعدل الحالي العام: ${currentGPA}
- المعدل المنشود تحصيله بالامتحان الكلي: ${targetGPA}

أرجع البيانات حصراً على هيئة استجابة JSON دقيقة تطابق الهيكل المعتمد التالي:
- strengthsAnalysis: مصفوفة من نقطتي قوة في علاماته (مثل تدارجه بمادة المعامل، أو استقرار نقاط الفروض).
- weaknessesAnalysis: مصفوفة من نقطتي ضعف تدعو للحذر وتصحيح المسار (مثل السقوط بمادة أساسية أو تسرع التوقيت).
- projectedGPA: المعدل الإحصائي المتوقع له رقم (احسبه بدقة كاحتمال حسابي للعلامات المدخلة ومعدله السابق).
- targetReachProbability: احتمالية الوصول والالتحاق بالمعدل المستهدف بنسبة مئوية (رقم صحيح بين 10 و 100).
- actionableTips: مصفوفة من 3 نصائح تربوية وتكتيكية منتقاة مخصصة لرفع نقاط المواد المترهلة فوراً.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: action === "generate-profile" ? {
          type: Type.OBJECT,
          properties: {
            profileSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            dailyPlan: {
              type: Type.OBJECT,
              properties: {
                studyHours: { type: Type.NUMBER },
                restHours: { type: Type.NUMBER },
                schedule: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["studyHours", "restHours", "schedule"]
            },
            weeklyPlan: {
              type: Type.OBJECT,
              properties: {
                targets: { type: Type.ARRAY, items: { type: Type.STRING } },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["targets", "tasks"]
            },
            monthlyPlan: {
              type: Type.OBJECT,
              properties: {
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["goals", "milestones"]
            },
            seasonalPlan: {
              type: Type.OBJECT,
              properties: {
                examTip: { type: Type.STRING },
                examSchedule: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["examTip", "examSchedule"]
            },
            gpaProjection: {
              type: Type.OBJECT,
              properties: {
                current: { type: Type.NUMBER },
                estimated: { type: Type.NUMBER },
                successProbability: { type: Type.NUMBER },
                tips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["current", "estimated", "successProbability", "tips"]
            }
          },
          required: ["profileSummary", "strengths", "weaknesses", "dailyPlan", "weeklyPlan", "monthlyPlan", "seasonalPlan", "gpaProjection"]
        } : action === "generate-exercise" ? {
          type: Type.OBJECT,
          properties: {
            exerciseTitle: { type: Type.STRING },
            questionText: { type: Type.STRING },
            difficultyLabel: { type: Type.STRING },
            stepByStepSolution: { type: Type.STRING },
            similarExerciseTip: { type: Type.STRING }
          },
          required: ["exerciseTitle", "questionText", "difficultyLabel", "stepByStepSolution", "similarExerciseTip"]
        } : action === "simulate-exam" ? {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  modelSolution: { type: Type.STRING }
                },
                required: ["id", "type", "question", "points", "modelSolution"]
              }
            },
            guidelines: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["examTitle", "durationMinutes", "questions", "guidelines"]
        } : action === "explain-lesson" ? {
          type: Type.OBJECT,
          properties: {
            explanationText: { type: Type.STRING },
            simplifiedConcept: { type: Type.STRING },
            practicalExample: { type: Type.STRING },
            similarExercise: { type: Type.STRING }
          },
          required: ["explanationText", "simplifiedConcept", "practicalExample", "similarExercise"]
        } : {
          // analyze-results
          type: Type.OBJECT,
          properties: {
            strengthsAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknessesAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectedGPA: { type: Type.NUMBER },
            targetReachProbability: { type: Type.NUMBER },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["strengthsAnalysis", "weaknessesAnalysis", "projectedGPA", "targetReachProbability", "actionableTips"]
        }
      }
    });

    const parsedData = JSON.parse((response.text || "").trim());
    res.json(parsedData);

  } catch (err) {
    console.error("Gemini Study Coach Exception Handler:", err);
    const fallback = generateStudyCoachFallback(action, body || {});
    res.json(fallback);
  }
});


// ------------------------------------------------------

// Vite & Static file serving setup for development vs production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Algerian University Guide backend running on port http://localhost:${PORT}`);
  });
}

startServer();
