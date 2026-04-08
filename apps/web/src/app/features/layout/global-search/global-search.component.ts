import { Component, inject, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrgService } from '../../../core/services/org.service';
import { Zaposlenik, OrganizacionaJedinica } from '../../../core/models/org.models';

interface PretragaRezultat {
  tip: 'zaposlenik' | 'jedinica';
  id: string;
  naslov: string;
  podnaslov?: string;
  ruta: string[];
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
})
export class GlobalSearchComponent {
  private orgService = inject(OrgService);
  private router = inject(Router);

  @ViewChild('searchInput') searchInput!: ElementRef;

  query = signal('');
  aktivan = signal(false);
  isLoading = signal(false);

  zaposlenici = signal<Zaposlenik[]>([]);
  jedinice = signal<OrganizacionaJedinica[]>([]);
  podaciUcitani = signal(false);

  rezultati = computed<PretragaRezultat[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (q.length < 2) return [];

    const rez: PretragaRezultat[] = [];

    // Zaposlenici
    this.zaposlenici()
      .filter(z =>
        `${z.ime} ${z.prezime}`.toLowerCase().includes(q) ||
        z.sluzbeniEmail?.toLowerCase().includes(q) ||
        z.radnoMjesto?.naziv.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach(z => rez.push({
        tip: 'zaposlenik',
        id: z._id,
        naslov: `${z.ime} ${z.prezime}`,
        podnaslov: z.radnoMjesto?.naziv ?? z.sluzbeniEmail,
        ruta: ['/zaposlenici', z._id],
      }));

    // Org. jedinice
    this.jedinice()
      .filter(j => j.naziv.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(j => rez.push({
        tip: 'jedinica',
        id: j._id,
        naslov: j.naziv,
        podnaslov: j.tip,
        ruta: ['/admin/org-jedinice'],
      }));

    return rez;
  });

  zaposleniciRez = computed(() =>
    this.rezultati().filter(r => r.tip === 'zaposlenik')
  );

  jediniceRez = computed(() =>
    this.rezultati().filter(r => r.tip === 'jedinica')
  );

  @HostListener('document:keydown.escape')
  onEscape() { this.zatvori(); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    if (!this.searchInput?.nativeElement.closest('.search-wrap')
      ?.contains(e.target)) {
      this.zatvori();
    }
  }

  onFocus() {
    this.aktivan.set(true);
    if (!this.podaciUcitani()) this.ucitajPodatke();
  }

  onInput() {
    this.aktivan.set(true);
  }

  ucitajPodatke() {
    this.isLoading.set(true);
    this.orgService.getPretrazivanjeData().subscribe({
      next: ({ zaposlenici, jedinice }) => {
        this.zaposlenici.set(zaposlenici);
        this.jedinice.set(jedinice);
        this.podaciUcitani.set(true);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  otvoriRezultat(ruta: string[]) {
    this.router.navigate(ruta);
    this.zatvori();
  }

  zatvori() {
    this.aktivan.set(false);
    this.query.set('');
  }
}
