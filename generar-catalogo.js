// generar-catalogo.js
import fs from 'fs';
import path from 'path';

const CARPETA_RAIZ = './LENTES-comprimido';

if (!fs.existsSync(CARPETA_RAIZ)) {
  console.error(`❌ No se encontró la carpeta "${CARPETA_RAIZ}".`);
  process.exit(1);
}

// 1. DICCIONARIO DE MARCAS: Íconos FontAwesome y descripciones a medida
// Usamos claves en minúsculas para que coincida sin importar mayúsculas/minúsculas
const CONFIG_MARCAS = {
  audi: {
    icono: 'fa-car-side',
    descripcion: 'Diseño deportivo de alta gama, armazones aerodinámicos y cristales polarizados.'
  },
  rayban: {
    icono: 'fa-glasses',
    descripcion: 'Clásicos icónicos, modelos Aviator y Wayfarer con máxima protección UV400.'
  },
  oakley: {
    icono: 'fa-person-running',
    descripcion: 'Rendimiento deportivo extremo, agarre antideslizante y resistencia a impactos.'
  },
  prada: {
    icono: 'fa-gem',
    descripcion: 'Elegancia italiana, marcos oversized y detalles de lujo en cada terminación.'
  },
  gucci: {
    icono: 'fa-crown',
    descripcion: 'Estilo vanguardista, diseño de pasarela y acabados dorados distintivos.'
  },
  armani: {
    icono: 'fa-briefcase',
    descripcion: 'Minimalismo ejecutivo, líneas sobrias y confort ultraliviano para el día a día.'
  },
  versace: {
    icono: 'fa-shield-halved',
    descripcion: 'Diseño audaz y reconocible, detalles barrocos y presencia imponente.'
  },
  bmw: {
    icono: 'fa-gauge-high',
    descripcion: 'Ingeniería de precisión, cristales antireflejo y detalles en fibra de carbono.'
  }
};

// Configuración por defecto si la carpeta de la marca no está en el diccionario
const DEFAULT_CONFIG = {
  icono: 'fa-glasses',
  descripcion: 'Modelos de sol seleccionados con cristales de alta calidad y protección UV.'
};

// 2. FUNCIÓN AUXILIAR: Búsqueda recursiva de imágenes
function obtenerImagenesRecursivo(directorio) {
  let resultados = [];
  const items = fs.readdirSync(directorio, { withFileTypes: true });

  for (const item of items) {
    const rutaCompleta = path.join(directorio, item.name);
    if (item.isDirectory()) {
      resultados = resultados.concat(obtenerImagenesRecursivo(rutaCompleta));
    } else if (/\.(jpe?g|png|webp|avif)$/i.test(item.name)) {
      resultados.push(rutaCompleta);
    }
  }
  return resultados;
}

// 3. PROCESAMIENTO DEL CATÁLOGO
const marcas = fs.readdirSync(CARPETA_RAIZ, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const catalogo = marcas.map(marca => {
  const rutaMarca = path.join(CARPETA_RAIZ, marca);
  const modelos = fs.readdirSync(rutaMarca, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  // Normalizar el nombre para buscar en el diccionario (ej: "RAY-BAN" -> "rayban")
  const claveBusqueda = marca.toLowerCase().replace(/[\s\-_]/g, '');
  const config = CONFIG_MARCAS[claveBusqueda] || {
    ...DEFAULT_CONFIG,
    descripcion: `Colección exclusiva de lentes de sol ${marca}.`
  };

  const items = modelos.map(modelo => {
    const rutaModelo = path.join(rutaMarca, modelo);
    const archivos = obtenerImagenesRecursivo(rutaModelo);

    const rutasNormalizadas = archivos.map(ruta => {
      let limpia = ruta.replace(/\\/g, '/');
      if (limpia.startsWith('./')) limpia = limpia.slice(2);
      return limpia;
    });

    const matchCodigo = modelo.match(/#(\w+)/);
    const codigo = matchCodigo ? `#${matchCodigo[1]}` : modelo;
    const slugId = `${marca}-${codigo}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return {
      id: slugId,
      codigo: codigo,
      nombre: `${marca} ${codigo}`,
      descripcion: `Lentes de sol ${marca} modelo ${modelo}.`,
      fotos: rutasNormalizadas
    };
  });

  return {
    marca: marca,
    icono: config.icono,
    descripcion: config.descripcion,
    items: items
  };
});

fs.writeFileSync('productos.json', JSON.stringify(catalogo, null, 2), 'utf-8');
console.log(`✅ productos.json actualizado con marcas personalizadas.`);