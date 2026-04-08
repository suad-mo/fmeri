import { Routes } from '@angular/router';

// admin.routes.ts
export const adminRoutes: Routes = [
  {
    path: 'org-jedinice',
    loadComponent: () =>
      import('./org-jedinice/org-jedinice.component').then(
        (m) => m.OrgJediniceComponent,
      ),
  },
  {
    path: 'radna-mjesta',
    loadComponent: () =>
      import('./radna-mjesta/radna-mjesta.component').then(
        (m) => m.RadnaMjestaComponent,
      ),
  },
  {
    path: 'sabloni',
    loadComponent: () =>
      import('./sabloni/sabloni.component').then((m) => m.SabloniComponent),
  },
  {
    path: 'korisnici',
    loadComponent: () =>
      import('./korisnici/korisnici.component').then(
        (m) => m.KorisniciComponent,
      ),
  },
  {
    path: 'zaposlenici',
    loadComponent: () =>
      import('./zaposlenici/zaposlenici.component').then(
        (m) => m.ZaposleniciComponent,
      ),
  },
  { path: '', redirectTo: 'org-jedinice', pathMatch: 'full' },
];
