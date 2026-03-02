import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'sf-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="sf-search">
      <span class="sf-search__icon">🔍</span>
      <input
        class="sf-search__input"
        type="text"
        [placeholder]="placeholder()"
        [ngModel]="query()"
        (ngModelChange)="onInput($event)"
      />
      @if (query()) {
        <button class="sf-search__clear" (click)="onClear()">✕</button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .sf-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .sf-search:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .sf-search__icon {
      font-size: 14px;
      flex-shrink: 0;
      opacity: 0.5;
    }

    .sf-search__input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      color: #1e293b;
      background: transparent;
    }

    .sf-search__input::placeholder { color: #94a3b8; }

    .sf-search__clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .sf-search__clear:hover { background: #cbd5e1; }
  `],
})
export class SfSearchBarComponent implements OnInit {
  readonly placeholder = input('Rechercher...');
  readonly debounceMs = input(300);

  readonly searchChange = output<string>();

  readonly query = signal('');

  private readonly search$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.searchChange.emit(value));
  }

  onInput(value: string): void {
    this.query.set(value);
    this.search$.next(value);
  }

  onClear(): void {
    this.query.set('');
    this.search$.next('');
  }
}