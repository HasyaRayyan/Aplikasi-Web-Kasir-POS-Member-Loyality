import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PointService } from 'src/app/services/point.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.page.html',
  styleUrls: ['./point.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PointPage implements OnInit {

  rules: any[] = [];
  loading = false;


  showDeleteAlert = false;
deleteId: number | null = null;

showSuccessAlert = false;
successMessage = '';

  page = 1;
  totalPages = 1;
  search = '';

  showModal = false;
  isEdit = false;
  editId: number | null = null;

  newRule: any = {
    event_name: '',
    start_date: '',
    end_date: '',
    amount_per_point: 0,
    point_value: 0,
    is_active: 1
  };

  constructor(private pointService: PointService) {}

  ngOnInit() {
    this.loadData();
  }

  // ===== LOAD =====
  loadData() {
    this.loading = true;

    this.pointService.getRules(this.page, this.search)
      .subscribe((res:any) => {
        this.rules = res.data || [];
        this.totalPages = res.meta?.total_pages || 1;
        this.loading = false;
      });
  }

  // ===== MODAL =====
  openAddModal() {
    this.isEdit = false;
    this.showModal = true;
    this.newRule = {
      event_name: '',
      start_date: '',
      end_date: '',
      amount_per_point: 0,
      point_value: 0,
      is_active: 1
    };
  }

  openEditModal(r: any) {
    this.isEdit = true;
    this.editId = r.id;
    this.showModal = true;
    this.newRule = { ...r };
  }

  closeModal() {
    this.showModal = false;
    this.editId = null;
  }

save() {
  this.pointService.createRule(this.newRule).subscribe(() => {
    this.successMessage = 'Rule berhasil ditambahkan';
    this.showSuccessAlert = true;
    this.closeModal();
    this.loadData();
  });
}

update() {
  if (!this.editId) return;

  this.pointService.updateRule(this.editId, this.newRule)
    .subscribe(() => {
      this.successMessage = 'Rule berhasil diperbarui';
      this.showSuccessAlert = true;
      this.closeModal();
      this.loadData();
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

delete(id: number) {
  this.deleteId = id;
  this.showDeleteAlert = true;
}
executeDelete() {
  if (!this.deleteId) return;

  this.pointService.deleteRule(this.deleteId)
    .subscribe(() => {
      this.loadData();
      this.showDeleteAlert = false;
      this.deleteId = null;
    });
}


  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }
}
