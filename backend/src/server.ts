import { createApp } from './app.js';
import { leerConfig } from './config/env.js';
import { conectar } from './db/conexion.js';
import { migrar } from './db/migrar.js';

const config = leerConfig();
const db = await conectar(config.databaseUrl, config.dataDir);
const aplicadas = await migrar(db);
if (aplicadas.length > 0) console.log(`Migraciones aplicadas: ${aplicadas.join(', ')}`);

const app = createApp({ db, auth: config.auth, corsOrigin: config.corsOrigin });
app.listen(config.port, () => {
  const base = config.databaseUrl ? 'PostgreSQL' : `PGlite (${config.dataDir})`;
  console.log(`MisGastos backend escuchando en :${config.port} — base: ${base}`);
});
