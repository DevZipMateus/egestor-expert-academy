export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          created_at: string | null
          email_sent_at: string | null
          exam_attempt_id: string
          id: string
          issued_at: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          created_at?: string | null
          email_sent_at?: string | null
          exam_attempt_id: string
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          created_at?: string | null
          email_sent_at?: string | null
          exam_attempt_id?: string
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_exam_attempt_id_fkey"
            columns: ["exam_attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_exams: {
        Row: {
          ativo: boolean | null
          course_id: string
          created_at: string | null
          descricao: string | null
          id: string
          ordem: number
          passing_score: number
          randomize_options: boolean | null
          randomize_questions: boolean | null
          time_limit_minutes: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          course_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem: number
          passing_score?: number
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          time_limit_minutes?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          course_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          passing_score?: number
          randomize_options?: boolean | null
          randomize_questions?: boolean | null
          time_limit_minutes?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          slug: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          slug: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          slug?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          created_at: string | null
          exam_id: string
          id: string
          passed: boolean
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          created_at?: string | null
          exam_id: string
          id?: string
          passed: boolean
          score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          created_at?: string | null
          exam_id?: string
          id?: string
          passed?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "course_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_question_options: {
        Row: {
          correta: boolean | null
          created_at: string | null
          exam_question_id: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          correta?: boolean | null
          created_at?: string | null
          exam_question_id: string
          id?: string
          ordem: number
          texto: string
        }
        Update: {
          correta?: boolean | null
          created_at?: string | null
          exam_question_id?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_options_exam_question_id_fkey"
            columns: ["exam_question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          created_at: string | null
          exam_id: string
          id: string
          ordem: number
          pergunta: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          id?: string
          ordem: number
          pergunta: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          id?: string
          ordem?: number
          pergunta?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "course_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          ativo: boolean | null
          course_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          course_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          course_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      progresso_usuario: {
        Row: {
          aulas_assistidas: number[] | null
          course_id: string
          created_at: string | null
          data_atualizacao: string | null
          id: string
          progresso_percentual: number | null
          respostas_exercicios: Json | null
          started_at: string | null
          usuario_id: string
        }
        Insert: {
          aulas_assistidas?: number[] | null
          course_id: string
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          progresso_percentual?: number | null
          respostas_exercicios?: Json | null
          started_at?: string | null
          usuario_id: string
        }
        Update: {
          aulas_assistidas?: number[] | null
          course_id?: string
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          progresso_percentual?: number | null
          respostas_exercicios?: Json | null
          started_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_usuario_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          correta: boolean | null
          created_at: string | null
          id: string
          ordem: number
          question_id: string | null
          texto: string
        }
        Insert: {
          correta?: boolean | null
          created_at?: string | null
          id?: string
          ordem: number
          question_id?: string | null
          texto: string
        }
        Update: {
          correta?: boolean | null
          created_at?: string | null
          id?: string
          ordem?: number
          question_id?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          course_id: string | null
          created_at: string | null
          explicacao: string | null
          id: string
          pergunta: string
          slide_id: number | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          explicacao?: string | null
          id?: string
          pergunta: string
          slide_id?: number | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          explicacao?: string | null
          id?: string
          pergunta?: string
          slide_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "slides"
            referencedColumns: ["id"]
          },
        ]
      }
      slides: {
        Row: {
          ativo: boolean | null
          conteudo: string | null
          course_id: string | null
          created_at: string | null
          exam_id: string | null
          id: number
          image_url: string | null
          module_id: string | null
          ordem: number
          tipo: string
          titulo: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: string | null
          course_id?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: number
          image_url?: string | null
          module_id?: string | null
          ordem: number
          tipo: string
          titulo: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string | null
          course_id?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: number
          image_url?: string | null
          module_id?: string | null
          ordem?: number
          tipo?: string
          titulo?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slides_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slides_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "course_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slides_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
