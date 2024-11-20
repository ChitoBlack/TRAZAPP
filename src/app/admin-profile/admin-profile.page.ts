// admin-profile.page.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss'],
})
export class AdminProfilePage implements OnInit {
  adminData: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadAdminProfile();
  }

  async loadAdminProfile() {
    const adminDoc = await this.authService.getAdminProfile();
    this.adminData = adminDoc?.data();
  }
}
