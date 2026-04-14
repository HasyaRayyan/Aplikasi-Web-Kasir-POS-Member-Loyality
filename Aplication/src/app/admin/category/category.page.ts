import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import {
  IonIcon,
  IonSpinner, IonAlert } from '@ionic/angular/standalone';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [IonAlert, 
    CommonModule,
    FormsModule,
    IonIcon,
    IonSpinner,
    IonAlert
  ]
})
export class CategoryPage implements OnInit {

categories:any[] = [];
loading=false;
search='';
showDeleteAlert = false;
deleteId: number | null = null;


showModal=false;
isEdit=false;
editId:number|null=null;

form:any={ category_name:'' };

constructor(private categoryService:CategoryService){}

ngOnInit(){ this.loadData(); }

loadData(){
  this.loading=true;
  this.categoryService.getCategories().subscribe((res:any)=>{
    this.categories=res.data || [];
    this.loading=false;
  });
}

openAddModal(){
  this.isEdit=false;
  this.form={ category_name:'' };
  this.showModal=true;
}

openEditModal(c:any){
  this.isEdit=true;
  this.editId=c.id;
  this.form={ category_name:c.category_name };
  this.showModal=true;
}

closeModal(){
  this.showModal=false;
  this.editId=null;
}

save(){
  this.categoryService.createCategory(this.form)
    .subscribe(()=>{ this.loadData(); this.closeModal(); });
}

update(){
  if(!this.editId) return;
  this.categoryService.updateCategory(this.editId,this.form)
    .subscribe(()=>{ this.loadData(); this.closeModal(); });
}

delete(id: number) {
  this.deleteId = id;
  this.showDeleteAlert = true;
}
executeDelete() {
  if (!this.deleteId) return;

  this.categoryService.deleteCategory(this.deleteId)
    .subscribe(() => {
      this.loadData();
      this.showDeleteAlert = false;
      this.deleteId = null;
    });
}
deleteButtons = [
  {
    text: 'Batal',
    role: 'cancel'
  },
  {
    text: 'Hapus',
    role: 'destructive',
    handler: () => {
      this.executeDelete();
    }
  }
];



}
