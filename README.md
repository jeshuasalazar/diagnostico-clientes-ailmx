# aiLearning — AI Audit Gateway & Diagnóstico Operativo (V2.0)

Este es el sistema interactivo de diagnóstico y simulación de retorno de inversión (**ROI**) diseñado para consultores de **aiLearning.mx**. Permite calificar cuellos de botella en videollamadas en vivo con clientes, calcular el **Costo del Dolor**, priorizar procesos mediante una matriz multicriterio, y estructurar una propuesta de **Fuerza Laboral IA** (Sprint MVP) con descarga e impresión directa de reportes PDF de alta fidelidad.

---

## 🚀 Características Clave

1. **Wizard de Diagnóstico (8 Pasos)**: Flujo de trabajo completo desde la recopilación de datos comerciales, filtrado por vertical de negocio, cuantificación financiera de fricciones, matriz ponderada de prioridades, ingeniería de ROI, y cierre comercial.
2. **Lógica de Ingeniería Financiera Rigurosa**:
   - **Phantom Productivity (Productividad Fantasma)**: Aplica de forma estricta un factor del **60%** sobre las horas-hombre liberadas reales, garantizando métricas financieramente creíbles ante CFOs.
   - **Ingresos por Conversión Comercial**: Proyecta la recuperación de leads multiplicada por el ticket promedio y el **margen neto** del cliente.
3. **Doble Estructura DOM para PDF**: El portal del cliente y del consultor renderizan un Dashboard interactivo en pantalla y un contenedor oculto `@media print` en formato A4/Carta estilo typewriter/invoice para descargas nativas limpias y en html2pdf.js.
4. **Persistencia Local SQLite**: Base de datos ligera e integrada de configuración cero para facilitar el despliegue instantáneo en la nube.
5. **Dashboard del Cliente Compartible**: Enlace único de solo lectura generado a través de un UUID persistente para que el cliente final pueda auditar sus métricas y descargar su PDF.

---

## 🛠️ Stack Tecnológico

- **Backend**: Node.js, Express, SQLite3 (Persistencia local), UUID (Identificadores únicos).
- **Frontend**: HTML5 Semántico, Vanilla CSS (Estética ultra-premium Glassmorphism & HSL Colors), Chart.js v4.4.1 (Gráfico Radar), html2pdf.js.

---

## 💻 Configuración Local y Ejecución

Sigue estos pasos para correr el sistema en tu computadora en menos de 2 minutos:

### 1. Requisitos Previos
- Tener instalado **Node.js** (versión 16 o superior recomendado).

### 2. Instalación de Dependencias
En la carpeta raíz del proyecto, abre una terminal y ejecuta:
```bash
npm install
```
Esto instalará `express`, `sqlite3` y `uuid`.

### 3. Iniciar el Servidor de Desarrollo
Corre el siguiente comando:
```bash
npm start
```
Verás el mensaje en la consola:
```text
Server is running on port 3000
Connected to SQLite database at: .../diagnosticos.db
diagnosticos table ready.
```

### 4. Acceso en el Navegador
Abre tu navegador y entra a:
* **Workspace del Consultor (Llenado y Lista)**: [http://localhost:3000](http://localhost:3000)

---

## 📦 Cómo Subir el Proyecto a GitHub

Para poder hacer deploy en plataformas cloud como Railway, primero debes subir tu código a tu repositorio de GitHub:

1. **Inicializar Repositorio Local**:
   ```bash
   git init
   ```
2. **Vincular a tu GitHub**:
   Crea un repositorio vacío en tu cuenta de GitHub (ej. `diagnostico-ailearning`) y ejecuta:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   ```
3. **Agregar Archivos e Ignorar Temporales**:
   *(El archivo `.gitignore` ya está configurado para omitir automáticamente `node_modules` y bases de datos locales de prueba `diagnosticos.db`)*.
   ```bash
   git add .
   ```
4. **Hacer el Primer Commit**:
   ```bash
   git commit -m "feat: release oficial de portal de diagnostico v2.0"
   ```
5. **Subir Código a la Rama Principal**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ Despliegue en Railway (Paso a Paso)

Railway es ideal para este proyecto porque compila el backend de Node de inmediato y soporta volúmenes persistentes de disco para que tu base de datos SQLite no pierda registros.

### Paso 1: Crear el Servicio en Railway
1. Ve a [Railway.app](https://railway.app) e inicia sesión con tu cuenta.
2. Haz clic en **"New Project"** ➔ **"Deploy from GitHub repo"**.
3. Selecciona tu repositorio recién subido (`diagnostico-ailearning`).
4. Railway detectará de forma automática el archivo `package.json` y el `Procfile` (`web: node server.js`) para arrancar.

### Paso 2: Crear e Integrar un Volumen Persistente (Crucial para SQLite)
> [!IMPORTANT]
> Los servidores en la nube son efímeros; si el servidor se reinicia o haces un commit nuevo, los archivos locales se eliminan. Para que tu base de datos SQLite persistente no se borre nunca, debemos montarle un **Volume (Disco duro virtual)**:

1. En el panel de control de tu proyecto en Railway, haz clic en **"+ Add Service"** (arriba a la derecha) o haz clic derecho en el canvas.
2. Selecciona **"Volume"**.
3. Se creará un disco duro. Haz clic en él, ve a **Settings** y cámbiale el nombre a `db-volume` (opcional).
4. Arrastra el bloque del **Volume** y conéctalo con tu servicio de Node.js (o entra a los ajustes de tu servicio de Node.js, ve a la pestaña **Volumes** y haz clic en **"Mount Volume"**).
5. Railway te preguntará el **Mount Path** (ruta de montaje). Ingresa exactamente:
   ```text
   /data
   ```
   *(Esto creará una carpeta `/data` en el disco duro persistente de tu servidor)*.

### Paso 3: Configurar Variables de Entorno en el Servicio de Node.js
Para que nuestra base de datos SQLite apunte al volumen persistente y el puerto se asigne de forma correcta, ve a la pestaña **Variables** (del servicio web de tu aplicación) y agrega:

1. **`DATABASE_PATH`**:
   ```text
   /data/diagnosticos.db
   ```
   *(Esto le dice a `database.js` que en lugar de escribir en la carpeta del código, guarde el archivo en el volumen persistente seguro)*.
2. **`PORT`**:
   *(Railway la asigna automáticamente, pero Express ya la detecta con `process.env.PORT || 3000`)*.

### Paso 4: Generar tu Dominio Público
1. En tu servicio de Node en Railway, ve a la pestaña **Settings**.
2. En la sección **Networking**, busca **Public Networking** y haz clic en **"Generate Domain"**.
3. ¡Listo! Railway te dará una URL segura SSL (ej. `https://diagnostico-ailearning-production.up.railway.app`).

Ya puedes abrir esa URL pública para que tus consultores llenen diagnósticos desde cualquier parte del mundo y envíen los enlaces únicos a los clientes con formato `https://tu-app.railway.app/cliente/UUID_DE_SESION`.
