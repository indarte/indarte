export const ejes = [
  {
    slug: "educacion-artistica",
    title: "Educación Artística",
    tagline: "Formación integral a través del arte",
    description:
      "Programas de formación en artes visuales, música, danza y teatro para niños, jóvenes y adultos, con enfoque en la identidad cultural dominicana.",
    icon: "🎨",
  },
  {
    slug: "primera-infancia",
    title: "Atención a la Primera Infancia",
    tagline: "El arte como base del desarrollo temprano",
    description:
      "Iniciativas de estimulación artística y cultural para niñas y niños de 0 a 5 años, fortaleciendo el vínculo familiar y el desarrollo integral.",
    icon: "🌱",
  },
  {
    slug: "capacitacion",
    title: "Capacitación Técnico Profesional",
    tagline: "Oficios creativos con proyección laboral",
    description:
      "Formación técnica en oficios artísticos y culturales que abren oportunidades reales de inserción laboral y emprendimiento.",
    icon: "🛠️",
  },
  {
    slug: "fomento-artesanal",
    title: "Fomento y Desarrollo Artesanal",
    tagline: "Impulso a la artesanía dominicana",
    description:
      "Acompañamiento a artesanos y artesanas del país con capacitación, acceso a mercados y promoción de sus productos tradicionales.",
    icon: "🧵",
  },
] as const;

export const artesanos = [
  { nombre: "María Altagracia Peña", oficio: "Cerámica taína", provincia: "Higüey" },
  { nombre: "Ramón Encarnación", oficio: "Talla en caoba", provincia: "San Cristóbal" },
  { nombre: "Yenny Vásquez", oficio: "Tejido en guano", provincia: "El Seibo" },
  { nombre: "Julio Sánchez", oficio: "Máscaras de carnaval", provincia: "La Vega" },
  { nombre: "Rosa Delia Núñez", oficio: "Bordado tradicional", provincia: "Santiago" },
  { nombre: "Feliciano Pérez", oficio: "Instrumentos de merengue típico", provincia: "Puerto Plata" },
];

export const cursos = [
  {
    titulo: "Introducción a la pintura al óleo",
    modalidad: "Presencial",
    duracion: "8 semanas",
    cupo: 20,
    inicio: "15 de febrero 2026",
  },
  {
    titulo: "Cerámica tradicional dominicana",
    modalidad: "Presencial",
    duracion: "10 semanas",
    cupo: 15,
    inicio: "3 de marzo 2026",
  },
  {
    titulo: "Producción musical básica",
    modalidad: "Virtual",
    duracion: "6 semanas",
    cupo: 30,
    inicio: "20 de febrero 2026",
  },
  {
    titulo: "Danza folclórica para niños",
    modalidad: "Presencial",
    duracion: "12 semanas",
    cupo: 25,
    inicio: "10 de febrero 2026",
  },
];

export const noticias = [
  {
    slug: "graduacion-2025",
    titulo: "INDARTE gradúa a más de 300 estudiantes en artes y oficios",
    fecha: "12 de diciembre 2025",
    resumen:
      "Una nueva promoción de artistas y artesanos culmina su formación con una muestra abierta al público en Santo Domingo.",
  },
  {
    slug: "feria-artesanal",
    titulo: "Feria Nacional de Artesanía llega a su décima edición",
    fecha: "3 de noviembre 2025",
    resumen:
      "Más de 80 artesanos de todo el país presentaron sus creaciones en el Centro Cultural del Este.",
  },
  {
    slug: "convenio-unesco",
    titulo: "Firmado convenio de cooperación con UNESCO Caribe",
    fecha: "21 de septiembre 2025",
    resumen:
      "El acuerdo permitirá fortalecer los programas de primera infancia y salvaguardia del patrimonio inmaterial.",
  },
];

export const biblioteca = [
  { titulo: "Cuaderno pedagógico: Arte en la primera infancia", tipo: "PDF", anio: 2024 },
  { titulo: "Historia de la artesanía dominicana", tipo: "Libro digital", anio: 2023 },
  { titulo: "Guía metodológica para talleres de música", tipo: "PDF", anio: 2024 },
  { titulo: "Catálogo de artesanos INDARTE 2025", tipo: "PDF", anio: 2025 },
  { titulo: "Manual de danza folclórica", tipo: "Libro digital", anio: 2022 },
];

export const transparencia = [
  { titulo: "Memoria institucional 2024", tipo: "PDF" },
  { titulo: "Ejecución presupuestaria 2024", tipo: "PDF" },
  { titulo: "Plan estratégico 2025–2028", tipo: "PDF" },
  { titulo: "Nómina institucional", tipo: "PDF" },
  { titulo: "Compras y contrataciones", tipo: "Portal" },
];
