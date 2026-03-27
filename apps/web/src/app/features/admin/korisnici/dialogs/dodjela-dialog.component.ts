import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import {
  UserProfil,
  OrganizacionaJedinica,
  RadnoMjesto,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-dodjela-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      Dodjela org. jedinice i radnog mjesta
    </h2>
    <p class="subtitle">Korisnik: <strong>{{ data.korisnik.name }}</strong></p>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline">
          <mat-label>Organizaciona jedinica</mat-label>
          <mat-select formControlName="organizacionaJedinica"
            (selectionChange)="onJedinicaChange($event.value)">
            <mat-option [value]="null">— Nije dodijeljeno —</mat-option>
            @for (j of jedinice; track j._id) {
              <mat-option [value]="j._id">{{ j.naziv }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Radno mjesto</mat-label>
          <mat-select formControlName="radnoMjesto"
            [disabled]="!form.value.organizacionaJedinica || ucitavaRM">
            <mat-option [value]="null">— Nije dodijeljeno —</mat-option>
            @if (ucitavaRM) {
              <mat-option disabled>Učitavam...</mat-option>
            }
            @for (rm of radnaMjesta; track rm._id) {
              <mat-option [value]="rm._id">
                {{ rm.naziv }}
                <span class="razred-info"> — Razred {{ rm.platniRazred }}</span>
              </mat-option>
            }
          </mat-select>
          @if (!form.value.organizacionaJedinica) {
            <mat-hint>Prvo odaberite org. jedinicu</mat-hint>
          }
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Odustani</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || loading"
        (click)="spremi()">
        @if (loading) {
          <mat-spinner diameter="20"/>
        } @else {
          Sačuvaj
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin: -0.5rem 1.5rem 0.5rem;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 450px;
      padding-top: 0.5rem;
      mat-form-field { width: 100%; }
    }
    .razred-info {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  `],
})
export class DodjelaDialogComponent implements OnInit {
  ref = inject(MatDialogRef<DodjelaDialogComponent>);
  data = inject<{ korisnik: UserProfil }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);
  private cdr = inject(ChangeDetectorRef);

  jedinice: OrganizacionaJedinica[] = [];
  radnaMjesta: RadnoMjesto[] = [];
  ucitavaRM = false;
  loading = false;

  form = this.fb.group({
    organizacionaJedinica: [null as string | null],
    radnoMjesto: [null as string | null],
  });

  ngOnInit() {
    this.orgService.getJedinice().subscribe((data) => {
      this.jedinice = data;

      const k = this.data.korisnik;
      if (k.organizacionaJedinica) {
        this.form.patchValue({
          organizacionaJedinica: k.organizacionaJedinica._id,
        });
        this.ucitajRadnaMjesta(k.organizacionaJedinica._id, () => {
          if (k.radnoMjesto) {
            this.form.patchValue({ radnoMjesto: k.radnoMjesto._id });
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  onJedinicaChange(jedinicaId: string | null) {
    this.form.patchValue({ radnoMjesto: null });
    this.radnaMjesta = [];
    if (jedinicaId) this.ucitajRadnaMjesta(jedinicaId);
  }

  private ucitajRadnaMjesta(jedinicaId: string, callback?: () => void) {
    this.ucitavaRM = true;
    this.orgService.getRadnaMjesta(jedinicaId).subscribe((data) => {
      this.radnaMjesta = data;
      this.ucitavaRM = false;
      this.cdr.detectChanges();
      if (callback) callback();
    });
  }

  spremi() {
    this.loading = true;
    const { organizacionaJedinica, radnoMjesto } = this.form.value;

    this.orgService.dodjelaOrgRM(this.data.korisnik._id, {
      organizacionaJedinica: organizacionaJedinica as string,
      radnoMjesto: radnoMjesto as string,
    }).subscribe({
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
