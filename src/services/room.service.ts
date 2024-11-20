import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Room {
  roomNumber: string;
  professor: string;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private firestore: AngularFirestore) {}

  // Método para obtener información de una sala por su ID
  getRoomById(roomsID: string): Observable<Room | null> {
    return this.firestore.collection('rooms').doc<Room>(roomsID).get().pipe(
      map(doc => {
        if (doc.exists) {
          return doc.data() as Room; // Devuelve los datos de la sala si existen
        } else {
          return null; // Si no existe el documento, devuelve null
        }
      })
    );
  }
}
