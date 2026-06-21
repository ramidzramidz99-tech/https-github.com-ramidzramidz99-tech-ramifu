/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Specialty, BACStream } from "./types";

export const ALGERIAN_WILAYAS = [
  { code: 1, name: "أدرار" },
  { code: 2, name: "الشلف" },
  { code: 3, name: "الأغواط" },
  { code: 4, name: "أم البواقي" },
  { code: 5, name: "باتنة" },
  { code: 6, name: "بجاية" },
  { code: 7, name: "بسكرة" },
  { code: 8, name: "بشار" },
  { code: 9, name: "البليدة" },
  { code: 10, name: "البويرة" },
  { code: 11, name: "تمنراست" },
  { code: 12, name: "تبسة" },
  { code: 13, name: "تلمسان" },
  { code: 14, name: "تيارت" },
  { code: 15, name: "تيزي وزو" },
  { code: 16, name: "الجزائر العاصمة" },
  { code: 17, name: "الجلفة" },
  { code: 18, name: "جيجل" },
  { code: 19, name: "سطيف" },
  { code: 20, name: "سعيدة" },
  { code: 21, name: "سكيكدة" },
  { code: 22, name: "سيدي بلعباس" },
  { code: 23, name: "عنابة" },
  { code: 24, name: "قالمة" },
  { code: 25, name: "قسنطينة" },
  { code: 26, name: "المدية" },
  { code: 27, name: "مستغانم" },
  { code: 28, name: "المسيلة" },
  { code: 29, name: "معسكر" },
  { code: 30, name: "ورقلة" },
  { code: 31, name: "وهران" },
  { code: 32, name: "البيض" },
  { code: 33, name: "إليزي" },
  { code: 34, name: "برج بوعريريج" },
  { code: 35, name: "بومرداس" },
  { code: 36, name: "الطارف" },
  { code: 37, name: "تندوف" },
  { code: 38, name: "تيسمسيلت" },
  { code: 39, name: "الوادي" },
  { code: 40, name: "خنشلة" },
  { code: 41, name: "سوق أهراس" },
  { code: 42, name: "تيبازة" },
  { code: 43, name: "ميلة" },
  { code: 44, name: "عين الدفلى" },
  { code: 45, name: "النعامة" },
  { code: 46, name: "عين تموشنت" },
  { code: 47, name: "غرداية" },
  { code: 48, name: "غليزان" },
  { code: 49, name: "المغير" },
  { code: 50, name: "المنيعة" },
  { code: 51, name: "أولاد جلال" },
  { code: 52, name: "برج باجي مختار" },
  { code: 53, name: "بني عباس" },
  { code: 54, name: "عين صالح" },
  { code: 55, name: "عين قزام" },
  { code: 56, name: "تقرت" },
  { code: 57, name: "جانت" },
  { code: 58, name: "تيميمون" }
];

