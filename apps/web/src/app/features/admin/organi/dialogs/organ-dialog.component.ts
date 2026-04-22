import { Component, inject, OnInit } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { OrgService } from '../../../../core/services/org.service';
import {
  Organ,
  VrstaOrgana,
  VRSTA_ORGANA_NAZIV,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-organ-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.organ ? 'Uredi organ' : 'Novi organ uprave' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Naziv organa</mat-label>
          <input matInput formControlName="naziv" />
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Skraćeni naziv</mat-label>
            <input matInput formControlName="skraceniNaziv" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Vrsta organa</mat-label>
            <mat-select formControlName="vrstaOrgana">
              @for (v of vrste; track v.value) {
                <mat-option [value]="v.value">{{ v.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Nadležnost</mat-label>
          <textarea matInput formControlName="nadleznost" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nadležnost</mat-label>
          <textarea matInput formControlName="nadleznost" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Zakonski osnov</mat-label>
          <textarea
            matInput
            formControlName="zakonskiOsnovText"
            rows="4"
            placeholder="Zakon o ministarstvima FBiH&#10;Zakon o organizaciji organa uprave FBiH"
          >
          </textarea>
          <mat-hint>Svaki zakon u novom redu</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>U sastavu ministarstva</mat-label>
          <mat-select formControlName="uSastavu">
            <mat-option [value]="false">Ne — samostalni organ</mat-option>
            <mat-option [value]="true">Da — u sastavu</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.value.uSastavu) {
          <mat-form-field appearance="outline">
            <mat-label>Nadređeni organ</mat-label>
            <mat-select formControlName="nadredjeniOrgan">
              <mat-option [value]="null">— Odaberi —</mat-option>
              @for (o of organi; track o._id) {
                <mat-option [value]="o._id">{{ o.naziv }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || loading"
        (click)="spremi()"
      >
        @if (loading) {
          <mat-spinner diameter="20" />
        } @else {
          Sačuvaj
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 520px;
        padding-top: 0.5rem;
        mat-form-field {
          width: 100%;
        }
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
    `,
  ],
})
export class OrganDialogComponent implements OnInit {
  ref = inject(MatDialogRef<OrganDialogComponent>);
  data = inject<{ organ?: Organ }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);

  organi: Organ[] = [];
  loading = false;

  vrste = Object.entries(VRSTA_ORGANA_NAZIV).map(([value, label]) => ({
    value: value as VrstaOrgana,
    label,
  }));

  form = this.fb.group({
    naziv: ['', Validators.required],
    skraceniNaziv: [''],
    vrstaOrgana: ['ministarstvo' as VrstaOrgana, Validators.required],
    nadleznost: [''],
    zakonskiOsnovText: [''],
    uSastavu: [false],
    nadredjeniOrgan: [null as string | null],
  });

  ngOnInit() {
    this.orgService.getOrgani().subscribe((o) => {
      this.organi = o.filter((x) => x._id !== this.data.organ?._id);
    });

    if (this.data.organ) {
      const o = this.data.organ;
      this.form.patchValue({
        naziv: o.naziv,
        skraceniNaziv: o.skraceniNaziv ?? '',
        vrstaOrgana: o.vrstaOrgana,
        nadleznost: o.nadleznost ?? '',
        zakonskiOsnovText: o.zakonskiOsnov?.join('\n') ?? '',
        uSastavu: o.uSastavu,
        nadredjeniOrgan: o.nadredjeniOrgan?._id ?? null,
      });
    }
  }

  spremi() {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.value;

    const data: Partial<Organ> = {
      naziv: raw.naziv ?? '',
      skraceniNaziv: raw.skraceniNaziv ?? undefined,
      vrstaOrgana: raw.vrstaOrgana as VrstaOrgana,
      nadleznost: raw.nadleznost ?? undefined,
      zakonskiOsnov: raw.zakonskiOsnovText
        ? raw.zakonskiOsnovText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      uSastavu: raw.uSastavu ?? false,
      nadredjeniOrgan: raw.nadredjeniOrgan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? ({ _id: raw.nadredjeniOrgan } as any)
        : undefined,
    };

    const request$ = this.data.organ
      ? this.orgService.updateOrgan(this.data.organ._id, data)
      : this.orgService.createOrgan(data);

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
