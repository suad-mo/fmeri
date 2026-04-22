import { Component, input, output, signal, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  OsnovnaJedinicaDetalji,
  UnutrasnjaJedinicaDetalji,
  RadnoMjestoDetalji,
} from '../../../../../core/models/org.models';
import { RmRowComponent } from '../rm-row/rm-row.component';
import { environment } from '../../../../../../environments/environment.production';

@Component({
  selector: 'app-ooj-lista',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatTooltipModule,
    RmRowComponent,
  ],
  templateUrl: './ooj-lista.component.html',
  styleUrl: './ooj-lista.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OojListaComponent {
  ooj = input.required<OsnovnaJedinicaDetalji[]>();
  jeAdmin = input<boolean>(false);
  apiUrl = input<string>(environment.uploadsUrl);

  dodajOOJRm  = output<OsnovnaJedinicaDetalji>();
  dodajUOJ    = output<OsnovnaJedinicaDetalji>();
  urediOOJ    = output<OsnovnaJedinicaDetalji>();
  dodajUOJRm  = output<UnutrasnjaJedinicaDetalji>();
  dodijeli    = output<RadnoMjestoDetalji>();
  premjesti   = output<RadnoMjestoDetalji>();
  deaktiviraj = output<RadnoMjestoDetalji>();

  private openIds = signal<Set<string>>(new Set());

  toggleOoj(id: string) {
    this.openIds.update(set => {
      const next = new Set(set);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  getBrojRMuOOJ(ooj: OsnovnaJedinicaDetalji): number {
    return ooj.radnaMjesta.length +
      ooj.unutrasnje.reduce((s, u) => s + u.radnaMjesta.length, 0);
  }
}
