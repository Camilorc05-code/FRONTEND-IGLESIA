import { useState } from 'react';
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal';
import { Horizonte } from '../components/Horizonte';
import { GlobeGrid } from '../components/GlobeGrid';
import qrNequi from '../assets/qr-nequi.jpg';

const NUMERO = '3103254883';
const NUMERO_FORMATEADO = '310 325 4883';

export default function Donaciones() {
  const [copiado, setCopiado] = useState(false);

  async function copiarNumero() {
    try {
      await navigator.clipboard.writeText(NUMERO);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // si el navegador bloquea el portapapeles, no pasa nada — el número ya está visible
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="bg-amanecer relative overflow-hidden">
        <GlobeGrid className="absolute -right-24 -top-20 w-96 h-96 text-azul" opacity={0.08} />
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-16 pb-14 text-center relative">
          <Reveal>
            <p className="eyebrow mb-3">Dar con alegría</p>
            <h1 className="font-display font-semibold text-4xl md:text-5xl text-ink">
              Ofrendas y Diezmos
            </h1>
            <p className="text-ink/70 max-w-xl mx-auto mt-4 leading-relaxed">
              Dar es un acto de adoración y de fe. Gracias por sembrar junto a nosotros para que la
              obra de Dios siga creciendo en Paz de Ariporo y más allá.
            </p>
          </Reveal>
        </div>
        <Horizonte className="text-paper" />
      </section>

      {/* VERSÍCULOS */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-14">
        <StaggerGroup className="grid sm:grid-cols-2 gap-5">
          <StaggerItem>
            <div className="card h-full bg-white">
              <p className="font-display italic text-lg text-ink leading-relaxed">
                "Trae tu diezmo completo, y comprueba cómo Dios abre las ventanas del cielo sobre ti."
              </p>
              <p className="font-mono text-xs text-azul uppercase tracking-widest mt-4">Malaquías 3:10</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="card h-full bg-white">
              <p className="font-display italic text-lg text-ink leading-relaxed">
                "Cada uno dé como propuso en su corazón, no con tristeza ni obligación, porque Dios
                ama al dador alegre."
              </p>
              <p className="font-mono text-xs text-azul uppercase tracking-widest mt-4">2 Corintios 9:7</p>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </section>

      <Horizonte flip className="text-paper2" />

      {/* TARJETA DE PAGO */}
      <section className="bg-paper2">
        <div className="max-w-md mx-auto px-5 md:px-8 py-16 md:py-20">
          <Reveal>
            <p className="eyebrow text-center mb-3">Cómo dar tu ofrenda o diezmo</p>
            <h2 className="font-display text-2xl md:text-3xl text-ink text-center mb-10">
              Por Nequi o Bre-B
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-white rounded-3xl border border-line shadow-brand overflow-hidden">
              {/* encabezado del método de pago */}
              <div className="bg-ink px-6 py-4 flex items-center justify-center gap-2">
                <span className="font-display font-semibold text-paper text-lg">Nequi</span>
                <span className="text-paper/30">·</span>
                <span className="font-display font-semibold text-gold text-lg">Bre-B</span>
              </div>

              <div className="p-6 md:p-8 flex flex-col items-center">
                <div className="rounded-2xl overflow-hidden border border-line shadow-brand-sm">
                  <img
                    src={qrNequi}
                    alt="Código QR para donar por Nequi / Bre-B"
                    className="w-56 h-56 md:w-64 md:h-64 object-cover"
                  />
                </div>

                <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40 mt-5">
                  Escanea el código con tu app
                </p>

                <div className="w-full h-px bg-line my-6" />

                <div className="text-center">
                  <p className="text-sm text-ink/50">A nombre de</p>
                  <p className="font-display text-xl text-ink mt-0.5">Martha Castañeda</p>
                  <p className="text-xs text-azul font-medium">Pastora</p>
                </div>

                <button
                  onClick={copiarNumero}
                  className="mt-6 w-full flex items-center justify-between gap-3 rounded-xl border border-line bg-paper2 px-4 py-3.5 hover:border-gold transition-colors group"
                >
                  <span className="font-mono text-lg text-ink tracking-wide">{NUMERO_FORMATEADO}</span>
                  <span className="text-xs font-semibold text-azul group-hover:text-rojo transition-colors">
                    {copiado ? '¡Copiado!' : 'Copiar'}
                  </span>
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-center text-sm text-ink/50 mt-8 leading-relaxed">
              Si prefieres darlo en persona, también puedes acercarte al equipo pastoral en
              cualquiera de nuestros servicios. Gracias por tu generosidad.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}