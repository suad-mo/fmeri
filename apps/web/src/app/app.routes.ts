import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  // ── Javne rute ──────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  // ── Zaštićene rute (svi prijavljeni) ────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      // Organi — svi prijavljeni vide
      {
        path: 'organi',
        loadComponent: () =>
          import('./features/organi/organi-lista.component').then(
            (m) => m.OrganiListaComponent,
          ),
      },
      {
        path: 'izvjestaji/popunjenost',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/izvjestaji/popunjenost/popunjenost.component'
          ).then((m) => m.PopunjenostComponent),
      },
      {
        path: 'organi/:organId',
        loadComponent: () =>
          import(
            './features/organi/organ-detalji/organ-detalji.component'
          ).then((m) => m.OrganDetaljiComponent),
      },
      // Zaposlenici — svi vide
      {
        path: 'zaposlenici',
        loadComponent: () =>
          import('./features/admin/zaposlenici/zaposlenici.component').then(
            (m) => m.ZaposleniciComponent,
          ),
      },
      {
        path: 'zaposlenici/:id',
        loadComponent: () =>
          import(
            './features/admin/zaposlenici/zaposlenik-detalji/zaposlenik-detalji.component'
          ).then((m) => m.ZaposlenikDetaljiComponent),
      },
      // Profil — vlastiti profil
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/profil/profil.component').then(
            (m) => m.ProfilComponent,
          ),
      },
      {
        path: 'izvjestaji/sistematizacija',
        loadComponent: () =>
          import(
            './features/izvjestaji/sistematizacija/sistematizacija.component'
          ).then((m) => m.SistematizacijaComponent),
      },
      {
        path: 'izvjestaji/pregled',
        loadComponent: () =>
          import('./features/izvjestaji/pregled/pregled.component').then(
            (m) => m.PregledComponent,
          ),
      },
      {
        path: 'predmeti',
        loadComponent: () =>
          import('./features/predmeti/predmeti.component').then(
            (m) => m.PredmetiComponent,
          ),
      },
      {
        path: 'predmeti/:id',
        loadComponent: () =>
          import(
            './features/predmeti/predmet-detalji/predmet-detalji.component'
          ).then((m) => m.PredmetDetaljiComponent),
      },
      // ── Admin rute (samo admin) ──────────────────────
      {
        path: 'admin',
        canActivate: [roleGuard(['admin'])],
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
      // Default redirect
      { path: '', redirectTo: 'organi', pathMatch: 'full' },
    ],
  },

  // Stare rute — redirect zbog kompatibilnosti
  { path: 'auth/login', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
