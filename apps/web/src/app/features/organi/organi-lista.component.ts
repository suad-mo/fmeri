import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrgService } from '../../core/services/org.service';
import { AuthService } from '../../core/services/auth.service';
import { Organ, VrstaOrgana, VRSTA_ORGANA_NAZIV } from '../../core/models/org.models';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-organi-lista',
  standalone: true,
  imports: [
    NgTemplateOutlet,  // ← dodaj
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDialogModule,
  ],
  template: `
    <div class="organi-lista-page">
      <div class="page-header">
        <div>
          <h1>Organi uprave</h1>
          <p>Federalno ministarstvo energije, rudarstva i industrije i organi u sastavu</p>
        </div>
        @if (jeAdmin()) {
          <button mat-flat-button color="primary" (click)="noviOrgan()">
            <mat-icon>add_business</mat-icon>
            Novi organ
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="loading-wrapper">
          <mat-spinner diameter="40"/>
        </div>
      } @else {
        <!-- Samostalni organi -->
        <div class="organi-sekcija">
          <h2 class="sekcija-naziv">
            <mat-icon>account_balance</mat-icon>
            Samostalni organi
          </h2>
          <div class="organi-grid">
            @for (organ of samostalni(); track organ._id) {
  <div class="organ-card" (click)="otvoriOrgan(organ)"
    (keyup.enter)="otvoriOrgan(organ)" tabindex="0" role="button">
    <div class="organ-card-inner">
      <div class="organ-ikona" [class]="'ikona-' + organ.vrstaOrgana">
        <mat-icon>{{ organ.uSastavu ? 'link' : 'account_balance' }}</mat-icon>
      </div>
      <div class="organ-info">
        <h3>{{ organ.naziv }}</h3>
        <p>{{ organ.nadleznost }}</p>
      </div>
      <div class="organ-footer">
        <mat-chip class="vrsta-chip vrsta-{{ organ.vrstaOrgana }}">
          {{ getVrstaNaziv(organ.vrstaOrgana) }}
        </mat-chip>
        @if (jeAdmin()) {
          <button mat-icon-button matTooltip="Uredi"
            (click)="urediOrgan(organ, $event)">
            <mat-icon>edit</mat-icon>
          </button>
        }
      </div>
    </div>
  </div>
}
          </div>
        </div>

        <!-- Organi u sastavu -->
        @if (uSastavu().length > 0) {
          <div class="organi-sekcija">
            <h2 class="sekcija-naziv">
              <mat-icon>link</mat-icon>
              Organi u sastavu
            </h2>
            <div class="organi-grid">
              @for (organ of uSastavu(); track organ._id) {
                <div class="organ-card" (click)="otvoriOrgan(organ)"
                  (keyup.enter)="otvoriOrgan(organ)" tabindex="0" role="button">
                  <ng-container *ngTemplateOutlet="organCard; context: { organ }"/>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>

    <!-- Template za organ card -->
    <ng-template #organCard let-organ="organ">
      <div class="organ-card-inner">
        <div class="organ-ikona" [class]="'ikona-' + organ.vrstaOrgana">
          <mat-icon>{{ organ.uSastavu ? 'link' : 'account_balance' }}</mat-icon>
        </div>
        <div class="organ-info">
          <h3>{{ organ.naziv }}</h3>
          <p>{{ organ.nadleznost }}</p>
        </div>
        <div class="organ-footer">
          <mat-chip class="vrsta-chip vrsta-{{ organ.vrstaOrgana }}">
            {{ getVrstaNaziv(organ.vrstaOrgana) }}
          </mat-chip>
          @if (jeAdmin()) {
            <button mat-icon-button matTooltip="Uredi"
              (click)="urediOrgan(organ, $event)">
              <mat-icon>edit</mat-icon>
            </button>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .organi-lista-page {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;

      h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.25rem; }
      p  { color: var(--color-text-secondary); font-size: 0.875rem; margin: 0; }
    }

    .loading-wrapper {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .organi-sekcija {
      margin-bottom: 2rem;
    }

    .sekcija-naziv {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 1rem;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .organi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .organ-card {
      cursor: pointer;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background: var(--color-background-card);
      transition: all 0.2s;
      overflow: hidden;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);
      }
    }

    .organ-card-inner {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .organ-ikona {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }

      &.ikona-ministarstvo         { background: linear-gradient(135deg, #667eea, #764ba2); }
      &.ikona-upravna_organizacija { background: linear-gradient(135deg, #ed8936, #dd6b20); }
      &.ikona-uprava               { background: linear-gradient(135deg, #48bb78, #38a169); }
      &.ikona-ustanova             { background: linear-gradient(135deg, #4299e1, #3182ce); }
    }

    .organ-info {
      flex: 1;

      h3 {
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0 0 0.25rem;
      }

      p {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.4;
      }
    }

    .organ-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .vrsta-chip {
      font-size: 0.7rem !important;
      height: 22px !important;
      min-height: 22px !important;

      &.vrsta-ministarstvo         { background: rgba(102, 126, 234, 0.15) !important; color: #667eea !important; }
      &.vrsta-upravna_organizacija { background: rgba(237, 137, 54, 0.15)  !important; color: #ed8936 !important; }
    }
  `],
})
export class OrganiListaComponent implements OnInit {
  private orgService = inject(OrgService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  organi = signal<Organ[]>([]);
  isLoading = signal(true);

  samostalni = signal<Organ[]>([]);
  uSastavu = signal<Organ[]>([]);

  jeAdmin = () => this.authService.currentUser()?.role.includes('admin') ?? false;

  ngOnInit() {
    this.orgService.getOrgani().subscribe({
      next: (data) => {
        this.organi.set(data);
        this.samostalni.set(data.filter(o => !o.uSastavu));
        this.uSastavu.set(data.filter(o => o.uSastavu));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getVrstaNaziv(vrsta: string): string {
    return VRSTA_ORGANA_NAZIV[vrsta as VrstaOrgana] ?? vrsta;
  }

  otvoriOrgan(organ: Organ) {
    this.router.navigate(['/organi', organ._id]);
  }

  noviOrgan() {
    import('../admin/organi/dialogs/organ-dialog.component').then(
      ({ OrganDialogComponent }) => {
        const ref = this.dialog.open(OrganDialogComponent, {
          width: '600px',
          data: {},
        });
        ref.afterClosed().subscribe(r => { if (r) this.ngOnInit(); });
      }
    );
  }

  urediOrgan(organ: Organ, event: Event) {
    event.stopPropagation();
    import('../admin/organi/dialogs/organ-dialog.component').then(
      ({ OrganDialogComponent }) => {
        const ref = this.dialog.open(OrganDialogComponent, {
          width: '600px',
          data: { organ },
        });
        ref.afterClosed().subscribe(r => { if (r) this.ngOnInit(); });
      }
    );
  }
}
