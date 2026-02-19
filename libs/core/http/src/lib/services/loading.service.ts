import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  /** True si au moins une requête est en cours */
  readonly isLoading = computed(() => this.activeRequests() > 0);

  /** Nombre de requêtes en cours */
  readonly pendingCount = computed(() => this.activeRequests());

  start(): void {
    this.activeRequests.update(count => count + 1);
  }

  stop(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }

  reset(): void {
    this.activeRequests.set(0);
  }
}