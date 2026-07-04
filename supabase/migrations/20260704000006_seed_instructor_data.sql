UPDATE public.instructors
SET 
  specialties = ARRAY['Liderazgo', 'Finanzas', 'Innovación', 'Scrum'],
  rating = 4.9,
  experience = '[
    {"id": "1", "role": "Gerente de Proyectos de Innovación", "company": "Banco de Crédito del Perú (BCP)", "startYear": "2020", "endYear": ""},
    {"id": "2", "role": "Consultor Estratégico", "company": "Deloitte Perú", "startYear": "2015", "endYear": "2020"}
  ]'::jsonb,
  education = '[
    {"id": "1", "degree": "MBA (Master in Business Administration)", "institution": "ESAN", "startYear": "2016", "endYear": "2018"},
    {"id": "2", "degree": "Ingeniero Industrial", "institution": "Universidad Nacional de Ingeniería (UNI)", "startYear": "2008", "endYear": "2013"}
  ]'::jsonb,
  testimonials = '[
    {"id": "1", "text": "La metodología del profesor es increíble. Siempre pone casos prácticos que se aplican a la vida real.", "author": "Andrea J. - Curso de Scrum"},
    {"id": "2", "text": "Gracias a este programa pude ascender en mi trabajo. La claridad con la que explica los temas complejos no tiene precio.", "author": "Roberto C. - PADE en Finanzas"}
  ]'::jsonb,
  publications = '[
    {"id": "1", "title": "El futuro de las metodologías ágiles en la banca peruana", "url": "https://linkedin.com"},
    {"id": "2", "title": "Guía práctica: Cómo gestionar equipos de alto rendimiento", "url": "https://medium.com"}
  ]'::jsonb,
  linkedin_url = 'https://linkedin.com/in/ejemplo'
WHERE name IS NOT NULL;
