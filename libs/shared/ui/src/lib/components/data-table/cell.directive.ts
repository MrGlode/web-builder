import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[sfCell]',
  standalone: true,
})
export class SfCellDirective {
  readonly sfCell = input.required<string>();
  readonly templateRef = inject(TemplateRef<unknown>);
}