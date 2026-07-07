import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from '../../firebase.config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);

  currentUser$: Observable<User | null | undefined> =
    this.currentUserSubject.asObservable();


  constructor() {
    onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email ?? 'No user');

      this.currentUserSubject.next(user);
    });
  }


  get currentUser(): User | null | undefined {
    return this.currentUserSubject.value;
  }


  async login(email: string, password: string): Promise<void> {

    try {

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log(
        'Firebase login successful:',
        result.user.email
      );


      const navigationResult = await this.router.navigate([
        '/dashboard'
      ]);


      console.log(
        'Dashboard navigation result:',
        navigationResult
      );


    } catch (error) {

      console.error(
        'Login service error:',
        error
      );

      throw error;
    }
  }


  async logout(): Promise<void> {

    await signOut(auth);

    await this.router.navigate([
      '/'
    ]);

  }

}