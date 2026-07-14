import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ personas: 0, citasPendientes: 0, eventosProximos: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/personas?limit=1'),
      api.get('/citas?estado=PENDIENTE'),
      api.get('/eventos?tipo=proximos'),
    ])
      .then(([personas, citas, eventos]) => {
        setStats({
          personas: personas.data.total,
          citasPendientes: citas.data.length,
          eventosProximos: eventos.data.length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-display text-2xl text-ink mb-1">Resumen</h1>
      <p className="text-ink/50 text-sm mb-8">Estado actual de la iglesia</p>

      <div className="grid sm:grid-cols-3 gap-5">
        <Tarjeta label="Personas registradas" valor={stats.personas} color="text-azul" />
        <Tarjeta label="Citas pendientes" valor={stats.citasPendientes} color="text-rojo" />
        <Tarjeta label="Eventos próximos" valor={stats.eventosProximos} color="text-gold-dark" />
      </div>
    </div>
  );
}

function Tarjeta({ label, valor, color }) {
  return (
    <div className="card bg-white">
      <p className="text-sm text-ink/60 mb-2">{label}</p>
      <p className={`font-display text-4xl ${color}`}>{valor}</p>
    </div>
  );
}
