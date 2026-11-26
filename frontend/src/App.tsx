import { useCallback, useEffect, useState } from 'react';
import { api, configurarSesion, ErrorApi } from './api';
import { FormMovimiento } from './components/FormMovimiento';
import { ListaMovimientos } from './components/ListaMovimientos';
import { Login } from './components/Login';
import { Presupuestos } from './components/Presupuestos';
import { Resumen } from './components/Resumen';
import { hoyEnArgentina, nombreDelMes, sumarMes } from './formato';
import { guardarToken, leerToken } from './sesion';
import type { Catalogos, EstadoPresupuesto, Movimiento, NuevoMovimiento, Resumen as TipoResumen } from './tipos';

interface Datos {
  movimientos: Movimiento[];
  resumen: TipoResumen;
  presupuestos: EstadoPresupuesto[];
}

export default function App() {
  const [token, setToken] = useState<string | null>(leerToken);
  const [mes, setMes] = useState(hoyEnArgentina().slice(0, 7));
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cerrarSesion = useCallback(() => {
    guardarToken(null);
    setToken(null);
    setDatos(null);
  }, []);

  configurarSesion(token, cerrarSesion);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError('');
    try {
      const [movimientos, resumen, presupuestos, cat] = await Promise.all([
        api.movimientos(mes), api.resumen(mes), api.presupuestos(mes), catalogos ?? api.catalogos(),
      ]);
      setDatos({ movimientos, resumen, presupuestos });
      setCatalogos(cat);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'Error inesperado.');
    } finally {
      setCargando(false);
    }
  }, [token, mes, catalogos]);

  useEffect(() => {
    void cargar();
    // catalogos no cambia una vez cargado: no hace falta recargar por eso
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mes]);

  if (!token) {
    return <Login onLogin={(t) => { guardarToken(t); setToken(t); }} />;
  }

  async function crear(m: NuevoMovimiento) {
    await api.crearMovimiento(m);
    await cargar();
  }

  async function eliminar(m: Movimiento) {
    const aviso = m.grupoId
      ? `"${m.descripcion}" es una cuota: se van a eliminar las ${m.cuotaTotal} cuotas de esa compra. ¿Seguro?`
      : `¿Eliminar "${m.descripcion}"?`;
    if (!window.confirm(aviso)) return;
    await api.eliminarMovimiento(m.id).catch((err) => setError(err instanceof ErrorApi ? err.message : 'No se pudo eliminar.'));
    await cargar();
  }

  return (
    <div className="app">
      <header className="encabezado">
        <h1>MisGastos</h1>
        <nav className="meses" aria-label="Mes">
          <button onClick={() => setMes(sumarMes(mes, -1))} aria-label="Mes anterior">‹</button>
          <span aria-live="polite">{nombreDelMes(mes)}</span>
          <button onClick={() => setMes(sumarMes(mes, 1))} aria-label="Mes siguiente">›</button>
        </nav>
        <button className="link" onClick={cerrarSesion}>Salir</button>
      </header>

      {error && <p className="error banner" role="alert">{error} <button className="link" onClick={cargar}>Reintentar</button></p>}
      {cargando && !datos && <p className="suave centrado">Cargando… (si el servidor estaba dormido puede tardar unos segundos)</p>}

      {datos && catalogos && (
        <main className="grilla">
          <div className="columna">
            <Resumen resumen={datos.resumen} />
            <Presupuestos
              presupuestos={datos.presupuestos}
              categorias={catalogos.categoriasGasto}
              onGuardar={async (c, centavos) => { await api.guardarPresupuesto(c, centavos); await cargar(); }}
              onEliminar={async (c) => { await api.eliminarPresupuesto(c); await cargar(); }}
            />
          </div>
          <div className="columna">
            <FormMovimiento catalogos={catalogos} onCrear={crear} />
            <ListaMovimientos movimientos={datos.movimientos} onEliminar={eliminar} />
          </div>
        </main>
      )}
    </div>
  );
}
