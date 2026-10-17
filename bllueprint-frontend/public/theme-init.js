// Applies the stored sketch-ui theme/accent before Angular bootstraps (no flash).
// Lives in its own file (not inline) so the Content-Security-Policy can stay
// `script-src 'self'`. Keep the registries in sync with
// src/sketch-ui/core/theme.service.ts.
(function () {
  try {
    var schemes = { paper: 'light', blueprint: 'dark', navy: 'dark' };
    var accents = ['orange'];
    var id = localStorage.getItem('sketch-ui.theme');
    if (!schemes[id]) {
      var prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      id = prefersDark ? 'blueprint' : 'paper';
    }
    var accent = localStorage.getItem('sketch-ui.accent');
    if (accents.indexOf(accent) === -1) accent = accents[0];
    var root = document.documentElement;
    root.setAttribute('data-theme', id);
    root.setAttribute('data-scheme', schemes[id]);
    root.setAttribute('data-accent', accent);
    if (schemes[id] === 'dark') root.classList.add('dark');
    root.style.colorScheme = schemes[id];
  } catch (e) {
    /* storage unavailable: ThemeService applies the defaults after bootstrap */
  }
})();
