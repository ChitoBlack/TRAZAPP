import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reservar-sala',
  templateUrl: './reservar-sala.component.html',
  styleUrls: ['./reservar-sala.component.scss'],
})
export class ReservarSalaComponent {
  @Input() sala!: string; // Sala seleccionada
  horaInicio: string = ''; // Hora de inicio
  horaFin: string = ''; // Hora de fin

  constructor(private modalCtrl: ModalController) {}

  // Confirmar la reserva
  confirmarReserva() {
    if (this.horaInicio && this.horaFin) {
      this.modalCtrl.dismiss({
        horaInicio: this.horaInicio,
        horaFin: this.horaFin,
      });
    } else {
      alert('Por favor, selecciona ambas horas.');
    }
  }

  // Cancelar la reserva
  cancelar() {
    this.modalCtrl.dismiss();
  }
}
