import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SketchConfigService, ThemeService } from '@sketch-ui/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Instantiated here so their effects (theme + sketch tokens on <html>) run from startup.
  private readonly theme = inject(ThemeService);
  private readonly sketchConfig = inject(SketchConfigService);
}
