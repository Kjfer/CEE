# Landing Page — CEE UNI: Diplomado en Ciberseguridad Industrial

## Estructura del Proyecto

```
firminaslanding/
├── index.html          Landing page completa
├── js/
│   ├── config.js       CONFIGURACIÓN (editar aquí el webhook URL)
│   └── main.js         Lógica de formularios, modal, carrusel, etc.
├── css/
│   └── custom.css      Estilos personalizados
└── img/                Imágenes (vacío — agregar si se necesitan)
```

## Configuración Rápida

Edita `js/config.js` y cambia la URL del webhook:

```js
window.LANDING_CONFIG = {
  webhookURL: 'https://tu-webhook-url.com/endpoint',  // ← CAMBIAR ESTO
  cursoNombre: 'Diplomado en Ciberseguridad Industrial y Gestión de Riesgos Digitales',
  cursoId: 'ciber-ind-2026',
  timeout: 10000,
  messages: {
    loading: 'Enviando tus datos...',
    success: '¡Registro exitoso! Recibirás el sílabo en tu correo en los próximos minutos.',
    error: 'Hubo un error al enviar tus datos. Por favor, intenta nuevamente.'
  }
};
```

## Estructura del JSON que envía cada lead

Cada formulario envía un POST con este formato al webhook:

```json
{
  "nombre": "Juan Pérez García",
  "email": "juan@empresa.com",
  "telefono": "+51 999 999 999",
  "empresa": "Minera X S.A.C.",
  "cargo": "Jefe de Operaciones",
  "source": "modal",
  "cursoId": "ciber-ind-2026",
  "cursoNombre": "Diplomado en Ciberseguridad Industrial y Gestión de Riesgos Digitales",
  "timestamp": "2026-06-18T12:00:00.000Z",
  "pageUrl": "https://landing.cee-uni.edu.pe/ciberseguridad",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

El campo `source` puede ser `"modal"` o `"sidebar"` dependiendo de qué formulario capturó el lead.

## Modo Desarrollo

Si `webhookURL` está vacío o tiene el valor por defecto (`https://tu-webhook-url.com/endpoint`), los datos **no se envían** y se muestran en la consola del navegador (`console.log`). Esto permite probar sin backend.

Para ver los datos en consola:
1. Abre la landing en el navegador
2. Abre DevTools (F12) → pestaña Console
3. Llena un formulario y envíalo
4. Verás: `[DEV MODE] Lead captured: { ... }`

## Integraciones

### Zapier / Make (n8n)

1. Crea un Zap/Scenario con trigger **Webhooks → Catch Hook**
2. Copia la URL que te da Zapier (ej: `https://hooks.zapier.com/hooks/catch/123456/abcde/`)
3. Pégala en `config.js` como `webhookURL`
4. Envía un lead de prueba desde la landing
5. Zapier detectará los campos automáticamente

### HubSpot

1. Ve a Settings → Operations → Webhooks
2. Crea un webhook de entrada con tu URL
3. O usa Zapier como intermediario: Zapier Webhook → HubSpot Create Contact

### Google Sheets (vía Zapier)

1. Crea un Zap: Webhook (trigger) → Google Sheets (action: Create Row)
2. Mapea los campos del JSON a columnas de tu hoja
3. Pega la URL del webhook de Zapier en `config.js`

### Backend Propio (Node.js / Python / PHP)

Tu endpoint debe:
- Aceptar requests `POST` con `Content-Type: application/json`
- Responder con status `200` o `201`
- Opcionalmente responder con un JSON (no se usa en el frontend)

Ejemplo mínimo en Node.js (Express):

```js
app.post('/api/leads', (req, res) => {
  const lead = req.body;
  // Guardar en base de datos, enviar email, etc.
  console.log('Nuevo lead:', lead);
  res.status(200).json({ ok: true });
});
```

Ejemplo mínimo en Python (Flask):

```python
@app.route('/api/leads', methods=['POST'])
def receive_lead():
    lead = request.get_json()
    # Guardar en base de datos, enviar email, etc.
    return jsonify({'ok': True}), 200
```

## Anti-Spam

Los formularios incluyen un campo honeypot (`website_url`) invisible para humanos. Si un bot lo llena, el lead se descarta silenciosamente sin enviar datos al webhook.

## Despliegue

### Netlify (Recomendado)

```bash
git init
git add .
git commit -m "Landing page CEE UNI - Ciberseguridad Industrial"
git remote add origin https://github.com/tu-org/firminaslanding.git
git push -u origin main
```

Luego en Netlify: Import from Git → seleccionar repo → Deploy.

### Vercel

```bash
npm i -g vercel
vercel
```

### GitHub Pages

1. Sube el repo a GitHub
2. Settings → Pages → Source: main branch → Save

## Notas Técnicas

- **Sin dependencias:** No usa npm, webpack, ni frameworks. Solo HTML + Tailwind CDN + JS vanilla.
- **Tailwind CSS:** Se carga desde CDN (`cdn.tailwindcss.com`). Para producción, considerar compilar con PostCSS.
- **Formularios:** Dos puntos de captura — modal multi-step (5 campos) y sidebar sticky (3 campos).
- **Carrusel:** Auto-scroll infinito con CSS + JS. Se pausa al interactuar.
- **Sin fugas de tráfico:** No hay links externos, redes sociales ni menú de navegación.
