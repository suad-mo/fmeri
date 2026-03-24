import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'org-jedinice',
        loadComponent: () =>
          import('./org-jedinice/org-jedinice.component').then(
            (m) => m.OrgJediniceComponent
          ),
      },
      {
        path: 'radna-mjesta',
        loadComponent: () =>
          import('./radna-mjesta/radna-mjesta.component').then(
            (m) => m.RadnaMjestaComponent
          ),
      },
      { path: '', redirectTo: 'org-jedinice', pathMatch: 'full' },
    ],
  },
];
