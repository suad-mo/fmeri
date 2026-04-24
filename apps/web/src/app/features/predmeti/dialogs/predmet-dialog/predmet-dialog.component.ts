import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrgService } from '../../../../core/services/org.service';
import {
  IPredmet,
  Organ,
  PRIORITET_PREDMETA,
  PrioritetPredmeta,
  StatusPredmeta,
} from '../../../../core/models/org.models';
import { AuthService } from '../../../../../app/core/services/auth.service';

@Component({
  selector: 'app-predmet-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './predmet-dialog.component.html',
  styleUrl: './predmet-dialog.component.scss',
})
export class PredmetDialogComponent implements OnInit {
  ref = inject(MatDialogRef<PredmetDialogComponent>);
  data = inject<{ predmet?: IPredmet }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);
  private authService = inject(AuthService);

  imaZaposlenika = computed(() => !!this.authService.currentUser()?.zaposlenik);

  loading = false;
  organi = signal<Organ[]>([]);

  statusi = [
    { value: 'u_radu', label: 'U radu' },
    { value: 'rijeseno', label: 'Riješeno' },
    { value: 'arhivirano', label: 'Arhivirano' },
  ];

  prioriteti = Object.entries(PRIORITET_PREDMETA).map(([value, label]) => ({
    value,
    label,
  }));

  form = this.fb.group({
    brojPredmeta: ['', Validators.required],
    naziv: ['', Validators.required],
    opis: [''],
    prioritet: ['redovno', Validators.required],
    organ: ['', Validators.required],
    status: ['u_radu', Validators.required],
    datumOtvaranja: [new Date(), Validators.required],
    datumArhiviranja: [null as Date | null],
  });

  ngOnInit() {
    console.log('currentUser:', this.authService.currentUser());
    console.log('imaZaposlenika:', this.imaZaposlenika());
    console.log('zaposlenik field:', this.authService.currentUser()?.zaposlenik);
    this.orgService.getOrgani().subscribe((o) => this.organi.set(o));

    if (this.data.predmet) {
      const p = this.data.predmet;
      this.form.patchValue({
        brojPredmeta: p.brojPredmeta,
        naziv: p.naziv,
        opis: p.opis ?? '',
        prioritet: p.prioritet ?? 'redovno',
        organ: p.organ._id,
        status: p.status,
        datumOtvaranja: new Date(p.datumOtvaranja),
        datumArhiviranja: p.datumArhiviranja
          ? new Date(p.datumArhiviranja)
          : null,
      });
    }
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const data: Partial<IPredmet> = {
      brojPredmeta: raw.brojPredmeta ?? undefined,
      naziv: raw.naziv ?? undefined,
      opis: raw.opis ?? undefined,
      prioritet: (raw.prioritet as PrioritetPredmeta) ?? 'redovno',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      organ: this.imaZaposlenika() ? undefined : (raw.organ as any),
      status: (raw.status as StatusPredmeta) ?? 'u_radu',
      datumOtvaranja: raw.datumOtvaranja?.toISOString() ?? undefined,
      datumArhiviranja: raw.datumArhiviranja?.toISOString() ?? undefined,
    };
    const request$ = this.data.predmet
      ? this.orgService.updatePredmet(this.data.predmet._id, data)
      : this.orgService.createPredmet(data);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.ref.close(true);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
