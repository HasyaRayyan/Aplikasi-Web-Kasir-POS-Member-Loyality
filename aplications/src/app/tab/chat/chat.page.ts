import { Component } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core'
import { AlertController, ModalController } from '@ionic/angular';
import { CustomDatePage } from 'src/app/custom-date/custom-date.page';
import { StorageService } from 'src/app/storage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false,
})
export class ChatPage {
  campaigns: any[] = [];
  customer: any[] = [];
  selectedDate: string = '';
  isAddCampaignModalOpen = false;
  membershipType: string | null = null;
  id_outlet: string | null = null;
  user_level: string = '';
  chatData: {
    name: string;
    description: string;
  } = {
    name: '',
    description: '',
  };

  contactInput: string = '';
  allContactsSelected = false;
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';
  customerFiltered: any[] = [];
  selectAllChecked: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  isAllDataLoaded: boolean = false;
  isLoading: boolean = false;
  page = 1;
  hasMoreData = true;
  searchQuery: string = '';
  filteredCampaigns: any[] = [...this.campaigns];
  showAllContacts = false;

  userSign = this.storageService

  constructor(
    private storageService: StorageService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {

    console.log('id_outlet' + this.userSign.getOutletId());
    console.log('membership' + this.userSign.getMembershipLevel());

    this.refresh();
    this.loadCampaigns();
    this.loadContacts();
    this.filteredCampaigns = [...this.campaigns];
    this.user_level  = this.storageService.getUserLevel();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async openDialog() {
    const membershipLevel = this.userSign.getMembershipLevel();

    if (membershipLevel != '1') {
      this.presentAlert('Perhatian', 'Harap upgrade membership ke level 2 atau lebih untuk memilih Real/Custom Time.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Pilih Pengiriman Data',
      message: 'Pengiriman Apa Yang Anda Inginkan?',
      buttons: [
        {
          text: 'Real Time',
          handler: () => {
            this.submitNewCampaign();
          }
        },
        {
          text: 'Custom Time',
          handler: async () => {
            if (membershipLevel == '1') {
              const modal = await this.modalController.create({
                component: CustomDatePage,
                componentProps: { selectedDate: this.selectedDate }
              });

              modal.onDidDismiss().then((dataReturned) => {
                if (dataReturned.data && dataReturned.data.selectedDate) {
                  this.selectedDate = dataReturned.data.selectedDate;
                  console.log('Tanggal dipilih:', this.selectedDate);
                  this.submitNewModalCampaign(this.selectedDate);
                } else {
                  console.log('Tidak ada tanggal yang dipilih.');
                }
              });

              return await modal.present();
            } else {
              this.presentAlert('Perhatian', 'Harap upgrade membership ke level 2 untuk memilih Custom Time.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async openDialogSigle() {
    const membershipLevel = this.userSign.getMembershipLevel();

    if (membershipLevel != '2' && membershipLevel != '1') {
      this.presentAlert('Perhatian', 'Harap upgrade membership ke level GOLD untuk memilih Custom Time.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Pilih Pengiriman Data',
      message: 'Pengiriman Apa Yang Anda Inginkan?',
      buttons: [
        {
          text: 'Batal',
          handler: () => {
            this.refresh();
          }
        },
        {
          text: 'Custom Time',
          handler: async () => {
            if (membershipLevel == '2' || membershipLevel == '1') {
              const modal = await this.modalController.create({
                component: CustomDatePage,
                componentProps: { selectedDate: this.selectedDate }
              });

              modal.onDidDismiss().then((dataReturned) => {
                if (dataReturned.data && dataReturned.data.selectedDate) {
                  this.selectedDate = dataReturned.data.selectedDate;
                  console.log('Tanggal dipilih:', this.selectedDate);
                  this.submitNewModalCampaign(this.selectedDate);
                } else {
                  console.log('Tidak ada tanggal yang dipilih.');
                }
              });

              return await modal.present();
            } else {
              this.presentAlert('Perhatian', 'Harap upgrade membership ke level 2 untuk memilih Custom Time.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  loadContacts() {
    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/campign/getCampignCustomerList',
      headers: { 'Content-Type': 'application/json' },
      data: { id_outlet: this.userSign.getOutletId() },
    })
      .then((response) => {
        const content = response.data;

        if (content.status && Array.isArray(content.data)) {
          const uniqueContacts: { [key: string]: any } = {};

          content.data.forEach((customer: { customer_phone: string; customer_name: string; }) => {
            if (!uniqueContacts[customer.customer_phone]) {
              uniqueContacts[customer.customer_phone] = {
                number: customer.customer_phone,
                name: customer.customer_name,
                selected: false,
              };
            }
          });

          this.customer = Object.values(uniqueContacts);
          this.customerFiltered = [...this.customer];
        } else {
          console.error('Gagal mendapatkan kontak:', content.message);
          this.presentAlert('Gagal', 'Gagal mengambil daftar kontak.');
        }
      })
      .catch((error) => {
        console.error('Error fetching contacts:', error);
        this.presentAlert('Error', 'Terjadi kesalahan saat mengambil daftar kontak.');
      });
  }

  searchContacts(event: any) {
    this.searchTerm = event.target.value.toLowerCase();

    this.customerFiltered = this.customer.filter(contact =>
      contact.name.toLowerCase().includes(this.searchTerm) ||
      contact.number.includes(this.searchTerm)
    );
  }

  toggleSelect(contact: any) {
    contact.selected = !contact.selected;
    this.checkIfAllSelected();
  }

  toggleSelectAll(event: any) {
    this.selectAllChecked = event.detail.checked;

    this.customerFiltered.forEach(contact => {
      contact.selected = this.selectAllChecked;
    });
  }

  toggleShowContacts(state: boolean) {
    this.showAllContacts = state;
  }

  checkIfAllSelected() {
    this.selectAllChecked = this.customerFiltered.every(contact => contact.selected);
  }

  refresh() {
    console.log('Testing error' + this.userSign.getOutletId());

    if (!this.hasMoreData) {
      this.hasMoreData = true;
      this.page = 1;
      this.campaigns = [];
    }

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/campign/getCampignList',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        id_outlet: this.userSign.getOutletId(),
        page: this.page,
        page_size: 10
      },
    }).then((response) => {
      const content = response.data;

      if (content.status) {
        const newCampaigns = content.data.map((campaign: any) => ({
          ...campaign,
          phone_list: JSON.parse(campaign.phone_list || '[]'),
        }));

        if (newCampaigns.length === 0) {
          this.hasMoreData = false;
          this.presentAlert('Information', 'Semua data sudah dimuat.'); // Use AlertController
          return;
        }

        if (this.page === 1) {
          this.campaigns = newCampaigns;
        } else {
          this.campaigns = [...this.campaigns, ...newCampaigns];
        }

        this.page++;
      } else {
        this.hasMoreData = false;
        this.presentAlert('Error', 'No campaigns found: ' + content.message); // Use AlertController
      }
    }).catch((error) => {
      console.error('Error fetching campaigns:', error);
      this.presentAlert('Error', 'Sorry, we encountered an error while fetching data. Please try again later.'); // Use AlertController
    });
  }

  loadCampaigns() {
    this.isLoading = true;
    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/campign/getCampignList',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        id_outlet: this.userSign.getOutletId(),
        page: this.currentPage,
        page_size: this.pageSize
      },
    }).then((response) => {
      const content = response.data;

      if (content.status) {

        if (this.currentPage === 1) {
          this.campaigns = content.data.map((campaign: any) => ({
            ...campaign,
            phone_list: JSON.parse(campaign.phone_list || '[]'),
          }));
        } else {
          this.campaigns = [...this.campaigns, ...content.data.map((campaign: any) => ({
            ...campaign,
            phone_list: JSON.parse(campaign.phone_list || '[]'),
          }))];
        }

        this.filterCampaigns();

        if (content.data.length < this.pageSize) {
          this.isAllDataLoaded = true;
        }
        this.isLoading = false;
      } else {
        this.presentAlert('Error', 'No campaigns found: ' + content.message); // Use AlertController
      }
    }).catch((error) => {
      console.error('Error fetching campaigns:', error);
      this.presentAlert('Error', 'Sorry, we encountered an error while fetching data. Please try again later.'); // Use AlertController
    });
  }

  loadMoreData() {
    if (!this.isAllDataLoaded) {
      this.currentPage += 1;
      this.loadCampaigns();
    }
  }

  openAddCampaignModal() {
    this.loadContacts();
    this.isAddCampaignModalOpen = true;
  }

  closeAddCampaignModal() {
    this.isAddCampaignModalOpen = false;
  }


  submitNewCampaign() {
    const selectedPhones = this.customer
      .filter(contact => contact.selected)
      .map(contact => contact.number);

    if (selectedPhones.length === 0) {
      this.presentAlert('Warning', 'Harap pilih minimal satu kontak.'); // Use AlertController
      return;
    }

    let formattedDate = '';
    const now = new Date();
    formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString().padStart(2, '0')}-${now.getDate()
      .toString().padStart(2, '0')} ${now.getHours()
      .toString().padStart(2, '0')}:${now.getMinutes()
      .toString().padStart(2, '0')}:${now.getSeconds()
      .toString().padStart(2, '0')}`;

    const body = {
      id_outlet: this.userSign.getOutletId(),
      name: this.chatData.name.trim(),
      description: this.chatData.description.trim(),
      phone_list: selectedPhones,
      date_campign: formattedDate,
    };

    if (this.chatData.name && this.chatData.description && selectedPhones.length > 0) {
      CapacitorHttp.post({
        url: 'https://epos.pringapus.com/api/v1/campign/addCampignRealTime',
        headers: { 'Content-Type': 'application/json' },
        data: body,
      }).then(() => {
        this.presentAlert('Success', 'Campaign berhasil ditambahkan!'); // Use AlertController

        const newCampaign = {
          name: body.name,
          description: body.description,
          phone_list: body.phone_list,
          date_campign: body.date_campign,
        };


        this.chatData.name = '';
        this.chatData.description = '';
        this.campaigns.unshift(newCampaign);
        this.filteredCampaigns = [...this.campaigns];
        this.refresh();

        this.closeAddCampaignModal();
      }).catch((error) => {
        console.error('Error adding campaign:', error);
        this.presentAlert('Error', 'Gagal menambahkan campaign.'); // Use AlertController
      });
    } else {
      this.presentAlert('Warning', 'Form tidak boleh kosong!'); // Use AlertController
    }
  }

  submitNewModalCampaign(selectedDate: string) {
    const selectedPhones = this.customer
      .filter(contact => contact.selected)
      .map(contact => contact.number);

    if (selectedPhones.length === 0) {
      this.presentAlert('Warning', 'Harap pilih minimal satu kontak.'); // Use AlertController
      return;
    }

    const body = {
      id_outlet: this.userSign.getOutletId(),
      name: this.chatData.name.trim(),
      description: this.chatData.description.trim(),
      phone_list: selectedPhones,
      date_campign: selectedDate,
    };

    CapacitorHttp.post({
      url: 'https://epos.pringapus.com/api/v1/campign/addCampignList',
      headers: { 'Content-Type': 'application/json' },
      data: body,
    }).then((response) => {
      if (response.data.status) {
        this.presentAlert('Success', 'Campaign berhasil ditambahkan!'); // Use AlertController
        this.chatData.name = '';
        this.chatData.description = '';
        this.refresh();
        this.campaigns.unshift(body);
        this.filteredCampaigns = [...this.campaigns];
        this.closeAddCampaignModal();
      } else {
        this.presentAlert('Error', response.data.message); // Use AlertController
      }
    }).catch((error) => {
      console.error('Error adding campaign:', error);
      this.presentAlert('Error', 'Gagal menambahkan campaign.'); // Use AlertController
    });
  }
  
    parseContacts(input: string): string[] {
    return input
      .split(',')
      .map(contact => contact.trim())
      .filter(contact => /^\d{9,15}$/.test(contact));
  }




  filterCampaigns() {
    this.filteredCampaigns = this.campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }


  goldPrivilege: boolean = false;
  silverPrivilege: boolean = false;
  bronzePrivilege: boolean = false;
  chatModal: boolean = false;

  goldprivilege() {
    this.goldPrivilege = !this.goldPrivilege ;
    this.silverPrivilege = false;
    this.bronzePrivilege = false;
  }

  silverprivilege() {
    this.silverPrivilege = !this.silverPrivilege
    this.goldPrivilege = false;
    this.bronzePrivilege = false;
  }

  bronzeprivilege() {
    this.bronzePrivilege = !this.bronzePrivilege
    this.silverPrivilege = false;
    this.goldPrivilege = false;
  }

  selectedCampaign: any;

  openChatModal(campaign: any) {
    this.chatModal = true;
    this.selectedCampaign = campaign;
  }

  closeChatModal() {
    this.chatModal = false;
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getBackgroundColor(name: string): string {
    const colors = [
      '#46e04a', '#4683b3', '#b346a4', '#e05c9a', '#bd3333',
      '#c47449', '#fae34d', '#57de9e',
      // '#FF5733', '#33FF57', '#3357FF', '#F4A460', '#8A2BE2',
      // '#FFD700', '#DC143C', '#20B2AA', '#FF69B4', '#4682B4'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }



}
