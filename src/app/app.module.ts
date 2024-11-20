import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule
import { environment } from 'src/environments/environment.prod';
import { QrCodeModule } from 'ng-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReservarSalaComponent } from './modals/reservar-sala/reservar-sala.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent,ReservarSalaComponent],
  imports: [BrowserModule,
    QrCodeModule,
    IonicModule.forRoot(),
    QRCodeModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Inicializa Firebase
    AngularFireAuthModule, // Módulo para autenticación
    AngularFirestoreModule, // Módulo para Firestore
    AngularFireStorageModule // Módulo para almacenamiento en Firebase
  ],
  
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
