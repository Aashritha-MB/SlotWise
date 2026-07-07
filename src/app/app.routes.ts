import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Slots } from './pages/slots/slots';
import { Book } from './pages/book/book';
import { Bookings } from './pages/bookings/bookings';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    canActivate: [publicGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'slots',
    component: Slots,
    canActivate: [authGuard]
  },
  {
    path: 'book',
    component: Book
    // No guard — publicly accessible to customers
  },
  {
    path: 'bookings',
    component: Bookings,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];