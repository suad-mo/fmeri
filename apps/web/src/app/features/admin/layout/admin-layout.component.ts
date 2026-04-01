import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
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
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  authService = inject(AuthService);

  menuItems = [
    {
      label: 'Org. jedinice',
      icon: 'account_tree',
      route: '/admin/org-jedinice',
    },
    { label: 'Organi', icon: 'account_balance', route: '/admin/organi' },
    { label: 'Radna mjesta', icon: 'work', route: '/admin/radna-mjesta' },
    { label: 'Šabloni', icon: 'description', route: '/admin/sabloni' },
    {
      label: 'Korisnici',
      icon: 'people',
      route: '/admin/korisnici',
      adminOnly: true,
    },
    { label: 'Moj profil', icon: 'account_circle', route: '/profil' },
  ];

  isAdmin(): boolean {
    return this.authService.userRoles().includes('admin');
  }

}