export const SPECIALTIES: Specialty[] = [
  {
    id: "med",
    code: "D01",
    name: "دكتور في الطب (Médecine)",
    category: "علوم طبية وصحية",
    minGrades: {
      [BACStream.SCIENCES]: 16.20,
      [BACStream.MATH]: 15.90,
      [BACStream.TECHNICAL]: 16.40
    },
    durationYears: 6,
    difficulty: "مرتفع جداً",
    description: "دراسة شاملة لكل ما يتعلق بجسم الإنسان، الأمراض، والتشخيص والعلاجات الطبية والسريرية والجراحة لصناعة أطباء المستقبل.",
    subjects: ["علم التشريح (Anatomie)", "علم وظائف الأعضاء (Physiologie)", "علم الأنسجة (Histologie)", "الكيمياء الحيوية (Biochimie)", "علم الأدوية (Pharmacologie)", "علم الأمراض (Pathologie)"],
    careerOpportunities: ["طبيب عام في القطاع العام أو الخاص", "متابعة التخصص الطبي (الإقامة)", "باحث في المخبر الطبي", "مستشار طبي للمؤسسات الاستشفائية"],
    freelancePotential: "مقبول",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "90,000 - 250,000 دج",
    relatedSpecialties: ["dent", "phar", "nursing"],
    universities: [
      { name: "كلية الطب بالجزائر العاصمة (زيانية)", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "كلية الطب بوهران", location: "وهران", wilayaCode: 31, type: "جامعة" },
      { name: "كلية الطب بقسنطينة", location: "قسنطينة", wilayaCode: 25, type: "جامعة" },
      { name: "كلية الطب سطيف", location: "سطيف", wilayaCode: 19, type: "جامعة" }
    ]
  },
  {
    id: "dent",
    code: "D02",
    name: "طب الأسنان (Chirurgie Dentaire)",
    category: "علوم طبية وصحية",
    minGrades: {
      [BACStream.SCIENCES]: 15.90,
      [BACStream.MATH]: 15.60,
      [BACStream.TECHNICAL]: 16.10
    },
    durationYears: 6,
    difficulty: "مرتفع",
    description: "التخصص الطبي الذي يركز على صحة الفم والأسنان وتطوير وتصحيح العيوب الفكية والسنية وجراحات اللثة.",
    subjects: ["تشريح الأسنان", "علم الأنسجة الفمية", "المواد الطبية المستعملة", "جراحة الأسنان وتقويمها", "علم الوقاية السنية"],
    careerOpportunities: ["طبيب أسنان في مستشفى حكومي", "فتح عيادة خاصة لطب الأسنان", "العمل في مراكز التجميل وصحة الفم"],
    freelancePotential: "ممتاز",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "100,000 - 300,000 دج",
    relatedSpecialties: ["med", "phar"],
    universities: [
      { name: "كلية طب الأسنان بالجزائر", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة عنابة - قسم طب الأسنان", location: "عنابة", wilayaCode: 23, type: "جامعة" },
      { name: "جامعة تلمسان - قسم طب الأسنان", location: "تلمسان", wilayaCode: 13, type: "جامعة" }
    ]
  },
  {
    id: "phar",
    code: "D03",
    name: "الصيدلة (Pharmacie)",
    category: "علوم طبية وصحية",
    minGrades: {
      [BACStream.SCIENCES]: 15.70,
      [BACStream.MATH]: 15.40,
      [BACStream.TECHNICAL]: 15.90
    },
    durationYears: 6,
    difficulty: "مرتفع",
    description: "دراسة تحضير وصناعة وتركيب الأدوية الطبية وتأثيرها على الجسم البشري، مع معرفة التحليلات الكيميائية والبيولوجية.",
    subjects: ["الكيمياء العضوية والصيدلانية", "علم العقاقير والسموم", "صيدلة جالينوسية", "البيولوجيا السريرية", "علم الأحياء الدقيقة"],
    careerOpportunities: ["صيدلي حر (صيدلية خاصة)", "العمل في مخابر تصنيع الأدوية الجزائرية والمشتركة", "مراكز البحث العلمي والتحليل"],
    freelancePotential: "ممتاز",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "80,000 - 220,000 دج",
    relatedSpecialties: ["med", "dent", "biotech"],
    universities: [
      { name: "جامعة الجزائر 1 - قسم الصيدلة", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة سيدي بلعباس - الصيدلة", location: "سيدي بلعباس", wilayaCode: 22, type: "جامعة" },
      { name: "جامعة باتنة - الصيدلة", location: "باتنة", wilayaCode: 5, type: "جامعة" }
    ]
  },
  {
    id: "esi",
    code: "M01",
    name: "المدرسة العليا للإعلام الآلي (ESI Algiers/Sidi Bel Abbes)",
    category: "إعلام آلي وذكاء اصطناعي",
    minGrades: {
      [BACStream.SCIENCES]: 17.20,
      [BACStream.MATH]: 16.50,
      [BACStream.TECHNICAL]: 16.80
    },
    durationYears: 5,
    difficulty: "مرتفع جداً",
    description: "المدرسة الرائدة في الجزائر لتكوين مهندسي إعلام آلي ذوي كفاءة عالية في مجالات البرمجة، الشبكات، البيانات، وتطوير الأنظمة الذكية المعقدة.",
    subjects: ["المنطق الرياضي والخوارزميات", "هندسة الحاسوب وأنظمة التشغيل", "الشبكات والأمن السيبراني", "الذكاء الاصطناعي وبحوث العمليات", "الرياضيات التطبيقية"],
    careerOpportunities: ["مهندس برمجيات (Software Engineer)", "مهندس بيانات وباحث ذكاء اصطناعي", "مدير الأنظمة والشبكات", "مستشار تكنولوجي للمؤسسات الكبرى والشركات الناشئة"],
    freelancePotential: "ممتاز",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "120,000 - 350,050 دج",
    relatedSpecialties: ["ensia", "mi", "telecom"],
    universities: [
      { name: "المدرسة الوطنية العليا للإعلام الآلي (ESI)", location: "الحراش - الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" },
      { name: "المدرسة العليا للإعلام الآلي بسيدي بلعباس", location: "سيدي بلعباس", wilayaCode: 22, type: "مدرسة عليا" }
    ]
  },
  {
    id: "ensia",
    code: "M02",
    name: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA Sidi Abdellah)",
    category: "إعلام آلي وذكاء اصطناعي",
    minGrades: {
      [BACStream.SCIENCES]: 17.60,
      [BACStream.MATH]: 16.90,
      [BACStream.TECHNICAL]: 17.20
    },
    durationYears: 5,
    difficulty: "مرتفع جداً",
    description: "تخصص حديث بالقطب التكنولوجي سيدي عبد الله يهدف لتكوين نخب قادرة على ابتكار وتطوير خوارزميات الذكاء الاصطناعي، التعلم الآلي، ومعالجة البيانات الضخمة باللغة الإنجليزية كليًا.",
    subjects: ["التعلم الآلي (Machine Learning)", "التعلم العميق (Deep Learning)", "الرياضيات المتقدمة والإحصاء", "رؤية الكمبيوتر والمعالجة الطبيعية للغات (NLP)", "البرمجة المتطورة وتوازي الأنظمة"],
    careerOpportunities: ["مهندس وباحث ذكاء اصطناعي", "عالم بيانات (Data Scientist)", "مطور أنظمة ذكية ذاتية القيادة وثورية", "إنشاء شركات برمجية ناشئة"],
    freelancePotential: "ممتاز",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "150,000 - 450,000 دج",
    relatedSpecialties: ["esi", "mi"],
    universities: [
      { name: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)", location: "سيدي عبد الله - الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" }
    ]
  },
  {
    id: "mi",
    code: "T11",
    name: "الرياضيات والإعلام الآلي (MI - Université)",
    category: "علوم دقيقة وتقنية",
    minGrades: {
      [BACStream.SCIENCES]: 12.80,
      [BACStream.MATH]: 11.50,
      [BACStream.TECHNICAL]: 12.00
    },
    durationYears: 3,
    difficulty: "مرتفع",
    description: "دراسة تمهيدية تجمع بين أساسيات الرياضيات النظرية وهياكل البيانات والبرمجة بالجامعة، تتيح للطالب التفرع في الإعلام الآلي أو علوم البيانات بعد السنة الأولى الاستكشافية.",
    subjects: ["التحليل والجبر الرياضي", "الخوارزميات والبنى البيانية الكلاسيكية", "برمجة وبنية الحاسب", "الاحتمالات والإحصاء الوصفي"],
    careerOpportunities: ["مطور مواقع وتطبيقات إنترنت", "أستاذ رياضيات أو إعلام آلي", "العمل بمراكز الحساب والبرمجة والإدارة الرقمية"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "55,000 - 120,000 دج",
    relatedSpecialties: ["esi", "telecom", "st"],
    universities: [
      { name: "جامعة باب الزوار للعلوم والتكنولوجيا (USTHB)", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة وهران 1 - أحمد بن بلة", location: "وهران", wilayaCode: 31, type: "جامعة" },
      { name: "جامعة عبد الحميد مهري قسنطينة 2", location: "قسنطينة", wilayaCode: 25, type: "جامعة" },
      { name: "جامعة سطيف 1 - فرحات عباس", location: "سطيف", wilayaCode: 19, type: "جامعة" }
    ]
  },
  {
    id: "st",
    code: "T12",
    name: "علوم وتكنولوجيا (ST - Sciences et Technologie)",
    category: "علوم دقيقة وتقنية",
    minGrades: {
      [BACStream.SCIENCES]: 11.50,
      [BACStream.MATH]: 10.50,
      [BACStream.TECHNICAL]: 10.00
    },
    durationYears: 3,
    difficulty: "متوسط",
    description: "بوابة الهندسة الكبرى بالجامعة، حيث توفر جذعاً مشتركاً يتفرع بعده الطالب لعدة تخصصات هندسية هامة مثل الهندسة المدنية، الميكانيكية، الكهربائية، الآلية، الكهروتقنية والأشغال العمومية.",
    subjects: ["الفيزياء الميكانيكية والكهربائية", "الكيمياء العضوية والحرارية", "الرياضيات للمهندسين", "الرسم الصناعي والهندسة بمساعدة الكمبيوتر"],
    careerOpportunities: ["مهندس هندسة مدنية أو أشغال عمومية", "إشراف هندسي ورقابة جودة في المصانع", "العمل بقطاعات الطاقة والكهرباء والغاز والمياه (Sonelgaz / Cosider)"],
    freelancePotential: "مقبول",
    postGraduateChance: "متوسط",
    approxSalaryRange: "50,000 - 130,000 دج",
    relatedSpecialties: ["mi", "hydro", "enst"],
    universities: [
      { name: "جامعة العلوم والتكنولوجيا باب الزوار USTHB", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة تلمسان - أبو بكر بلقايد", location: "تلمسان", wilayaCode: 13, type: "جامعة" },
      { name: "جامعة عنابة - باجي مختار", location: "عنابة", wilayaCode: 23, type: "جامعة" }
    ]
  },
  {
    id: "enst",
    code: "T13",
    name: "المدرسة الوطنية العليا للتكنولوجيا (ENST)",
    category: "علوم دقيقة وتقنية",
    minGrades: {
      [BACStream.SCIENCES]: 14.80,
      [BACStream.MATH]: 13.80,
      [BACStream.TECHNICAL]: 14.00
    },
    durationYears: 5,
    difficulty: "مرتفع",
    description: "مدرسة نخبوية تقدم تكوينات تطبيقية في مجالات الهندسة المتقدمة والإنتاج واللوجيستيك الصناعي متوافقة مباشرة مع احتياجات الصناعة الجزائرية الحديثة وصيانة الآلات والإنتاجية.",
    subjects: ["هندسة الإنتاج المتقدم واللوجستية", "صناعة وتصميم الأنظمة الآلية والذكية", "صيانة صناعية ورقمنة المصانع", "إدارة المشاريع الصناعية والأمان الكهربي"],
    careerOpportunities: ["مدير لوجستيك وعمليات تكنولوجية بالشركات الصناعية", "مهندس صيانة وجودة بالمؤسسات الكبرى", "مسؤول سلامة صناعية بالمجمعات الكيميائية والغذائية"],
    freelancePotential: "مقبول",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "85,000 - 180,000 دج",
    relatedSpecialties: ["st", "hydro"],
    universities: [
      { name: "المدرسة الوطنية العليا للتكنولوجيا بالرويبة", location: "الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" }
    ]
  },
  {
    id: "hydro",
    code: "H01",
    name: "المحروقات والكيمياء (Hydrocarbures Boumerdes)",
    category: "علوم دقيقة وتقنية",
    minGrades: {
      [BACStream.SCIENCES]: 15.00,
      [BACStream.MATH]: 14.00,
      [BACStream.TECHNICAL]: 14.50
    },
    durationYears: 5,
    difficulty: "مرتفع",
    description: "دراسة متخصصة ومتميزة بمدينة بومرداس تهيئ مهندسين في مجال استكشاف البترول والغاز، حفر الآبار، النقل والتوزيع، تسويق الطاقة، والتكرير وبتروكيمياويات بالتنسيق مع سوناطراك.",
    subjects: ["جيولوجيا البترول والغاز", "هندسة الخزانات والحفر السطحي", "ميكانيكا السوائل والترموديناميك", "تكرير وبتروكيمياء متقدمة", "اقتصاد المحروقات وتسويق الغاز والنفط"],
    careerOpportunities: ["مهندس بترول في الحقول البترولية بالجنوب وموانئ شحن النفط والغاز", "مطور تقنيات الاستخلاص وتكرير المحروقات بسوناطراك ومثيلاتها", "خبير بمكاتب الاستشراف الطاقي والبيئي"],
    freelancePotential: "محدود",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "100,000 - 320,000 دج",
    relatedSpecialties: ["st", "enst"],
    universities: [
      { name: "كلية المحروقات والكيمياء - جامعة بومرداس", location: "بومرداس", wilayaCode: 35, type: "جامعة" }
    ]
  },
  {
    id: "commerce",
    code: "E01",
    name: "العلوم التجارية والمالية والتسيير (Secg)",
    category: "اقتصاد وتسيير وتجارة",
    minGrades: {
      [BACStream.SCIENCES]: 10.80,
      [BACStream.MATH]: 10.50,
      [BACStream.TECHNICAL]: 10.50,
      [BACStream.ECONOMICS]: 10.00
    },
    durationYears: 3,
    difficulty: "متوسط",
    description: "تخصص ديناميكي يهدف إلى إتقان إدارة المؤسسات، المحاسبة المالية، دراسات السوق والتدقيق الاقتصادي والبنكي، مناسب جداً لمحبي أرقام الأعمال والاستثمارات الرقمية والتأمينات.",
    subjects: ["مبادئ المحاسبة العامة والموازنات", "الإحصاء التطبيقي والاحتمالات المالية", "الاقتصاد الجزئي والكلي وصيرفة البنوك", "التسويق الرقمي والمبيعات الدولية"],
    careerOpportunities: ["محاسب ومحلل مالي في شركة خاصة او عمومية", "إطار بنكي أو بالوكالات البنكية وتأمينات", "مسؤول تسويق ومبيعات وتسيير موارد بشرية", "العمل في الجمارك والضرائب وسوق الأوراق المالية"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "45,000 - 110,000 دج",
    relatedSpecialties: ["esc", "law"],
    universities: [
      { name: "جامعة الجزائر 3 - كلية الإقتصاد والتسيير والعلوم التجارية (دالي إبراهيم)", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة وهران 2 - محمد بن أحمد", location: "وهران", wilayaCode: 31, type: "جامعة" },
      { name: "جامعة سطيف 2 - العلوم الاقتصادية والتسيير", location: "سطيف", wilayaCode: 19, type: "جامعة" }
    ]
  },
  {
    id: "esc",
    code: "E02",
    name: "المدارس العليا للتجارة والتسيير (ESC / HEC Algiers)",
    category: "اقتصاد وتسيير وتجارة",
    minGrades: {
      [BACStream.SCIENCES]: 14.50,
      [BACStream.MATH]: 13.80,
      [BACStream.TECHNICAL]: 14.00,
      [BACStream.ECONOMICS]: 13.50
    },
    durationYears: 5,
    difficulty: "مرتفع",
    description: "مدارس نخبوية في القليعة تمنح شهادة ماستر ومهندس دولة في التجارة الخارجية، العلوم الاقتصادية وبنوك ومحاسبة وتدقيق، لتكوين أطر التسيير الفعال للشروك الجزائرية والدولية ومشاريع ريادة الأعمال.",
    subjects: ["مراجعة عامة وتدقيق مالي متطور", "التخطيط الاستراتيجي ورقابة التسيير والجدوى", "التجارة والتمويل الدولي واللوجستية العالمية", "الذكاء الاقتصادي وأبحاث السوق المتقدمة"],
    careerOpportunities: ["خبير محاسبة معتمد وكبير المدققين بالبنوك الكبرى والمؤسسات الاستثمارية", "مدير مالي وإداري بشركات دولية متواجدة بالجزائر", "مستشار استثماري مالي ومحكم دولي", "إنشاء وتسيير بوابات ريادة أعمال كبرى"],
    freelancePotential: "ممتاز",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "90,000 - 240,000 دج",
    relatedSpecialties: ["commerce", "law"],
    universities: [
      { name: "المدرسة العليا للتجارة (ESC)", location: "قطب القليعة - تيبازة", wilayaCode: 42, type: "مدرسة عليا" },
      { name: "المدرسة الوطنية العليا للإحصاء والاقتصاد التطبيقي (ENSSEA)", location: "قطب القليعة - تيبازة", wilayaCode: 42, type: "مدرسة عليا" },
      { name: "المدرسة العليا لإدارة الأعمال (HEC)", location: "القليعة - تيبازة", wilayaCode: 42, type: "مدرسة عليا" }
    ]
  },
  {
    id: "ens",
    code: "EN01",
    name: "المدارس العليا للأساتذة (ENS)",
    category: "تربية وتعليم",
    minGrades: {
      [BACStream.SCIENCES]: 14.80,
      [BACStream.MATH]: 14.00,
      [BACStream.TECHNICAL]: 14.50,
      [BACStream.ECONOMICS]: 14.50,
      [BACStream.PHILOSOPHY]: 14.00,
      [BACStream.LANGUAGES]: 14.20
    },
    durationYears: 5,
    difficulty: "متوسط",
    description: "التكوين الموجه مباشرة لقطاع التربية الوطنية لضمان منصب عمل دائم بمجرد التخرج. يتم تكوين المعلمين والأساتذة للطور الابتدائي، المتوسط أو الثانوي حسب المعدل والاحتياج الترابي بالولايات.",
    subjects: ["علم نفس الطفولة والمراهقة وتاريخ التعليم والتعلم", "أصول التدريس وهندسة المناهج والطرائق (Didactique)", "التعمق في المادة المدرسة (فيزياء، رياضيات، تاريخ وجغرافيا، آداب)", "تكنولوجيات الإعلام الموجهة للتدريس الحديث"],
    careerOpportunities: ["أستاذ تعليم ثانوي (5 سنوات تكوين)", "أستاذ تعليم متوسط (4 سنوات تكوين)", "أستاذ تعليم ابتدائي (3 سنوات تكوين)"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "55,000 - 85,000 دج",
    relatedSpecialties: ["translate", "english", "arabic"],
    universities: [
      { name: "المدرسة العليا للأساتذة بالقبة", location: "الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" },
      { name: "المدرسة العليا للأساتذة ببوزريعة", location: "الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" },
      { name: "المدرسة العليا للأساتذة بقسنطينة", location: "قسنطينة", wilayaCode: 25, type: "مدرسة عليا" },
      { name: "المدرسة العليا للأساتذة بوهران", location: "وهران", wilayaCode: 31, type: "مدرسة عليا" }
    ]
  },
  {
    id: "english",
    code: "L01",
    name: "اللغة الإنجليزية وآدابها (Langue Anglaise)",
    category: "لغات وترجمة وآداب",
    minGrades: {
      [BACStream.SCIENCES]: 11.50,
      [BACStream.MATH]: 10.50,
      [BACStream.TECHNICAL]: 11.00,
      [BACStream.ECONOMICS]: 11.00,
      [BACStream.PHILOSOPHY]: 12.00,
      [BACStream.LANGUAGES]: 10.50
    },
    durationYears: 3,
    difficulty: "سلس",
    description: "تخصص ممتاز ومطلوب بشدة لدراسة قواعد اللغة الإنجليزية، اللسانيات، الأداب والحضارات الأنجلوفونية، ويشكل حالياً توجهاً كبيراً بالجزائر نظراً لسياسة تعميم اللغة الإنجليزية.",
    subjects: ["أقسام اللسانيات وقواعد النحو وتطور الأدب", "التواصل الشفوي والكتابي والجهارة الصوتية", "حضارة وتاريخ بريطانيا والولايات المتحدة والمستعمرات", "الترجمة المقارنة وبحوث اللسان"],
    careerOpportunities: ["مترجم فوري أو تحريري بالمؤسسات العمومية والخاصة", "كتابة المحتوى بالإنجليزية وتدبير العلاقات الدولية", "الالتحاق بمدارس التدريس اللغوي الخاصة أو العمومية", "العمل بمكاتب السياحة والتسهيلات الصحفية"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "45,000 - 95,000 دج",
    relatedSpecialties: ["translate", "ens"],
    universities: [
      { name: "جامعة الجزائر 2 - بوزريعة (كلية اللغات الأجنبية)", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة باتنة 2 - معهد اللغات الأجنبية", location: "باتنة", wilayaCode: 5, type: "جامعة" },
      { name: "جامعة تلمسان - قسم اللغة الإنجليزية", location: "تلمسان", wilayaCode: 13, type: "جامعة" }
    ]
  },
  {
    id: "translate",
    code: "L02",
    name: "علوم الترجمة (Traduction)",
    category: "لغات وترجمة وآداب",
    minGrades: {
      [BACStream.SCIENCES]: 12.50,
      [BACStream.MATH]: 11.50,
      [BACStream.TECHNICAL]: 12.00,
      [BACStream.ECONOMICS]: 12.00,
      [BACStream.PHILOSOPHY]: 12.50,
      [BACStream.LANGUAGES]: 11.00
    },
    durationYears: 3,
    difficulty: "متوسط",
    description: "دراسة تقنيات ومناهج الترجمة والترجمة الفورية الفورية والتحريرية بين اللغات الرئيسية (العربية، الأمازيغية، الإنجليزية، الفرنسية، الإسبانية أو الألمانية أو الروسية).",
    subjects: ["نظريات الترجمة والمصطلحات المقارنة", "الترجمة القانونية والاقتصادية والصحفية الفورية", "دراسات لغوية وألسنية مقارنة", "برمجيات الترجمة الآلية وإدارة المشاريع التحريرية"],
    careerOpportunities: ["مترجم معتمد لدى المحاكم والسفارات والوزارات", "العمل الإعلامي والصحفي ودور النشر الإقليمية والمحلية", "العمل في منظمات التعاون الدولي والسفارات المعتمدة بالجزائر"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "60,000 - 150,000 دج",
    relatedSpecialties: ["english", "ens"],
    universities: [
      { name: "معهد الترجمة - جامعة الجزائر 2", location: "الجزائر العاصمة", wilayaCode: 16, type: "معهد وطني" },
      { name: "معهد اللغات الأجنبية والترجمة بوهران", location: "وهران", wilayaCode: 31, type: "جامعة" },
      { name: "جامعة قسنطينة 1 - قسم الترجمة", location: "قسنطينة", wilayaCode: 25, type: "جامعة" }
    ]
  },
  {
    id: "law",
    code: "S01",
    name: "الحقوق والعلوم القانونية والإدارية (Droit)",
    category: "علوم إنسانية واجتماعية وقانونية",
    minGrades: {
      [BACStream.SCIENCES]: 10.50,
      [BACStream.MATH]: 10.00,
      [BACStream.TECHNICAL]: 10.20,
      [BACStream.ECONOMICS]: 10.00,
      [BACStream.PHILOSOPHY]: 10.00,
      [BACStream.LANGUAGES]: 10.00
    },
    durationYears: 3,
    difficulty: "متوسط",
    description: "دراسة شؤون القوانين، الدساتير والتشريعات الجزائرية، القانون المدني والتجاري والجزائي، وكيفية صياغة العقود وفض النزاعات والتقاضي الإداري والدولي.",
    subjects: ["القانون المدني ونظريات الالتزام", "القانون الجزائي العام والخاص والإجراءات الجنائية", "الشريعة الإسلامية وميراث وقوانين الأسرة", "القانون التجاري والشركات والتحكيم"],
    careerOpportunities: ["محامي بعد الحصول على شهادة الكفاءة المهنية الكبا (CAPA)", "مستشار قانوني للشركات ومصالح المنازعات", "كاتب عدل (نوتاير) ومحضر قضائي", "الالتحاق بسلك القضاء عبر المدرسة العليا للقضاء"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "50,000 - 200,000 دج",
    relatedSpecialties: ["commerce", "arabic"],
    universities: [
      { name: "كلية الحقوق بالجزائر العاصمة (سعيد حمدين)", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "كلية الحقوق والعلوم السياسية ببلعباس", location: "سيدي بلعباس", wilayaCode: 22, type: "جامعة" },
      { name: "جامعة قسنطينة 1 - كلية الحقوق", location: "قسنطينة", wilayaCode: 25, type: "جامعة" }
    ]
  },
  {
    id: "arch",
    code: "T14",
    name: "الهندسة المعمارية والعمران (Architecture)",
    category: "علوم دقيقة وتقنية",
    minGrades: {
      [BACStream.SCIENCES]: 14.50,
      [BACStream.MATH]: 13.50,
      [BACStream.TECHNICAL]: 13.80
    },
    durationYears: 5,
    difficulty: "مرتفع",
    description: "تخصص يجمع بين الهندسة التقنية والإبداع الفني والتصميم الجمالي لتخطيط وتشييد المباني والمدن المستدامة، مع مراعاة الطبيعة والخصائص المعمارية الجزائرية والإسلامية والحديثة.",
    subjects: ["التصميم المعماري ومشاريع ورشات ومجسمات رقمية", "تاريخ وقواعد نظرية الفنون والعمارة", "ميكانيكا التربة واستقرار هياكل ومواد البناء الأساسية", "التخطيط الحضري وتأثير البيئة والمدينة الذكية"],
    careerOpportunities: ["مهندس معماري معتمد لفتح مكتب دراسات هندسي خاص", "العمل بمديريات البناء والتعمير التابعة للولاية والسكن (OPGI)", "العمل بشركات ترقية العقار والمقاولات المصاحبة للتشييد"],
    freelancePotential: "ممتاز",
    postGraduateChance: "متوسط",
    approxSalaryRange: "65,000 - 180,000 دج",
    relatedSpecialties: ["st", "enst"],
    universities: [
      { name: "المدرسة متعددة العلوم للهندسة المعمارية والعمران (EPAU)", location: "الحراش - الجزائر العاصمة", wilayaCode: 16, type: "مدرسة عليا" },
      { name: "جامعة قسنطينة 3 - معهد التهيئة والعمران", location: "قسنطينة", wilayaCode: 25, type: "جامعة" },
      { name: "جامعة مستغانم - قسم هندسة وتخطيط المعمار", location: "مستغانم", wilayaCode: 27, type: "جامعة" }
    ]
  },
  {
    id: "biotech",
    code: "S02",
    name: "البيوتكنولوجيا والهندسة الوراثية (Biotechnologie)",
    category: "علوم طبية وصحية",
    minGrades: {
      [BACStream.SCIENCES]: 14.00,
      [BACStream.MATH]: 13.50,
      [BACStream.TECHNICAL]: 14.00
    },
    durationYears: 5,
    difficulty: "مرتفع",
    description: "مدرسة نخبوية بقسنطينة لتكوين الكفاءات في استخدام الكائنات الحية لتطوير تقنيات في الصيدلة، الزراعة الذكية، والأغذية السليمة وتطبيقات التحسين الغذائي والوراثي.",
    subjects: ["علم الوراثة الخلوي والجزئي المتقدم", "الهندسة الأنزيمية وعلم الأحياء الدقيقة الصناعي", "معالجة اللقاحات وتكنولوجيا المستحضرات الحيوية", "المعلوماتية الحيوية ورقمنة المخابر والجينات"],
    careerOpportunities: ["باحث ومطور بمخابر تصنيع الأغذية والأدوية", "مراقب جودة المحاصيل والإنتاج الفلاحي ومصانع الألبان", "باحث بالمراكز الطبية الحيوية والمعهد الوطني للبيوتكنولوجيا"],
    freelancePotential: "مقبول",
    postGraduateChance: "مرتفع",
    approxSalaryRange: "75,000 - 160,000 دج",
    relatedSpecialties: ["phar", "st"],
    universities: [
      { name: "المدرسة الوطنية العليا للبيوتكنولوجيا (ENSB)", location: "قسنطينة", wilayaCode: 25, type: "مدرسة عليا" }
    ]
  },
  {
    id: "arabic",
    code: "L03",
    name: "اللغة العربية وآدابها (Langue Arabe)",
    category: "لغات وترجمة وآداب",
    minGrades: {
      [BACStream.SCIENCES]: 10.00,
      [BACStream.MATH]: 10.00,
      [BACStream.TECHNICAL]: 10.00,
      [BACStream.ECONOMICS]: 10.00,
      [BACStream.PHILOSOPHY]: 10.00,
      [BACStream.LANGUAGES]: 10.00
    },
    durationYears: 3,
    difficulty: "سلس",
    description: "دراسة غنية لقواعد اللغة العربية، البلاغة، النقد الأدبي القديم والحديث، والشعر والنثر في الفترات التاريخية المختلفة، مع التركيز على الموروث الثقافي والأدبي الجزائري.",
    subjects: ["النحو، الصرف والعروض الشعري ومخارج نطق الحروف", "البلاغة العربية والبيان والإعجاز والجمال اللفظي", "النقد الأدبي والمناهج المعاصرة والمقارنة للأدبي واللساني", "الأدب الجزائري عبر العصور والمغاربي والإسلامي"],
    careerOpportunities: ["محرر ومصحح لغوي لدى الصحف ودور النشر والمواقع الرقمية", "العمل في مجالات الإعلام والصحافة والإذاعة والتقديم الإخباري", "أستاذ لغة عربية بعد اجتياز مسابقة التعليم بالطور الابتدائي أو المتوسط", "العمل بالمراكز الثقافية ودواوين الحفاظ على التراث الأدبي والتاريخي"],
    freelancePotential: "مقبول",
    postGraduateChance: "متوسط",
    approxSalaryRange: "40,000 - 80,000 دج",
    relatedSpecialties: ["english", "translate", "ens"],
    universities: [
      { name: "جامعة الجزائر 2 (بوزريعة) - كلية الآداب واللغات العربية", location: "الجزائر العاصمة", wilayaCode: 16, type: "جامعة" },
      { name: "جامعة المسيلة - كلية الآداب واللغات", location: "المسيلة", wilayaCode: 28, type: "جامعة" },
      { name: "جامعة قسنطينة 1 - معهد الآداب", location: "قسنطينة", wilayaCode: 25, type: "جامعة" }
    ]
  }
];

export function getEligibleSpecialties(grade: number, stream: string): Specialty[] {
  return SPECIALTIES.filter((spec) => {
    const minGrade = spec.minGrades[stream as BACStream];
    if (minGrade === undefined) return false;
    return grade >= minGrade;
  });
}
