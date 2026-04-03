import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrgService } from '../../../../core/services/org.service';
import {
  Zaposlenik,
  Organ,
  OrganizacionaJedinica,
  RadnoMjesto,
} from '../../../../core/models/org.models';

@Component({
  selector: 'app-dodjela-zaposlenik-dialog',
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
    <h2 mat-dialog-title>Dodjela org. jedinice i radnog mjesta</h2>
    <p class="subtitle">
      <strong>{{ data.zaposlenik.ime }} {{ data.zaposlenik.prezime }}</strong>
    </p>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Organ</mat-label>
          <mat-select
            formControlName="organ"
            (selectionChange)="onOrganChange($event.value)"
          >
            <mat-option [value]="null">— Nije dodijeljeno —</mat-option>
            @for (o of organi; track o._id) {
              <mat-option [value]="o._id">{{ o.naziv }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Org. jedinica</mat-label>
          <mat-select
            formControlName="organizacionaJedinica"
            (selectionChange)="onJedinicaChange($event.value)"
          >
            <mat-option [value]="null">— Direktno u organu —</mat-option>
            @for (j of jedinice; track j._id) {
              <mat-option [value]="j._id">{{ j.naziv }}</mat-option>
            }
          </mat-select>
          @if (!form.value.organ) {
            <mat-hint>Prvo odaberite organ</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Radno mjesto</mat-label>
          <mat-select
            formControlName="radnoMjesto"
            [disabled]="!form.value.organizacionaJedinica || ucitavaRM"
          >
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
      <button
        mat-flat-button
        color="primary"
        [disabled]="loading"
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
        mat-form-field {
          width: 100%;
        }
      }
      .razred-info {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class DodjelaZaposlenikDialogComponent implements OnInit {
  ref = inject(MatDialogRef<DodjelaZaposlenikDialogComponent>);
  data = inject<{ zaposlenik: Zaposlenik }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private orgService = inject(OrgService);
  private cdr = inject(ChangeDetectorRef);

  organi: Organ[] = [];
  jedinice: OrganizacionaJedinica[] = [];
  radnaMjesta: RadnoMjesto[] = [];
  ucitavaRM = false;
  loading = false;

  form = this.fb.group({
    organ: [null as string | null],
    organizacionaJedinica: [null as string | null],
    radnoMjesto: [null as string | null],
  });

  ngOnInit() {
    this.orgService.getOrgani().subscribe((organi) => {
      this.organi = organi;

      const z = this.data.zaposlenik;
      if (z.organ) {
        this.form.patchValue({ organ: z.organ._id });
        this.ucitajJedinice(z.organ._id, () => {
          if (z.organizacionaJedinica) {
            this.form.patchValue({
              organizacionaJedinica: z.organizacionaJedinica._id,
            });
            this.ucitajRadnaMjesta(z.organizacionaJedinica._id, () => {
              if (z.radnoMjesto) {
                this.form.patchValue({ radnoMjesto: z.radnoMjesto._id });
              }
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }

  onOrganChange(organId: string | null) {
    this.form.patchValue({ organizacionaJedinica: null, radnoMjesto: null });
    this.jedinice = [];
    this.radnaMjesta = [];
    if (organId) this.ucitajJedinice(organId);
  }

  onJedinicaChange(jedinicaId: string | null) {
    this.form.patchValue({ radnoMjesto: null });
    this.radnaMjesta = [];
    if (!jedinicaId) return;

    const jeOrgan = this.organi.some((o) => o._id === jedinicaId);
    if (jeOrgan) {
      this.ucitavaRM = true;
      this.orgService.getRadnaMjestaOrgana(jedinicaId).subscribe((data) => {
        this.radnaMjesta = data;
        this.ucitavaRM = false;
        this.cdr.detectChanges();
      });
    } else {
      this.ucitajRadnaMjesta(jedinicaId);
    }
  }

  private ucitajJedinice(organId: string, callback?: () => void) {
    this.orgService.getOrganStruktura(organId).subscribe((s) => {
      const lista: OrganizacionaJedinica[] = [];

      // Dodaj root jedinicu organa (ministarstvo/zavod/direkcija)
      lista.push({
        _id: s.organ._id,
        naziv: `${s.organ.naziv} (direktno)`,
        tip: s.organ.vrstaOrgana as any,
        nadredjenaJedinica: null,
        aktivna: true,
        redoslijed: 0,
      } as unknown as OrganizacionaJedinica);

      // Dodaj OOJ i UOJ s indentacijom
      for (const ooj of s.osnovneJedinice) {
        lista.push(ooj as unknown as OrganizacionaJedinica);
        for (const uoj of ooj.unutrasnje) {
          lista.push({
            ...uoj,
            naziv: `  ↳ ${uoj.naziv}`,
          } as unknown as OrganizacionaJedinica);
        }
      }
      this.jedinice = lista;
      this.cdr.detectChanges();
      if (callback) callback();
    });
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
    const { organ, organizacionaJedinica, radnoMjesto } = this.form.value;

    this.orgService
      .dodjelaZaposlenika(this.data.zaposlenik._id, {
        organ: organ ?? undefined,
        organizacionaJedinica: organizacionaJedinica ?? undefined,
        radnoMjesto: radnoMjesto ?? undefined,
      })
      .subscribe({
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
