import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkbenchComponent } from '../../components/workbench/workbench';

@Component({
  selector: 'app-coding-page',
  imports: [WorkbenchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coding-page.html',
  styleUrl: './coding-page.scss',
})
export class CodingPageComponent {}
