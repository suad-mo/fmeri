import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  OrganizacionaJedinica,
  TIP_JEDINICE_NAZIV,
  TipJedinice,
} from '../../../core/models/org.models';

@Component({
  selector: 'app-org-tree-node',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatChipsModule, MatTooltipModule],
  template: `
    <div class="tree-node" [style.padding-left.px]="nivo * 24 + 8">
      <div class="node-row">
        <!-- Toggle dugme -->
        @if (node.djeca && node.djeca.length > 0) {
          <button
            mat-icon-button
            class="toggle-btn"
            (click)="prosiren.set(!prosiren())"
          >
            <mat-icon>{{
              prosiren() ? 'expand_more' : 'chevron_right'
            }}</mat-icon>
          </button>
        } @else {
          <span class="leaf-spacer">
            <mat-icon class="leaf-icon">fiber_manual_record</mat-icon>
          </span>
        }

        <!-- Naziv -->
        <button
          mat-button
          class="node-naziv"
          [class.parent-naziv]="node.djeca && node.djeca.length > 0"
          (click)="detaljiClicked.emit(node)"
        >
          {{ node.naziv }}
        </button>

        <!-- Tip badge -->
        <mat-chip class="node-tip tip-{{ node.tip }}">
          {{ getTipNaziv(node.tip) }}
        </mat-chip>

        <!-- Akcije -->
        <div class="node-akcije">
          @if (mozeDodiJedinicu(node.tip)) {
            <button
              mat-icon-button
              class="btn-add-jedinica"
              (click)="
                addJedinicaClicked.emit({
                  roditelj: node,
                  dozvoljeneTipove: getDozvoljeneTipove(node.tip),
                })
              "
              matTooltip="Dodaj podređenu jedinicu"
            >
              <mat-icon>account_tree</mat-icon>
            </button>
          }

          @if (mozeDodatiRadnoMjesto(node.tip)) {
            <button
              mat-icon-button
              class="btn-add-radno"
              (click)="addRadnoMjestoClicked.emit(node)"
              matTooltip="Dodaj radno mjesto"
            >
              <mat-icon>work</mat-icon>
            </button>
          }

          <button
            mat-icon-button
            (click)="editClicked.emit(node)"
            matTooltip="Uredi"
          >
            <mat-icon>edit</mat-icon>
          </button>

          <button
            mat-icon-button
            color="warn"
            (click)="deleteClicked.emit(node._id)"
            matTooltip="Deaktiviraj"
          >
            <mat-icon>block</mat-icon>
          </button>
        </div>
      </div>

      <!-- Rekurzivno djeca -->
      @if (prosiren() && node.djeca && node.djeca.length > 0) {
        @for (dijete of node.djeca; track dijete._id) {
          <app-org-tree-node
            [node]="dijete"
            [nivo]="nivo + 1"
            (editClicked)="editClicked.emit($event)"
            (deleteClicked)="deleteClicked.emit($event)"
            (addJedinicaClicked)="addJedinicaClicked.emit($event)"
            (addRadnoMjestoClicked)="addRadnoMjestoClicked.emit($event)"
            (detaljiClicked)="detaljiClicked.emit($event)"
          >
          </app-org-tree-node>
        }
      }
    </div>
  `,
  styles: [
    `
      .tree-node {
        width: 100%;
      }

      .node-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px 6px 0;
        min-height: 40px;
        border-radius: 8px;
        transition: background 0.12s;
        cursor: default;

        &:hover {
          background: var(--color-background-secondary);
          .node-akcije {
            opacity: 1;
          }
        }
      }

      .toggle-btn {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        flex-shrink: 0;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .leaf-spacer {
        width: 28px;
        min-width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .leaf-icon {
        font-size: 6px !important;
        width: 6px !important;
        height: 6px !important;
        color: var(--color-text-tertiary);
      }

      .node-naziv {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--color-text-primary);
        text-align: left !important; // ← dodaj !important
        padding: 0 !important;
        min-width: 0;
        justify-content: flex-start !important; // ← dodaj

        &.parent-naziv {
          font-weight: 600;
        }
      }

      .node-tip {
        font-size: 0.68rem !important;
        min-height: 20px !important;
        height: 20px !important;
        padding: 0 7px !important;
        border-radius: 4px !important;
      }

      .node-akcije {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s;
        flex-shrink: 0;
      }

      .btn-add-jedinica mat-icon {
        color: #667eea;
      }
      .btn-add-radno mat-icon {
        color: #38a169;
      }

      button[mat-icon-button] {
        width: 28px !important;
        height: 28px !important;
        line-height: 28px !important;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
        }
      }

      .tip-ministarstvo {
        background: rgba(102, 126, 234, 0.12) !important;
        color: #667eea !important;
      }
      .tip-kabinet {
        background: rgba(159, 122, 234, 0.12) !important;
        color: #9f7aea !important;
      }
      .tip-zavod {
        background: rgba(237, 137, 54, 0.12) !important;
        color: #ed8936 !important;
      }
      .tip-direkcija {
        background: rgba(229, 62, 62, 0.12) !important;
        color: #e53e3e !important;
      }
      .tip-sektor {
        background: rgba(56, 178, 172, 0.12) !important;
        color: #38b2ac !important;
      }
      .tip-odsjek {
        background: rgba(72, 187, 120, 0.12) !important;
        color: #48bb78 !important;
      }
      .tip-grupa {
        background: rgba(246, 173, 85, 0.12) !important;
        color: #f6ad55 !important;
      }
      .tip-centar {
        background: rgba(66, 153, 225, 0.12) !important;
        color: #4299e1 !important;
      }
    `,
  ],
})
export class OrgTreeNodeComponent implements OnInit {
  @Input() node!: OrganizacionaJedinica;
  @Input() nivo = 0;
  @Output() editClicked = new EventEmitter<OrganizacionaJedinica>();
  @Output() deleteClicked = new EventEmitter<string>();
  @Output() addJedinicaClicked = new EventEmitter<{
    roditelj: OrganizacionaJedinica;
    dozvoljeneTipove: TipJedinice[];
  }>();
  @Output() addRadnoMjestoClicked = new EventEmitter<OrganizacionaJedinica>();
  @Output() detaljiClicked = new EventEmitter<OrganizacionaJedinica>();

  prosiren = signal(false);

  private readonly DOZVOLJENI_PODREDJENI: Partial<
    Record<TipJedinice, TipJedinice[]>
  > = {
    ministarstvo: ['kabinet', 'sektor', 'zavod', 'direkcija'],
    sektor: ['odsjek'],
    odsjek: ['grupa'],
    zavod: ['centar'],
    direkcija: ['sektor'],
  };

  ngOnInit() {
    this.prosiren.set(this.nivo === 0);
  }

  getTipNaziv(tip: string): string {
    return TIP_JEDINICE_NAZIV[tip as TipJedinice] ?? tip;
  }

  mozeDodiJedinicu(tip: TipJedinice): boolean {
    return !!this.DOZVOLJENI_PODREDJENI[tip];
  }

  mozeDodatiRadnoMjesto(tip: TipJedinice): boolean {
    return [
      'kabinet',
      'zavod',
      'direkcija',
      'sektor',
      'grupa',
      'odsjek',
      'centar',
    ].includes(tip);
  }

  getDozvoljeneTipove(tip: TipJedinice): TipJedinice[] {
    return this.DOZVOLJENI_PODREDJENI[tip] ?? [];
  }
}
