import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyCreateComponent} from './company/company-create/company-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth-interceptor';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ColorPickerModule } from 'ngx-color-picker';
import { CompanyComponent } from './company/company.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTabsModule} from '@angular/material/tabs';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { UserComponent } from './user/user.component';
import { UserListComponent } from './user/user-list/user-list.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { NoCompanyComponent } from './company/no-company/no-company.component';
import { CompanyHomeComponent } from './company/company-home/company-home.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupEditComponent } from './group/group-edit/group-edit.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';



@NgModule({
  declarations: [
    AppComponent,
    CompanyCreateComponent,
    SignupComponent,
    LoginComponent,
    CompanyComponent,
    MainNavComponent,
    UserComponent,
    UserListComponent,
    NoCompanyComponent,
    CompanyHomeComponent,
    GroupListComponent,
    GroupEditComponent,
    GroupDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatMenuModule,
    MatSidenavModule,
    ColorPickerModule,
    MatGridListModule,
    MatTabsModule,
    LayoutModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},],
  bootstrap: [AppComponent]
})
export class AppModule { }
