import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EditorHostComponent } from '../editor-host/editor-host';
import { TabStripComponent } from '../tab-strip/tab-strip';

/** File tab strip + Monaco host: the layout of the coding screen. */
@Component({
  selector: 'app-workbench',
  imports: [TabStripComponent, EditorHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workbench.html',
  styleUrl: './workbench.scss',
})
export class WorkbenchComponent {}
