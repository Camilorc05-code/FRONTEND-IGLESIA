import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

/**
 * ImagePositioner: permite arrastrar una imagen dentro de un marco
 * para elegir qué parte se ve. Guarda la posición como object-position %.
 */
function ImagePositioner({ imagen, posicion = '50% 50%', onPosicionChange }) {
  const contenedorRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [inicio, setInicio] = useState({ x: 0, y: 0 });
  const [posActual, setPosActual] = useState(() => {
    if (!posicion || posicion === 'center center') return { x: 50, y: 50 };
    const [x, y] = posicion.split(' ').map((v) => {
      if (v === 'left') return 0;
      if (v === 'right') return 100;
      if (v === 'top') return 0;
      if (v === 'bottom') return 100;
      return parseFloat(v) || 50;
    });
    return { x, y };
  });

  const iniciarArrastre = (e) => {
    e.preventDefault();
    setArrastrando(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setInicio({ x: clientX, y: clientY });
  };

  const mover = useCallback((e) => {
    if (!arrastrando || !contenedorRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = contenedorRef.current.getBoundingClientRect();
    const dx = clientX - inicio.x;
    const dy = clientY - inicio.y;
    const pxX = (dx / rect.width) * 100;
    const pxY = (dy / rect.height) * 100;
    setPosActual((prev) => {
      const nx = Math.max(0, Math.min(100, prev.x - pxX));
      const ny = Math.max(0, Math.min(100, prev.y - pxY));
      return { x: nx, y: ny };
    });
    setInicio({ x: clientX, y: clientY });
  }, [arrastrando, inicio]);

  const terminarArrastre = useCallback(() => {
    if (!arrastrando) return;
    setArrastrando(false);
    if (onPosicionChange) {
      onPosicionChange(`${posActual.x.toFixed(1)}% ${posActual.y.toFixed(1)}%`);
    }
  }, [arrastrando, posActual, onPosicionChange]);

  return (
    <div
      ref={contenedorRef}
      onMouseDown={iniciarArrastre}
      onMouseMove={mover}
      onMouseUp={terminarArrastre}
      onMouseLeave={terminarArrastre}
      onTouchStart={iniciarArrastre}
      onTouchMove={mover}
      onTouchEnd={terminarArrastre}
      className="relative w-full h-40 rounded-xl overflow-hidden bg-ink/10 border-2 border-dashed cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    >
      <img
        src={imagen}
        alt="Arrastra para posicionar"
        className="w-full h-full pointer-events-none"
        style={{
          objectFit: 'cover',
          objectPosition: `${posActual.x}% ${posActual.y}%`,
          transform: arrastrando ? 'scale(1.02)' : 'scale(1)',
          transition: arrastrando ? 'none' : 'transform 0.2s',
        }}
        draggable={false}
      />
      {/* Guía visual */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 border border-white/20" />
        <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/10" />
        <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/10" />
        <div className="absolute top-1/3 left-0 right-0 border-t border-white/10" />
        <div className="absolute top-2/3 left-0 right-0 border-t border-white/10" />
      </div>
      {/* Indicador de posición */}
      <div className="absolute bottom-2 right-2 bg-ink/70 text-paper text-[10px] px-2 py-0.5 rounded-full backdrop-blur">
        {arrastrando ? 'Soltar aquí' : 'Arrastra la imagen'}
      </div>
      {/* Cruz central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
      </div>
    </div>
  );
}

const POSICIONES_RAPIDAS = [
  { value: '50% 50%', label: 'Centro' },
  { value: '50% 0%', label: 'Arriba' },
  { value: '50% 100%', label: 'Abajo' },
  { value: '0% 50%', label: 'Izq.' },
  { value: '100% 50%', label: 'Der.' },
];

/**
 * Componente de subida de imágenes con drag & drop.
 *
 * Props:
 * - imagenes: array de URLs actuales (para modo edición)
 * - onChange: callback(urls) — se llama con el array completo de URLs cuando cambia
 * - maximo: número máximo de imágenes (default 20)
 * - label: etiqueta del campo
 * - multiple: permitir múltiples archivos (default true)
 */
export function ImageUploader({ imagenes = [], onChange, maximo = 20, label = 'Imágenes', multiple = true }) {
  const [subiendo, setSubiendo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const archivosExistentes = imagenes.filter((img) => typeof img === 'string' && img.trim());

  const subirArchivos = useCallback(async (files) => {
    if (!files.length) return;
    setError('');

    const total = archivosExistentes.length + files.length;
    if (total > maximo) {
      setError(`Máximo ${maximo} imágenes. Actualmente tienes ${archivosExistentes.length}.`);
      return;
    }

    setSubiendo(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('imagenes', file);
      }

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const nuevasUrls = [...archivosExistentes, ...data.urls];
      onChange(nuevasUrls);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir las imágenes.');
    } finally {
      setSubiendo(false);
    }
  }, [archivosExistentes, onChange, maximo]);

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) subirArchivos(files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) subirArchivos(files);
    e.target.value = '';
  }

  function eliminar(index) {
    const nuevas = imagenes.filter((_, i) => i !== index);
    onChange(nuevas);
  }

  function mover(desde, hasta) {
    if (hasta < 0 || hasta >= imagenes.length) return;
    const nuevas = [...imagenes];
    const [item] = nuevas.splice(desde, 1);
    nuevas.splice(hasta, 0, item);
    onChange(nuevas);
  }

  return (
    <div>
      <label className="label">{label}</label>

      {/* Zona de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-azul bg-azul/5 scale-[1.01]'
            : 'border-line hover:border-azul/50 hover:bg-azul/[0.02]'
        } ${subiendo ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {subiendo ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink/60">Subiendo imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm text-ink/60">
              <span className="font-semibold text-azul">Click para seleccionar</span> o arrastra fotos aquí
            </p>
            <p className="text-xs text-ink/40">
              JPG, PNG, GIF, WebP — Máx. 5MB cada una ({archivosExistentes.length}/{maximo})
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-rojo mt-1.5">{error}</p>
      )}

      {/* Preview de imágenes */}
      <AnimatePresence>
        {imagenes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2"
          >
            {imagenes.map((url, i) => (
              <motion.div
                key={url + i}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-ink/5 border border-line"
              >
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />

                {/* Overlay con controles */}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); mover(i, i - 1); }}
                      className="w-7 h-7 rounded-full bg-paper/90 text-ink flex items-center justify-center text-xs hover:bg-paper shadow-sm"
                      title="Mover izquierda"
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); eliminar(i); }}
                    className="w-7 h-7 rounded-full bg-rojo text-paper flex items-center justify-center text-xs hover:bg-rojo/80 shadow-sm"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                  {i < imagenes.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); mover(i, i + 1); }}
                      className="w-7 h-7 rounded-full bg-paper/90 text-ink flex items-center justify-center text-xs hover:bg-paper shadow-sm"
                      title="Mover derecha"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Número de orden */}
                <div className="absolute top-1 left-1 bg-ink/60 backdrop-blur text-paper text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {i + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Variante simplificada para subir UNA sola imagen (portada).
 * Muestra preview con opción de eliminar y arrastrar para posicionar.
 */
export function ImageUploaderSingle({ imagen = '', posicion = '50% 50%', onPosicionChange, onChange, label = 'Foto de portada' }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  async function subirArchivo(file) {
    setError('');
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('imagenes', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.urls[0]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) subirArchivo(file);
  }

  function handleSelect(e) {
    const file = e.target.files[0];
    if (file) subirArchivo(file);
    e.target.value = '';
  }

  return (
    <div>
      <label className="label">{label}</label>

      {imagen ? (
        <div className="space-y-3">
          <div className="relative group rounded-xl overflow-hidden bg-ink/5 border border-line">
            <img
              src={imagen}
              alt="Portada"
              className="w-full h-40 object-cover transition-all"
              style={{ objectPosition: posicion }}
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-paper/90 text-ink text-xs font-medium hover:bg-paper shadow-sm"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => { onChange(''); if (onPosicionChange) onPosicionChange('50% 50%'); }}
                className="px-3 py-1.5 rounded-full bg-rojo text-paper text-xs font-medium hover:bg-rojo/80 shadow-sm"
              >
                Eliminar
              </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />
          </div>

          {/* Arrastrar para posicionar */}
          {onPosicionChange && (
            <div>
              <p className="text-xs text-ink/50 mb-2 font-medium">Arrastra la imagen para posicionarla como quieras:</p>
              <ImagePositioner
                imagen={imagen}
                posicion={posicion}
                onPosicionChange={onPosicionChange}
              />
              <div className="flex gap-1 mt-2">
                {POSICIONES_RAPIDAS.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => onPosicionChange(pos.value)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                      posicion === pos.value
                        ? 'bg-azul text-paper'
                        : 'bg-ink/5 text-ink/40 hover:bg-ink/10'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragActive ? 'border-azul bg-azul/5' : 'border-line hover:border-azul/50'
          } ${subiendo ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />
          {subiendo ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-azul border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-ink/60">Subiendo...</p>
            </div>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30 mx-auto mb-2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-xs text-ink/60">
                <span className="font-semibold text-azul">Click</span> o arrastra una foto
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rojo mt-1">{error}</p>}
    </div>
  );
}
