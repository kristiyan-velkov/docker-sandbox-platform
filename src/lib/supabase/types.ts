import type { LabInterest, LabQuestionId, LabProgressStatus, WorkshopLabId } from "@/lib/labs";

export type { LabInterest, LabQuestionId, WorkshopLabId, LabProgressStatus };

export type WorkshopSignup = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  lab_interest: LabInterest;
  current_lab_id: WorkshopLabId | null;
  furthest_lab_id: WorkshopLabId | null;
  total_duration_seconds: number;
  auth_user_id: string | null;
  is_admin: boolean;
  created_at: string;
};

export type WorkshopLabProgress = {
  id: string;
  signup_id: string;
  lab_id: WorkshopLabId;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
};

export type LabProgressEntry = {
  labId: WorkshopLabId;
  status: LabProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
};

export type AttendeeLabProgress = {
  signup: WorkshopSignup;
  entries: Record<WorkshopLabId, LabProgressEntry>;
  completedCount: number;
  totalDurationSeconds: number;
};

export type WorkshopQuestion = {
  id: string;
  name: string;
  email: string;
  lab_id: LabQuestionId;
  question: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      workshop_signups: {
        Row: WorkshopSignup;
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          role?: string | null;
          lab_interest?: LabInterest;
          current_lab_id?: WorkshopLabId | null;
          furthest_lab_id?: WorkshopLabId | null;
          total_duration_seconds?: number;
          auth_user_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<WorkshopSignup>;
        Relationships: [];
      };
      workshop_lab_progress: {
        Row: WorkshopLabProgress;
        Insert: {
          id?: string;
          signup_id: string;
          lab_id: WorkshopLabId;
          status: "in_progress" | "completed";
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<WorkshopLabProgress>;
        Relationships: [];
      };
      workshop_questions: {
        Row: WorkshopQuestion;
        Insert: {
          id?: string;
          name: string;
          email: string;
          lab_id: LabQuestionId;
          question: string;
          created_at?: string;
        };
        Update: Partial<WorkshopQuestion>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AttendeeWithQuestions = WorkshopSignup & {
  questions: WorkshopQuestion[];
  labProgress: WorkshopLabProgress[];
};
