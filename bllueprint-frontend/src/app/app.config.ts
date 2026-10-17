import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHlmSidebarConfig } from '@sketch-ui/sidebar';
import { provideSpartanHlm } from '@sketch-ui/utils';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSpartanHlm(),
    provideHlmSidebarConfig({
      defaultOpen: true,
      sidebarWidth: '14rem',
      sidebarWidthIcon: '3.25rem',
    }),
  ],
};
