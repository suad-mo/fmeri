import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrgService } from '../../../../core/services/org.service';
import { IAkt, VRSTA_AKTA, SMJER_AKTA } from '../../../../core/models/org.models';

@Component({
  selector: 'app-akt-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './akt-dialog.component.html',
  styleUrl: './akt-dialog.component.scss',
})
export class AktDialogComponent implements OnInit {
  ref = inject(MatDialogRef<AktDialogComponent>);
  data = inject<{ predmetId: string; akt?: IAkt }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  loading = false;

  vrste = Object.entries(VRSTA_AKTA).map(([value, label]) => ({ value, label }));
  smjerovi = Object.entries(SMJER_AKTA).map(([value, label]) => ({ value, label }));

  form = this.fb.group({
    naziv:      ['', Validators.required],
    brojAkta:   [''],
    vrsta:      ['', Validators.required],
    smjer:      ['', Validators.required],
    datum:      [new Date(), Validators.required],
    posiljilac: [''],
    opis:       [''],
  });

  ngOnInit() {
    if (this.data.akt) {
      const a = this.data.akt;
      this.form.patchValue({
        naziv:      a.naziv,
        brojAkta:   a.brojAkta ?? '',
        vrsta:      a.vrsta,
        smjer:      a.smjer,
        datum:      new Date(a.datum),
        posiljilac: a.posiljilac ?? '',
        opis:       a.opis ?? '',
      });
    }
  }

  get jeUlazni(): boolean {
    return this.form.value.smjer === 'ulazni';
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const data: Partial<IAkt> = {
      naziv:      raw.naziv ?? '',
      brojAkta:   raw.brojAkta ?? undefined,
      vrsta:      raw.vrsta as IAkt['vrsta'],
      smjer:      raw.smjer as IAkt['smjer'],
      datum:      raw.datum?.toISOString() ?? '',
      posiljilac: raw.posiljilac ?? undefined,
      opis:       raw.opis ?? undefined,
    };

    const request$ = this.data.akt
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? this.orgService.updateAkt(this.data.predmetId, this.data.akt._id!, data)
      : this.orgService.addAkt(this.data.predmetId, data);

    request$.subscribe({
      next: () => { this.loading = false; this.ref.close(true); },
      error: () => { this.loading = false; },
    });
  }
}
