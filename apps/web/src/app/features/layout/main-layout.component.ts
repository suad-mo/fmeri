import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { GlobalSearchComponent } from './global-search/global-search.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    GlobalSearchComponent,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <!-- ── Sidebar ──────────────────────────────────── -->
      <mat-sidenav mode="side" opened class="app-sidenav">
        <div class="sidenav-header">
          <div class="logo">
            <mat-icon>account_balance</mat-icon>
            <span>Vlada FBiH</span>
          </div>
          <!-- <small class="user-info">{{ authService.currentUser()?.name }}</small> -->
        </div>

        <mat-divider />

        <!-- Glavne rute — svi korisnici -->
        <mat-nav-list class="nav-lista">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="aktivan">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/predmeti" routerLinkActive="aktivan">
            <mat-icon matListItemIcon>folder</mat-icon>
            <span matListItemTitle>Predmeti</span>
          </a>
          <a mat-list-item routerLink="/organi" routerLinkActive="aktivan">
            <mat-icon matListItemIcon>account_balance</mat-icon>
            <span matListItemTitle>Organi uprave</span>
          </a>
          <a mat-list-item routerLink="/zaposlenici" routerLinkActive="aktivan">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Zaposlenici</span>
          </a>
          <a mat-list-item routerLink="/profil" routerLinkActive="aktivan">
            <mat-icon matListItemIcon>account_circle</mat-icon>
            <span matListItemTitle>Moj profil</span>
          </a>
        </mat-nav-list>

        <!-- Admin rute — samo admin -->
        @if (jeAdmin()) {
          <mat-divider />
          <div class="nav-sekcija-naziv">Administracija</div>
          <mat-nav-list class="nav-lista">
            <a
              mat-list-item
              routerLink="/admin/org-jedinice"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>account_tree</mat-icon>
              <span matListItemTitle>Org. jedinice</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/radna-mjesta"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>work</mat-icon>
              <span matListItemTitle>Radna mjesta</span>
            </a>
            <a
              mat-list-item
              routerLink="/izvjestaji/popunjenost"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Popunjenost</span>
            </a>
            <a
              mat-list-item
              routerLink="/izvjestaji/sistematizacija"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>assignment</mat-icon>
              <span matListItemTitle>Sistematizacija</span>
            </a>
            <a
              mat-list-item
              routerLink="/izvjestaji/pregled"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>account_tree</mat-icon>
              <span matListItemTitle>Pregled strukture</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/korisnici"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>manage_accounts</mat-icon>
              <span matListItemTitle>Korisnici</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/sabloni"
              routerLinkActive="aktivan"
            >
              <mat-icon matListItemIcon>description</mat-icon>
              <span matListItemTitle>Šabloni</span>
            </a>
          </mat-nav-list>
        }

        <!-- Logout -->
        <!-- <div class="sidenav-footer">
          <mat-divider />
          <button
            mat-list-item
            class="logout-btn"
            (click)="authService.logout()"
          >
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Odjava</span>
          </button>
        </div> -->
      </mat-sidenav>

      <!-- ── Glavni sadržaj ────────────────────────────── -->
      <mat-sidenav-content class="app-content">
        <div class="content-header">
          <app-global-search />
          <span class="user-role-badge" [class]="'role-' + primarnaRola()">
            {{ primarnaRola() }}
          </span>
          <span class="user-name">{{ authService.currentUser()?.name }}</span>
          <!-- <a mat-icon-button routerLink="/">
            <mat-icon>home</mat-icon>
          </a> -->
          <button mat-icon-button (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .app-container {
        height: 100vh;
      }

      .app-sidenav {
        width: 240px;
        display: flex;
        flex-direction: column;
        background: var(--color-background-card);
        border-right: 1px solid var(--color-border);
      }

      .sidenav-header {
        padding: 1.25rem 1rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #667eea;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }

      .user-info {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        padding-left: 0.25rem;
      }

      .nav-lista {
        padding: 0.5rem 0;
      }

      .nav-sekcija-naziv {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-secondary);
        padding: 0.75rem 1rem 0.25rem;
      }

      .aktivan {
        background: rgba(102, 126, 234, 0.1) !important;
        color: #667eea !important;
        border-radius: 8px;

        mat-icon {
          color: #667eea !important;
        }
      }

      .sidenav-footer {
        margin-top: auto;
        padding-bottom: 0.5rem;
      }

      .logout-btn {
        width: 100%;
        color: var(--color-text-secondary);
        cursor: pointer;

        &:hover {
          color: #e53e3e;
        }
      }

      // ── Glavni sadržaj ──────────────────────────────────
      .app-content {
        background: var(--color-background);
        overflow-y: auto;
      }

      .content-header {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 0.5rem 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-background-card);
        position: relative; // ← dodaj
        z-index: 100; // ← dodaj
      }

      .user-name {
        font-size: 0.85rem;
        font-weight: 500;
      }

      .user-role-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-weight: 600;
        text-transform: uppercase;

        &.role-admin {
          background: rgba(229, 62, 62, 0.1);
          color: #e53e3e;
        }
        &.role-user {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
        &.role-resursi {
          background: rgba(72, 187, 120, 0.1);
          color: #48bb78;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  jeAdmin = computed(
    () => this.authService.currentUser()?.role.includes('admin') ?? false,
  );

  primarnaRola = computed(() => {
    const roles = this.authService.currentUser()?.role ?? [];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('resursi')) return 'resursi';
    return 'user';
  });
}
