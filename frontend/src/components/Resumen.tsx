import { formatearMonto } from '../formato';
import type { Resumen as TipoResumen } from '../tipos';

export function Resumen({ resumen }: { resumen: TipoResumen }) {
  const { ingresos, gastos, saldo, gastosPorCategoria } = resumen;
  return (
    <section className="tarjeta" aria-label="Resumen del mes">
      <h2>Resumen</h2>
      <div className="totales">
        <div><span className="suave">Ingresos</span><strong className="positivo">{formatearMonto(ingresos)}</strong></div>
        <div><span className="suave">Gastos</span><strong>{formatearMonto(gastos)}</strong></div>
        <div><span className="suave">Saldo</span><strong className={saldo < 0 ? 'negativo' : 'positivo'}>{formatearMonto(saldo)}</strong></div>
      </div>

      {gastosPorCategoria.length === 0 ? (
        <p className="suave">No hay gastos este mes.</p>
      ) : (
        <ul className="categorias">
          {gastosPorCategoria.map((g) => (
            <li key={g.categoria}>
              <div className="fila">
                <span>{g.categoria}</span>
                <span>{formatearMonto(g.total)} <span className="suave">({g.porcentaje}%)</span></span>
              </div>
              <div className="barra"><div style={{ width: `${g.porcentaje}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
