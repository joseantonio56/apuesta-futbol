import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
// main.ts
const oldWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('global_session_not_found')) {
    return; // ❌ Ignora solo este warning de PayPal
  }
  oldWarn.apply(console, args);
};
