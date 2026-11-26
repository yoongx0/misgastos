import { useState, type FormEvent } from 'react';
import { ErrorApi } from '../api';
import { formatearMonto, parsearMontoEnPesos } from '../formato';
import type { EstadoPresupuesto } from '../tipos';

const TEXTO_ESTADO = { OK: 'En orden', ALERTA: 'Cerca del límite', EXCEDIDO: 'Excedido' } as const;

interface Props {
  presupuestos: EstadoPresupuesto[];
  categorias: string[];
  onGuardar: (categoria: string, centavos: number) => Promise<void>;
  onEliminar: (categoria: string) => Promise<void>;
}

export function Presupuestos({ presupuestos, categorias, onGuardar, onEliminar }: Props) {
  const [categoria, setCategoria] = useState(categorias[0] ?? '');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const centavos = parsearMontoEnPesos(monto);
    if (centavos === null) return setError('Ingresá un monto válido, por ejemplo 150.000.');
    try {
      await onGuardar(categoria, centavos);
      setMonto('');
      setError('');
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <section className="tarjeta" aria-label="Presupuestos">
      <h2>Presupuestos</h2>
      {presupuestos.length === 0 && <p className="suave">Todavía no fijaste presupuestos.</p>}
      <ul className="presupuestos">
        {presupuestos.map((p) => (
          <li key={p.categoria} className={`estado-${p.estado.toLowerCase()}`}>
            <div className="fila">
              <strong>{p.categoria}</strong>
              <span className="etiqueta">{TEXTO_ESTADO[p.estado]}</span>
            </div>
            <div className="barra"><div style={{ width: `${Math.min(p.porcentaje, 100)}%` }} /></div>
            <div className="fila suave">
              <span>{formatearMonto(p.gastadoCentavos)} de {formatearMonto(p.montoMensualCentavos)} ({p.porcentaje}%)</span>
              <button className="link" onClick={() => onEliminar(p.categoria)} aria-label={`Quitar presupuesto de ${p.categoria}`}>Quitar</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="en-linea" onSubmit={guardar}>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría">
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto mensual" inputMode="decimal" aria-label="Monto mensual" />
        <button>Fijar</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
