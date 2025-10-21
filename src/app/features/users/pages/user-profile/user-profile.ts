import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, UserProfile, UpdateUserProfileRequest } from '../../services/user';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  
  profileForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userService: User,
    private authService: Auth,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const subscription = this.userService.getCurrentUserProfile().subscribe({
      next: (response: any) => {

        const profile = response?.data || response;

        this.userProfile = profile;

        this.profileForm.patchValue({
          fullName: profile.name || '',
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Error al cargar el perfil del usuario';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.isEditing && this.userProfile) {
      this.profileForm.patchValue({
        fullName: this.userProfile.name,
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.userProfile) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.profileForm.value.fullName;

      const updateData: UpdateUserProfileRequest = {
        name: formValue,
      };

      const sub = this.userService.updateUserProfile(updateData).subscribe({
        next: (response: any) => {
        
          const updatedProfile = response?.data || response;

          this.userProfile = updatedProfile;
          this.isEditing = false;
          this.isSaving = false;
          this.successMessage = 'Perfil actualizado correctamente';

          // Actualizar datos en el servicio de autenticación
          const currentUserData = this.authService.getUserData();
          if (currentUserData) {
            currentUserData.fullName = updatedProfile.name;
            this.authService.setAuthData(
              this.authService.getToken() || '',
              currentUserData
            );
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = error?.error?.message || 'Error al actualizar el perfil';
          this.isSaving = false;
        }
      });

      this.subscriptions.push(sub);
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.userProfile) {
      this.profileForm.patchValue({
        fullName: this.userProfile.name,
        
      });
    }
  }

  

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
