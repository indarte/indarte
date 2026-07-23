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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artesano_galeria: {
        Row: {
          artesano_id: string
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string
          orden: number
        }
        Insert: {
          artesano_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url: string
          orden?: number
        }
        Update: {
          artesano_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "artesano_galeria_artesano_id_fkey"
            columns: ["artesano_id"]
            isOneToOne: false
            referencedRelation: "artesanos"
            referencedColumns: ["id"]
          },
        ]
      }
      artesanos: {
        Row: {
          activo: boolean
          biografia: string | null
          created_at: string
          disponible: boolean
          facebook: string | null
          foto_url: string | null
          id: string
          instagram: string | null
          nombre: string
          oficio: string
          profile_id: string | null
          provincia: string | null
          telefono: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          activo?: boolean
          biografia?: string | null
          created_at?: string
          disponible?: boolean
          facebook?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          nombre: string
          oficio: string
          profile_id?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          activo?: boolean
          biografia?: string | null
          created_at?: string
          disponible?: boolean
          facebook?: string | null
          foto_url?: string | null
          id?: string
          instagram?: string | null
          nombre?: string
          oficio?: string
          profile_id?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artesanos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asistencia: {
        Row: {
          clase_id: string
          created_at: string
          estudiante_id: string
          id: string
          presente: boolean
          registrado_por: string | null
        }
        Insert: {
          clase_id: string
          created_at?: string
          estudiante_id: string
          id?: string
          presente?: boolean
          registrado_por?: string | null
        }
        Update: {
          clase_id?: string
          created_at?: string
          estudiante_id?: string
          id?: string
          presente?: boolean
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calificaciones: {
        Row: {
          concepto: string
          created_at: string
          curso_id: string
          estudiante_id: string
          id: string
          nota: number | null
          registrado_por: string | null
        }
        Insert: {
          concepto: string
          created_at?: string
          curso_id: string
          estudiante_id: string
          id?: string
          nota?: number | null
          registrado_por?: string | null
        }
        Update: {
          concepto?: string
          created_at?: string
          curso_id?: string
          estudiante_id?: string
          id?: string
          nota?: number | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          codigo_verificacion: string
          created_at: string
          curso_id: string
          estudiante_id: string
          fecha_emision: string
          id: string
          url_pdf: string | null
        }
        Insert: {
          codigo_verificacion: string
          created_at?: string
          curso_id: string
          estudiante_id: string
          fecha_emision?: string
          id?: string
          url_pdf?: string | null
        }
        Update: {
          codigo_verificacion?: string
          created_at?: string
          curso_id?: string
          estudiante_id?: string
          fecha_emision?: string
          id?: string
          url_pdf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificados_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clases: {
        Row: {
          created_at: string
          curso_id: string
          docente_id: string | null
          fecha: string
          grabacion_url: string | null
          id: string
          link_videoconferencia: string | null
          material_url: string | null
          titulo: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          docente_id?: string | null
          fecha: string
          grabacion_url?: string | null
          id?: string
          link_videoconferencia?: string | null
          material_url?: string | null
          titulo: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          docente_id?: string | null
          fecha?: string
          grabacion_url?: string | null
          id?: string
          link_videoconferencia?: string | null
          material_url?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "clases_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinadores_eje: {
        Row: {
          eje_id: string
          profile_id: string
        }
        Insert: {
          eje_id: string
          profile_id: string
        }
        Update: {
          eje_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinadores_eje_eje_id_fkey"
            columns: ["eje_id"]
            isOneToOne: false
            referencedRelation: "ejes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordinadores_eje_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_docentes: {
        Row: {
          curso_id: string
          docente_id: string
        }
        Insert: {
          curso_id: string
          docente_id: string
        }
        Update: {
          curso_id?: string
          docente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_docentes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_docentes_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          activo: boolean
          coordinador_id: string | null
          created_at: string
          cupo_maximo: number | null
          descripcion: string | null
          eje_id: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          modalidad: string | null
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          coordinador_id?: string | null
          created_at?: string
          cupo_maximo?: number | null
          descripcion?: string | null
          eje_id: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          modalidad?: string | null
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          coordinador_id?: string | null
          created_at?: string
          cupo_maximo?: number | null
          descripcion?: string | null
          eje_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          modalidad?: string | null
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_coordinador_id_fkey"
            columns: ["coordinador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursos_eje_id_fkey"
            columns: ["eje_id"]
            isOneToOne: false
            referencedRelation: "ejes"
            referencedColumns: ["id"]
          },
        ]
      }
      donaciones: {
        Row: {
          created_at: string
          desea_comprobante: boolean
          desea_informe_impacto: boolean
          donante_profile_id: string | null
          eje_id: string | null
          email_donante: string
          estado: Database["public"]["Enums"]["estado_donacion"]
          id: string
          metodo_pago: string | null
          moneda: string
          monto: number
          nombre_donante: string
          referencia_pago: string | null
          telefono_donante: string | null
          tipo: Database["public"]["Enums"]["tipo_donacion"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          desea_comprobante?: boolean
          desea_informe_impacto?: boolean
          donante_profile_id?: string | null
          eje_id?: string | null
          email_donante: string
          estado?: Database["public"]["Enums"]["estado_donacion"]
          id?: string
          metodo_pago?: string | null
          moneda?: string
          monto: number
          nombre_donante: string
          referencia_pago?: string | null
          telefono_donante?: string | null
          tipo?: Database["public"]["Enums"]["tipo_donacion"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          desea_comprobante?: boolean
          desea_informe_impacto?: boolean
          donante_profile_id?: string | null
          eje_id?: string | null
          email_donante?: string
          estado?: Database["public"]["Enums"]["estado_donacion"]
          id?: string
          metodo_pago?: string | null
          moneda?: string
          monto?: number
          nombre_donante?: string
          referencia_pago?: string | null
          telefono_donante?: string | null
          tipo?: Database["public"]["Enums"]["tipo_donacion"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donaciones_donante_profile_id_fkey"
            columns: ["donante_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donaciones_eje_id_fkey"
            columns: ["eje_id"]
            isOneToOne: false
            referencedRelation: "ejes"
            referencedColumns: ["id"]
          },
        ]
      }
      ejes: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      entregas: {
        Row: {
          archivo_url: string | null
          comentario: string | null
          created_at: string
          estado: Database["public"]["Enums"]["estado_entrega"]
          estudiante_id: string
          fecha_calificada: string | null
          fecha_entregada: string | null
          feedback_docente: string | null
          id: string
          nota: number | null
          tarea_id: string
          updated_at: string
        }
        Insert: {
          archivo_url?: string | null
          comentario?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_entrega"]
          estudiante_id: string
          fecha_calificada?: string | null
          fecha_entregada?: string | null
          feedback_docente?: string | null
          id?: string
          nota?: number | null
          tarea_id: string
          updated_at?: string
        }
        Update: {
          archivo_url?: string | null
          comentario?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_entrega"]
          estudiante_id?: string
          fecha_calificada?: string | null
          fecha_entregada?: string | null
          feedback_docente?: string | null
          id?: string
          nota?: number | null
          tarea_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          curso_id: string
          estado: Database["public"]["Enums"]["estado_inscripcion"]
          estudiante_id: string
          fecha_inscripcion: string
          id: string
        }
        Insert: {
          curso_id: string
          estado?: Database["public"]["Enums"]["estado_inscripcion"]
          estudiante_id: string
          fecha_inscripcion?: string
          id?: string
        }
        Update: {
          curso_id?: string
          estado?: Database["public"]["Enums"]["estado_inscripcion"]
          estudiante_id?: string
          fecha_inscripcion?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes_contacto: {
        Row: {
          asunto: string | null
          created_at: string
          email: string
          id: string
          leido: boolean
          mensaje: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          asunto?: string | null
          created_at?: string
          email: string
          id?: string
          leido?: boolean
          mensaje: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          asunto?: string | null
          created_at?: string
          email?: string
          id?: string
          leido?: boolean
          mensaje?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      recursos_biblioteca: {
        Row: {
          acceso: Database["public"]["Enums"]["nivel_acceso"]
          archivo_url: string | null
          creado_por: string | null
          created_at: string
          descripcion: string | null
          eje_id: string | null
          etiquetas: string[] | null
          id: string
          nivel: string | null
          tipo: Database["public"]["Enums"]["tipo_recurso"]
          titulo: string
          updated_at: string
        }
        Insert: {
          acceso?: Database["public"]["Enums"]["nivel_acceso"]
          archivo_url?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          eje_id?: string | null
          etiquetas?: string[] | null
          id?: string
          nivel?: string | null
          tipo: Database["public"]["Enums"]["tipo_recurso"]
          titulo: string
          updated_at?: string
        }
        Update: {
          acceso?: Database["public"]["Enums"]["nivel_acceso"]
          archivo_url?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          eje_id?: string | null
          etiquetas?: string[] | null
          id?: string
          nivel?: string | null
          tipo?: Database["public"]["Enums"]["tipo_recurso"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_biblioteca_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_biblioteca_eje_id_fkey"
            columns: ["eje_id"]
            isOneToOne: false
            referencedRelation: "ejes"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          creado_por: string | null
          created_at: string
          curso_id: string
          descripcion: string | null
          fecha_entrega: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          creado_por?: string | null
          created_at?: string
          curso_id: string
          descripcion?: string | null
          fecha_entrega?: string | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          creado_por?: string | null
          created_at?: string
          curso_id?: string
          descripcion?: string | null
          fecha_entrega?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      voluntarios: {
        Row: {
          area_interes: string
          created_at: string
          disponibilidad: string | null
          email: string
          estado: Database["public"]["Enums"]["estado_voluntario"]
          experiencia_previa: string | null
          id: string
          nombre: string
          notas_internas: string | null
          profile_id: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          area_interes: string
          created_at?: string
          disponibilidad?: string | null
          email: string
          estado?: Database["public"]["Enums"]["estado_voluntario"]
          experiencia_previa?: string | null
          id?: string
          nombre: string
          notas_internas?: string | null
          profile_id?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          area_interes?: string
          created_at?: string
          disponibilidad?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["estado_voluntario"]
          experiencia_previa?: string | null
          id?: string
          nombre?: string
          notas_internas?: string | null
          profile_id?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voluntarios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_coordinador_de_eje: {
        Args: { target_eje_id: string }
        Returns: boolean
      }
      is_docente_de_curso: {
        Args: { target_curso_id: string }
        Returns: boolean
      }
    }
    Enums: {
      estado_donacion: "pendiente" | "completada" | "fallida" | "cancelada"
      estado_entrega: "pendiente" | "entregada" | "calificada"
      estado_inscripcion:
        | "pendiente"
        | "confirmada"
        | "cancelada"
        | "completada"
      estado_voluntario: "pendiente" | "aprobado" | "archivado"
      nivel_acceso: "publico" | "restringido"
      tipo_donacion: "unica" | "recurrente"
      tipo_recurso: "documento" | "video" | "audio" | "presentacion"
      user_role:
        | "admin"
        | "coordinador_eje"
        | "docente"
        | "supervisor_infotep"
        | "estudiante"
        | "artesano"
        | "voluntario"
        | "donante"
        | "visitante"
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
      estado_donacion: ["pendiente", "completada", "fallida", "cancelada"],
      estado_entrega: ["pendiente", "entregada", "calificada"],
      estado_inscripcion: [
        "pendiente",
        "confirmada",
        "cancelada",
        "completada",
      ],
      estado_voluntario: ["pendiente", "aprobado", "archivado"],
      nivel_acceso: ["publico", "restringido"],
      tipo_donacion: ["unica", "recurrente"],
      tipo_recurso: ["documento", "video", "audio", "presentacion"],
      user_role: [
        "admin",
        "coordinador_eje",
        "docente",
        "supervisor_infotep",
        "estudiante",
        "artesano",
        "voluntario",
        "donante",
        "visitante",
      ],
    },
  },
} as const
