import { Routes } from '@angular/router';
import { Login } from './Components/auth/login/login';
import { Signup } from './Components/auth/signup/signup';
import { OtpVerify } from './Components/auth/otp/otp';
import { Home } from './Components/home/home';
import { Auth } from './guards/auth/auth';
import { Role } from './guards/role/role';
import { Cart } from './Components/customer/cart/cart';
import { PartnerWithUs } from './Components/partner-with-us/partner-with-us';
import { CustomerLayout } from './Components/customer/customer-layout/customer-layout';
import { CustomerHome } from './Components/customer/customer-home/customer-home';
import { PizzaDetail } from './Components/customer/pizza-detail/pizza-detail';
import { CustomerOrders } from './Components/customer/customer-orders/customer-orders';
import { CreateRestaurant } from './Components/customer/create-restaurant/create-restaurant';
import { CustomerProfile } from './Components/customer/profile/profile';
import { AdminLayout } from './Components/admin/admin-layout/admin-layout';
import { Dashboard } from './Components/admin/dashboard/dashboard';
import { Menu } from './Components/admin/menu/menu';
import { Orders } from './Components/admin/orders/orders';
import { StaffMgmt } from './Components/admin/staff-mgmt/staff-mgmt';
import { Settings } from './Components/admin/settings/settings';
import { StaffLayout } from './Components/staff/staff-layout/staff-layout';
import { StaffDashboard } from './Components/staff/staff-dashboard/staff-dashboard';
import { StaffOrders } from './Components/staff/staff-orders/staff-orders';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'otp-verify', component: OtpVerify },
  { path: 'partner', component: PartnerWithUs },

  // Customer Routes
  {
    path: 'customer',
    canActivate: [Auth],
    component: CustomerLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: CustomerHome },
      { path: 'menu', component: CustomerHome },
      { path: 'pizza/:id', component: PizzaDetail },
      { path: 'cart', component: Cart },
      { path: 'orders', component: CustomerOrders },
      { path: 'create-restaurant', component: CreateRestaurant },
      { path: 'profile', component: CustomerProfile }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [Auth, Role],
    data: { expectedRoles: ['ADMIN'] },
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'menu', component: Menu },
      { path: 'orders', component: Orders },
      { path: 'staff', component: StaffMgmt },
      { path: 'settings', component: Settings }
    ]
  },

  // Staff Routes
  {
    path: 'staff',
    canActivate: [Auth, Role],
    data: { expectedRoles: ['ADMIN', 'STAFF'] },
    component: StaffLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StaffDashboard },
      { path: 'orders', component: StaffOrders },
      { path: 'menu', component: Menu }
    ]
  },

  { path: '**', redirectTo: '' }
];
