import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { NotFound } from './components/not-found/not-found';



@NgModule({
  declarations: [
    Header,
    Footer,
    NotFound
  ],
  imports: [
    CommonModule
  ],
  exports: [
    Header,
    Footer,
    NotFound
  ]
})
export class SharedModule { }
