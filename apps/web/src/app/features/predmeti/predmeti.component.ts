import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
// import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OrgService } from '../../core/services/org.service';
import {
  IPredmet,
  StatusPredmeta,
  PrioritetPredmeta,
  STATUS_PREDMETA,
  PRIORITET_PREDMETA,
  Organ,
} from '../../core/models/org.models';
import { AuthService } from '../../core/services/auth.service';

type SortPolje =
  | 'createdAt'
  | 'naziv'
  | 'prioritet'
  | 'datumOtvaranja'
  | 'referent';
type SortSmjer = 'asc' | 'desc';

@Component({
  selector: 'app-predmeti',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    // MatExpansionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './predmeti.component.html',
  styleUrl: './predmeti.component.scss',
})
export class PredmetiComponent implements OnInit {
  private orgService = inject(OrgService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  predmeti = signal<IPredmet[]>([]);
  organi = signal<Organ[]>([]);
  isLoading = signal(true);

  // Filter signals
  pretraga = signal('');
  statusFilter = signal<StatusPredmeta | ''>('');
  prioritetFilter = signal<PrioritetPredmeta | ''>('');
  organFilter = signal('');
  mojiPredmeti = signal(false);
  datumOd = signal<Date | null>(null);
  datumDo = signal<Date | null>(null);

  // Sort signals
  sortPolje = signal<SortPolje>('createdAt');
  sortSmjer = signal<SortSmjer>('desc');

  kreatorFilter = signal('');

  currentUserId = computed(() => this.authService.currentUser()?.id);

  statusNaziv = STATUS_PREDMETA;
  prioritetNaziv = PRIORITET_PREDMETA;

  statusi: { value: StatusPredmeta | ''; label: string }[] = [
    { value: '', label: 'Svi statusi' },
    { value: 'u_radu', label: 'U radu' },
    { value: 'rijeseno', label: 'Riješeno' },
    { value: 'arhivirano', label: 'Arhivirano' },
  ];

  prioriteti: { value: PrioritetPredmeta | ''; label: string }[] = [
    { value: '', label: 'Svi prioriteti' },
    { value: 'urgentno', label: 'Urgentno' },
    { value: 'vazno', label: 'Važno' },
    { value: 'redovno', label: 'Redovno' },
  ];

  sortPolja: { value: SortPolje; label: string }[] = [
    { value: 'createdAt', label: 'Datum kreiranja' },
    { value: 'datumOtvaranja', label: 'Datum otvaranja' },
    { value: 'naziv', label: 'Naziv' },
    { value: 'prioritet', label: 'Prioritet' },
    { value: 'referent', label: 'Referent' },
  ];

  filterOtvoren = false;

  brojAktivnihFiltera = computed(() => {
    let broj = 0;
    if (this.statusFilter()) broj++;
    if (this.prioritetFilter()) broj++;
    if (this.organFilter()) broj++;
    if (this.datumOd()) broj++;
    if (this.datumDo()) broj++;
    if (this.kreatorFilter()) broj++;
    return broj;
  });

  filtrirani = computed(() => {
    const p = this.pretraga().toLowerCase();
    const s = this.statusFilter();
    const pr = this.prioritetFilter();
    const org = this.organFilter();
    const moji = this.mojiPredmeti();
    const od = this.datumOd();
    const do_ = this.datumDo();
    const userId = this.currentUserId();
    const polje = this.sortPolje();
    const smjer = this.sortSmjer();
    const kreator = this.kreatorFilter();

    let rezultat = this.predmeti().filter((pred) => {
      if (
        p &&
        !pred.brojPredmeta.toLowerCase().includes(p) &&
        !pred.naziv.toLowerCase().includes(p)
      )
        return false;
      if (s && pred.status !== s) return false;
      if (pr && pred.prioritet !== pr) return false;
      if (org && pred.organ._id !== org) return false;
      if (moji && pred.referent._id !== userId) return false;
      if (od && new Date(pred.datumOtvaranja) < od) return false;
      if (do_ && new Date(pred.datumOtvaranja) > do_) return false;
      if (
        kreator &&
        !pred.referent?.name?.toLowerCase().includes(kreator.toLowerCase())
      )
        return false;
      return true;
    });

    // Sortiranje
    rezultat = [...rezultat].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (polje) {
        case 'naziv':
          valA = a.naziv.toLowerCase();
          valB = b.naziv.toLowerCase();
          break;
        case 'prioritet': {
          const red: Record<string, number> = {
            urgentno: 0,
            vazno: 1,
            redovno: 2,
          };
          valA = red[a.prioritet] ?? 3;
          valB = red[b.prioritet] ?? 3;
          break;
        }
        case 'datumOtvaranja':
          valA = new Date(a.datumOtvaranja).getTime();
          valB = new Date(b.datumOtvaranja).getTime();
          break;
        case 'referent':
          valA = a.referent?.name?.toLowerCase() ?? '';
          valB = b.referent?.name?.toLowerCase() ?? '';
          break;
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return smjer === 'asc' ? -1 : 1;
      if (valA > valB) return smjer === 'asc' ? 1 : -1;
      return 0;
    });

    return rezultat;
  });

