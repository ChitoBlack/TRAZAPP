import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QRcodePage } from './qrcode.page';

describe('QRcodePage', () => {
  let component: QRcodePage;
  let fixture: ComponentFixture<QRcodePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QRcodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
