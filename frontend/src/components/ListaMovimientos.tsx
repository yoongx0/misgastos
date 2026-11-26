import { fechaCorta, formatearMonto } from '../formato';
import type { Movimiento } from '../tipos';

interface Props {
  movimientos: Movimiento[];
  onEliminar: (m: Movimiento) => void;
}

export function ListaMovimientos({ movimientos, onEliminar }: Props) {
  return (
    <section className="tarjeta" aria-label="Movimientos del mes">
      <h2>Movimientos</h2>
      {movimientos.length === 0 ? (
        <p className="suave">No hay movimientos este mes.</p>
      ) : (
        <ul className="movimientos">
          {movimientos.map((m) => (
            <li key={m.id}>
              <span className="fecha">{fechaCorta(m.fecha)}</span>
              <span className="detalle">
                {m.descripcion}
                <span className="suave"> · {m.categoria} · {m.medioDePago}</span>
              </span>
              <span className={m.tipo === 'ingreso' ? 'positivo' : ''}>
                {m.tipo === 'ingreso' ? '+' : '−'}{formatearMonto(m.montoCentavos)}
              </span>
              <button className="link" onClick={() => onEliminar(m)} aria-label={`Eliminar ${m.descripcion}`}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
