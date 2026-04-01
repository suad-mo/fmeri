import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
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
        path: 'organi',
        loadComponent: () =>
          import('./organi/organi.component').then((m) => m.OrganiComponent),
      },
      { path: '', redirectTo: 'org-jedinice', pathMatch: 'full' },
    ],
  },
];
