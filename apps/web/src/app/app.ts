import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule],
  template: `
    <button
      mat-icon-button
      class="theme-toggle"
      tabIndex="-1"
      (click)="toggleTheme()"
      [title]="isDark() ? 'Svjetla tema' : 'Tamna tema'"
    >
      <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
    <router-outlet />
  `,
  styles: [
    `
      .theme-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        color: white;
      }

      .theme-toggle:focus,
      .theme-toggle:focus-visible,
      .theme-toggle .mat-mdc-button-base:focus {
        outline: none !important;
        box-shadow: none !important;
      }
    `,
  ],
})
export class App {
  isDark = signal(localStorage.getItem('theme') === 'dark');

  constructor() {
    effect(() => {
      const body = document.body;
      if (this.isDark()) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme(): void {
    this.isDark.set(!this.isDark());
  }
}
