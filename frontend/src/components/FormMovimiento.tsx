import { useState, type FormEvent } from 'react';
import { ErrorApi } from '../api';
import { formatearMonto, hoyEnArgentina, parsearMontoEnPesos } from '../formato';
import type { Catalogos, NuevoMovimiento, TipoMovimiento } from '../tipos';

interface Props {
  catalogos: Catalogos;
  onCrear: (m: NuevoMovimiento) => Promise<void>;
}

export function FormMovimiento({ catalogos, onCrear }: Props) {
  const hoy = hoyEnArgentina();
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(catalogos.categoriasGasto[0]);
  const [fecha, setFecha] = useState(hoy);
  const [medioDePago, setMedioDePago] = useState('Débito');
  const [cuotas, setCuotas] = useState(1);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const categorias = tipo === 'gasto' ? catalogos.categoriasGasto : catalogos.categoriasIngreso;
  const admiteCuotas = tipo === 'gasto' && medioDePago === 'Crédito';
  const centavos = parsearMontoEnPesos(monto);

  function cambiarTipo(nuevo: TipoMovimiento) {
    setTipo(nuevo);
    setCategoria(nuevo === 'gasto' ? catalogos.categoriasGasto[0] : catalogos.categoriasIngreso[0]);
    setMedioDePago(nuevo === 'gasto' ? 'Débito' : 'Transferencia');
    setCuotas(1);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    // Validación rápida para avisar al instante; la definitiva la hace el backend.
    if (centavos === null) return setErrores({ montoCentavos: 'Ingresá un monto válido, por ejemplo 12.500,50.' });
    setEnviando(true);
    try {
      await onCrear({
        tipo, descripcion, montoCentavos: centavos, categoria, fecha, medioDePago,
        ...(admiteCuotas && cuotas > 1 ? { cuotas } : {}),
      });
      setDescripcion('');
      setMonto('');
      setCuotas(1);
      setErrores({});
    } catch (err) {
      setErrores(err instanceof ErrorApi ? { ...err.detalles, general: err.message } : { general: 'Error inesperado.' });
    } finally {
      setEnviando(false);
    }
  }

  const error = (campo: string) => errores[campo] && <span className="error">{errores[campo]}</span>;

  return (
    <form className="tarjeta formulario" onSubmit={enviar} aria-label="Nuevo movimiento">
      <h2>Nuevo movimiento</h2>
      <div className="selector" role="group" aria-label="Tipo">
        <button type="button" className={tipo === 'gasto' ? 'activo' : ''} onClick={() => cambiarTipo('gasto')}>Gasto</button>
        <button type="button" className={tipo === 'ingreso' ? 'activo' : ''} onClick={() => cambiarTipo('ingreso')}>Ingreso</button>
      </div>

      <label>Descripción
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={60} placeholder="Ej: Supermercado" required />
        {error('descripcion')}
      </label>

      <div className="dos-columnas">
        <label>Monto ($)
          <input value={monto} onChange={(e) => setMonto(e.target.value)} inputMode="decimal" placeholder="12.500,50" required />
          {error('montoCentavos')}
        </label>
        <label>Fecha
          <input type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} required />
          {error('fecha')}
        </label>
      </div>

      <div className="dos-columnas">
        <label>Categoría
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </select>
          {error('categoria')}
        </label>
        <label>Medio de pago
          <select value={medioDePago} onChange={(e) => { setMedioDePago(e.target.value); setCuotas(1); }}>
            {catalogos.mediosDePago.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
      </div>

      {admiteCuotas && (
        <label>Cuotas
          <select value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n === 1 ? '1 pago' : `${n} cuotas`}</option>
            ))}
          </select>
          {cuotas > 1 && centavos !== null && (
            <span className="suave">≈ {formatearMonto(Math.floor(centavos / cuotas))} por mes durante {cuotas} meses</span>
          )}
          {error('cuotas')}
        </label>
      )}

      {errores.general && !Object.keys(errores).some((k) => k !== 'general') && <p className="error" role="alert">{errores.general}</p>}
      <button className="primario" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
    </form>
  );
}
