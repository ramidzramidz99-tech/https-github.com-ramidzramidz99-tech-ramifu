/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BACStream {
  SCIENCES = "علوم تجريبية",
  MATH = "رياضيات",
  TECHNICAL = "تقني رياضي",
  ECONOMICS = "تسيير واقتصاد",
  PHILOSOPHY = "آداب وفلسفة",
  LANGUAGES = "لغات أجنبية"
}

export interface MinGradePerStream {
  [BACStream.SCIENCES]?: number;
  [BACStream.MATH]?: number;
  [BACStream.TECHNICAL]?: number;
  [BACStream.ECONOMICS]?: number;
  [BACStream.PHILOSOPHY]?: number;
  [BACStream.LANGUAGES]?: number;
}

export interface UniversityDetail {
  name: string;
  location: string;
  wilayaCode: number;
  type: "جامعة" | "مدرسة عليا" | "معهد وطني";
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  category: string;
  minGrades: MinGradePerStream;
  durationYears: number;
  difficulty: "مرتفع جداً" | "مرتفع" | "متوسط" | "سلس";
  description: string;
  subjects: string[];
  careerOpportunities: string[];
  freelancePotential: string; // "ممتاز" | "مقبول" | "محدود"
  postGraduateChance: string; // "مرتفع" | "متوسط" | "محدود"
  approxSalaryRange: string; // range in DA, e.g. "70,000 - 150,000 دج"
  relatedSpecialties: string[];
  universities: UniversityDetail[];
}

export interface BACInfo {
  grade: number;
  stream: string;
  year: number;
  wilayaCode?: number;
}

export interface QuizAnswers {
  subjects: string[]; // favorite subjects
  workPreference: string; // office vs field
  lovesCoding: string; // yes/no/maybe
  lovesHelpingPeople: string; // yes/no/maybe
  businessOriented: string; // yes/no/maybe
  dreamCareer: string; // text input
}

export interface RecommendedSpecialty {
  specialtyId: string;
  compatibilityScore: number; // 0 to 100
  recommendationLevel: "ممتاز" | "جيد" | "غير موصى به";
  reason: string;
}

export interface StudentProfileReport {
  strengths: string[];
  potentialSkills: string[];
  preferredFields: string[];
  topSpecialties: string[];
  futureJobs: string[];
  developmentTips: string[];
}

export interface SmartOrientationResult {
  recommendations: RecommendedSpecialty[];
  report: StudentProfileReport;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
