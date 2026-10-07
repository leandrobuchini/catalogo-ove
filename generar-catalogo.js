// generar-catalogo.js
import fs from 'fs';
import path from 'path';

const CARPETA_RAIZ = './LENTES-comprimido';
const CARPETA_LOGOS = './logos';

if (!fs.existsSync(CARPETA_RAIZ)) {
  console.error(`❌ No se encontró la carpeta "${CARPETA_RAIZ}".`);
  process.exit(1);
}

// Configuración opcional de marcas (íconos y descripciones personalizadas)
const CONFIG_MARCAS = {
  audi: { icono: 'fa-car-side', descripcion: 'Diseño deportivo de alta gama y armazones ultralivianos.' },
  rayban: { icono: 'fa-glasses', descripcion: 'Clásicos icónicos con máxima protección UV400.' },
  oakley: { icono: 'fa-person-running', descripcion: 'Rendimiento deportivo extremo y cristales de alta definición.' },
  prada: { icono: 'fa-gem', descripcion: 'Elegancia italiana y acabados de lujo.' },
  gucci: { icono: 'fa-crown', descripcion: 'Estilo vanguardista y presencia distintiva.' },
  armani: { icono: 'fa-briefcase', descripcion: 'Minimalismo ejecutivo y confort diario.' },
  versace: { icono: 'fa-shield-halved', descripcion: 'Diseño audaz con presencia imponente.' },
  bmw: { icono: 'fa-gauge-high', descripcion: 'Ingeniería de precisión y materiales premium.' }
};

const DEFAULT_CONFIG = {
  icono: 'fa-glasses',
  descripcion: 'Modelos de sol seleccionados con cristales de alta calidad y protección UV.'
};

// Búsqueda recursiva de imágenes por si hay subcarpetas
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

// 1. Obtener la lista de carpetas de marcas
const marcas = fs.readdirSync(CARPETA_RAIZ, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

// 2. Procesar cada marca y sus modelos
const catalogo = marcas.map(marca => {
  const rutaMarca = path.join(CARPETA_RAIZ, marca);
  const claveMarca = marca.toLowerCase().replace(/[\s\-_]/g, '');

  // Buscar si existe el logo en la carpeta "logos"
  const extensionesLogo = ['png', 'webp', 'svg', 'jpg', 'jpeg'];
  let rutaLogo = null;

  if (fs.existsSync(CARPETA_LOGOS)) {
    for (const ext of extensionesLogo) {
      const posibleLogo = path.join(CARPETA_LOGOS, `${claveMarca}.${ext}`);
      if (fs.existsSync(posibleLogo)) {
        rutaLogo = `logos/${claveMarca}.${ext}`;
        break;
      }
    }
  }

  const config = CONFIG_MARCAS[claveMarca] || {
    ...DEFAULT_CONFIG,
    descripcion: `Colección exclusiva de lentes de sol ${marca}.`
  };

  const modelos = fs.readdirSync(rutaMarca, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

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
    logo: rutaLogo,
    icono: config.icono,
    descripcion: config.descripcion,
    items: items
  };
});

// 3. Guardar el archivo JSON
fs.writeFileSync('productos.json', JSON.stringify(catalogo, null, 2), 'utf-8');

const totalProductos = catalogo.reduce((acc, b) => acc + b.items.length, 0);
console.log(`\n========================================`);
console.log(`✅ productos.json actualizado con marcas y logos.`);
console.log(`🏷️ Marcas procesadas: ${catalogo.length}`);
console.log(`👓 Modelos indexados: ${totalProductos}`);
console.log(`========================================\n`);