  imaAktivnihFiltera = computed(
    () =>
      !!this.statusFilter() ||
      !!this.prioritetFilter() ||
      !!this.organFilter() ||
      !!this.datumOd() ||
      !!this.datumDo(),
  );

  ngOnInit() {
    this.orgService.getOrgani().subscribe((o) => this.organi.set(o));

    // Učitaj filtere iz URL-a
    this.route.queryParams.subscribe((params) => {
      this.pretraga.set(params['q'] ?? '');
      this.statusFilter.set(params['status'] ?? '');
      this.prioritetFilter.set(params['prioritet'] ?? '');
      this.organFilter.set(params['organ'] ?? '');
      this.mojiPredmeti.set(
        params['moji'] !== undefined ? params['moji'] === 'true' : true, // ← default true samo ako nema parametra
      );
      this.sortPolje.set(params['sort'] ?? 'datumOtvaranja'); // ← default datumOtvaranja
      this.sortSmjer.set(params['dir'] ?? 'desc');
      this.kreatorFilter.set(params['kreator'] ?? '');
      if (params['od']) this.datumOd.set(new Date(params['od']));
      if (params['do']) this.datumDo.set(new Date(params['do']));
    });

    this.ucitaj();
  }

  ucitaj() {
    this.isLoading.set(true);
    this.orgService.getPredmeti().subscribe({
      next: (data) => {
        this.predmeti.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  updateUrl(params: Record<string, string | boolean | null>) {
    const queryParams: Record<string, string | null> = {};
    for (const [key, val] of Object.entries(params)) {
      queryParams[key] = val ? String(val) : null;
    }
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onPretraga(val: string) {
    this.pretraga.set(val);
    this.updateUrl({ q: val || null });
  }

  onStatus(val: string) {
    this.statusFilter.set(val as StatusPredmeta | '');
    this.updateUrl({ status: val || null });
  }

  onPrioritet(val: string) {
    this.prioritetFilter.set(val as PrioritetPredmeta | '');
    this.updateUrl({ prioritet: val || null });
  }

  onOrgan(val: string) {
    this.organFilter.set(val);
    this.updateUrl({ organ: val || null });
  }

  onMoji(val: boolean) {
    this.mojiPredmeti.set(val);
    this.updateUrl({ moji: val ? 'true' : 'false' }); // ← uvijek postavi string
  }

  onDatumOd(val: Date | null) {
    this.datumOd.set(val);
    this.updateUrl({ od: val?.toISOString() ?? null });
  }

  onDatumDo(val: Date | null) {
    this.datumDo.set(val);
    this.updateUrl({ do: val?.toISOString() ?? null });
  }

  onKreator(val: string) {
    this.kreatorFilter.set(val);
    this.updateUrl({ kreator: val || null });
  }

  toggleSort(polje: SortPolje) {
    if (this.sortPolje() === polje) {
      const noviSmjer = this.sortSmjer() === 'asc' ? 'desc' : 'asc';
      this.sortSmjer.set(noviSmjer);
      this.updateUrl({ sort: polje, dir: noviSmjer });
    } else {
      this.sortPolje.set(polje);
      this.sortSmjer.set('desc');
      this.updateUrl({ sort: polje, dir: 'desc' });
    }
  }

  resetFilteri() {
    this.pretraga.set('');
    this.statusFilter.set('');
    this.prioritetFilter.set('');
    this.organFilter.set('');
    this.kreatorFilter.set('');
    this.mojiPredmeti.set(true); // ← ostaje true kao default
    this.datumOd.set(null);
    this.datumDo.set(null);
    // this.router.navigate([], {
    //   queryParams: { moji: 'true', sort: 'datumOtvaranja', dir: 'desc' },
    // });
    this.router.navigate([], {
      queryParams: { moji: 'false', sort: 'datumOtvaranja', dir: 'desc' },
    });
  }

  getStatusClass(status: StatusPredmeta): string {
    const map: Record<StatusPredmeta, string> = {
      u_radu: 'status-u-radu',
      rijeseno: 'status-rijeseno',
      arhivirano: 'status-arhivirano',
    };
    return map[status];
  }

  noviPredmet() {
    import('./dialogs/predmet-dialog/predmet-dialog.component').then(
      ({ PredmetDialogComponent }) => {
        const ref = this.dialog.open(PredmetDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: {},
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj();
        });
      },
    );
  }

  urediPredmet(predmet: IPredmet) {
    import('./dialogs/predmet-dialog/predmet-dialog.component').then(
      ({ PredmetDialogComponent }) => {
        const ref = this.dialog.open(PredmetDialogComponent, {
          width: '560px',
          maxWidth: '95vw',
          data: { predmet },
        });
        ref.afterClosed().subscribe((r) => {
          if (r) this.ucitaj();
        });
      },
    );
  }

  obrisiPredmet(id: string) {
    if (!confirm('Da li ste sigurni da želite obrisati predmet?')) return;
    this.orgService.deletePredmet(id).subscribe(() => this.ucitaj());
  }
}
