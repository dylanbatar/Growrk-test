import { createApp } from './app.js';
import { ConfigurationError, readConfig } from './config/env.js';

try {
  const config = readConfig();
  const app = createApp();

  app.listen(config.port, config.host, ()=>{
    console.log(`Server running on http://${config.host}:${config.port}`)
  });
} catch (error) {
  const message = error instanceof ConfigurationError
    ? error.message
    : 'Startup failed: unable to initialize the API.';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
