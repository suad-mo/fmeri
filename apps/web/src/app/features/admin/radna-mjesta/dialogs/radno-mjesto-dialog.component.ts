import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { OrgService } from '../../../../core/services/org.service';
import {
  RadnoMjesto,
  PozicijaRadnogMjesta,
  StatusSluzbenika,
  POZICIJA_NAZIV,
  STATUS_NAZIV,
  OrganizacionaJedinica,
  RadnoMjestoDTO,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-radno-mjesto-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mjesto ? 'Uredi radno mjesto' : 'Novo radno mjesto' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Naziv</mat-label>
          <input matInput formControlName="naziv" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Pozicija</mat-label>
          <mat-select formControlName="pozicija">
            @for (p of pozicije; track p.value) {
              <mat-option [value]="p.value">{{ p.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Organizaciona jedinica</mat-label>
          <mat-select formControlName="organizacionaJedinica">
            @for (j of jedinice; track j._id) {
              <mat-option [value]="j._id">{{ j.naziv }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status službenika</mat-label>
          <mat-select formControlName="statusSluzbenika">
            @for (s of statusi; track s.value) {
              <mat-option [value]="s.value">{{ s.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nivo (1-10)</mat-label>
          <input
            matInput
            type="number"
            formControlName="nivo"
            min="1"
            max="10"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Broj izvršilaca</mat-label>
          <input
            matInput
            type="number"
            formControlName="brojIzvrsilaca"
            min="1"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Opis poslova</mat-label>
          <textarea matInput formControlName="opsisPoslova" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="spremi()"
      >
        {{ data.mjesto ? 'Sačuvaj' : 'Kreiraj' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 460px;
        padding-top: 0.5rem;

        mat-form-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class RadnoMjestoDialogComponent implements OnInit {
  ref = inject(MatDialogRef<RadnoMjestoDialogComponent>);
  data = inject<{ mjesto?: RadnoMjesto }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);
  private cdr = inject(ChangeDetectorRef);

  jedinice: OrganizacionaJedinica[] = [];

  pozicije = Object.entries(POZICIJA_NAZIV).map(([value, label]) => ({
    value: value as PozicijaRadnogMjesta,
    label,
  }));

  statusi = Object.entries(STATUS_NAZIV).map(([value, label]) => ({
    value: value as StatusSluzbenika,
    label,
  }));

  form = this.fb.group({
    naziv: ['', Validators.required],
    pozicija: ['' as PozicijaRadnogMjesta, Validators.required],
    organizacionaJedinica: ['', Validators.required],
    statusSluzbenika: ['' as StatusSluzbenika, Validators.required],
    nivo: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    brojIzvrsilaca: [1, [Validators.required, Validators.min(1)]],
    opsisPoslova: [''],
  });

  ngOnInit() {
    this.orgService.getJedinice().subscribe((data) => {
      this.jedinice = data;
      this.cdr.detectChanges(); // ← dodaj ovo
    });

    if (this.data.mjesto) {
      const m = this.data.mjesto;
      this.form.patchValue({
        naziv: m.naziv,
        pozicija: m.pozicija,
        organizacionaJedinica: m.organizacionaJedinica._id,
        statusSluzbenika: m.statusSluzbenika,
        nivo: m.nivo,
        brojIzvrsilaca: m.brojIzvrsilaca,
        opsisPoslova: m.opsisPoslova ?? '',
      });
    }
  }

  spremi() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const data: RadnoMjestoDTO = {
      naziv: raw.naziv as string,
      pozicija: raw.pozicija as PozicijaRadnogMjesta,
      organizacionaJedinica: raw.organizacionaJedinica as string,
      statusSluzbenika: raw.statusSluzbenika as StatusSluzbenika,
      nivo: raw.nivo as number,
      brojIzvrsilaca: raw.brojIzvrsilaca as number,
      opsisPoslova: raw.opsisPoslova as string,
    };

    const obs = this.data.mjesto
      ? this.orgService.updateRadnoMjesto(this.data.mjesto._id, data)
      : this.orgService.createRadnoMjesto(data);

    obs.subscribe(() => this.ref.close(true));
  }
}
