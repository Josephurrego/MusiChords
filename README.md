# 🎶 MusiChords

**MusiChords** es una aplicación web interactiva que detecta acordes de una canción en tiempo real y desplaza automáticamente la hoja de acordes sincronizada con la reproducción del audio. Diseñada para músicos, estudiantes y aficionados que desean practicar y tocar mientras siguen los acordes en pantalla.

## 🌐 Demo en vivo

Puedes probar la aplicación en vivo [aquí]:(https://musichords-ndcgf.ondigitalocean.app/)

## 🚀 Características

- 🎧 **Detección en tiempo real de acordes** a partir de un archivo de audio.
- 📜 **Desplazamiento automático** de los acordes según el tiempo de la canción.
- 🧠 Basado en **Python/Django** para el backend y **JavaScript/HTML/CSS** para el frontend.
- 🎵 Interfaz sencilla e intuitiva, pensada para acompañar la práctica musical.

## 🛠 Tecnologías utilizadas

- **Python** & **Django** – Backend y lógica del servidor.
- **JavaScript** – Sincronización en tiempo real y lógica interactiva.
- **HTML5 / CSS3** – Estructura y diseño de la interfaz.
- **Essentia.js** – Para deteccion de acordes.
- **Tonal.js** - Para manejo de acordes en las letras.

## 📷 Capturas de pantalla
![Captura](https://i.ibb.co/cXS7H2Hc/Screenshot-28-5-2025-17213-127-0-0-1.jpg)
![Captura](https://i.ibb.co/Q7CtJkfV/Screenshot-28-5-2025-17822-127-0-0-1.jpg)
![Captura](https://i.ibb.co/0RL1qtS0/Screenshot-28-5-2025-172017-127-0-0-1.jpg)


## 📦 Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Josephurrego/MusiChords.git
   cd MusiChords
   ```
2. Crea un entorno virtual e instala las dependencias:

   ```bash
   python -m venv env
   source env/bin/activate  # En Windows: env\Scripts\activate
   pip install -r requirements.txt
   ```

3. Ejecuta el servidor:

   ```bash
   python manage.py runserver
   ```

4. Abre tu navegador en: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## 📚 Por hacer / Futuras mejoras

* [ ] Mejorar la precisión en la detección de acordes.
* [ ] Soporte para múltiples instrumentos y afinaciones.
