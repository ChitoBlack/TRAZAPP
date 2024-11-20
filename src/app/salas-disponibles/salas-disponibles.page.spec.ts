import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalasDisponiblesPage } from './salas-disponibles.page';

describe('SalasDisponiblesPage', () => {
  let component: SalasDisponiblesPage;
  let fixture: ComponentFixture<SalasDisponiblesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SalasDisponiblesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
