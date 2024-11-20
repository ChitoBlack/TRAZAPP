import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-salas-disponibles',
  templateUrl: './salas-disponibles.page.html',
  styleUrls: ['./salas-disponibles.page.scss'],
})
export class SalasDisponiblesPage implements OnInit {
  salas: any[] = [];
  reservas: any[] = []; // Agregamos las reservas aquí

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.cargarSalas();
    this.cargarReservas();
  }

  // Cargar salas desde Firestore
  cargarSalas() {
    this.firestore.collection('salas').snapshotChanges().subscribe((data) => {
      this.salas = data.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as any,
      }));
    });
  }

  // Cargar reservas desde Firestore
  cargarReservas() {
    this.firestore.collection('reservas').snapshotChanges().subscribe((data) => {
      this.reservas = data.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as any,
      }));
    });
  }
}
