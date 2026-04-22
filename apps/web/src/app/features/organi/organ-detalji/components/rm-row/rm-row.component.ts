import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RadnoMjestoDetalji, KATEGORIJA_NAZIV, KategorijaZaposlenog } from '../../../../../core/models/org.models';
import { environment } from '../../../../../../environments/environment.production';

@Component({
  selector: 'app-rm-row',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './rm-row.component.html',
  styleUrl: './rm-row.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RmRowComponent {
  rm = input.required<RadnoMjestoDetalji>();
  jeAdmin = input<boolean>(false);
  apiUrl = input<string>(environment.uploadsUrl);

  dodijeli = output<RadnoMjestoDetalji>();
  premjesti = output<RadnoMjestoDetalji>();
  deaktiviraj = output<RadnoMjestoDetalji>();

  getKategorijaNaziv(k: string): string {
    return KATEGORIJA_NAZIV[k as KategorijaZaposlenog] ?? k;
  }

  onDodijeli(event: Event) {
    event.stopPropagation();
    this.dodijeli.emit(this.rm());
  }
}
