// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class StorageService {
//   constructor() {}

//   getUserData() {
//     const data = localStorage.getItem('user_data');
//     return data ? JSON.parse(data) : null;
//   }

//   getId() {
//     const data = this.getUserData();
//     return data ? data.id : null;
//   }

//   getAccessToken() {
//     return localStorage.getItem('access_token');
//   }

//   getOutletId() {
//     const data = this.getUserData();
//     return data ? data.id_outlet : null;
//   }

//   getOutletCode() {
//     const data = this.getUserData();
//     return data ? data.outlet_code : null;
//   }

  // getMembershipLevel() {
  //   const data = this.getUserData();
  //   return data ? data.member_level : null;
  // }

//   getPhoneNumber() {
//     const data = this.getUserData();
//     return data ? data.phone : null;
//   }

//   getUserName() {
//     const data = this.getUserData();
//     return data ? data.username : null;
//   }
// }


import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}
  setUserData(userData: any) {
    console.log("Menyimpan User Data:", userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  // getUserData() {
  //   const data = localStorage.getItem('user_data');
  //   return data ? JSON.parse(data) : null;
  // }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getSessionToken() {
    return localStorage.getItem('session_token');
  }

  clearSession() {
    localStorage.clear();
  }

  getUserData() {
    const data = localStorage.getItem('user_data');
    console.log("Mengambil User Data:", data);
    return data ? JSON.parse(data) : null;
  }

  getOutletId() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Outlet ID:", userData?.id_outlet);
    return userData?.id_outlet || '';
  }

  getOutletCode() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Outlet Code:", userData?.outlet_code);
    return userData?.outlet_code || '';
  }

  getOutletName() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Outlet Code:", userData?.outlet_name);
    return userData?.outlet_name || '';
  }

  getUsrNm() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil username :", userData?.username);
    return userData?.username || '';
  }

  getAddress() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil address :", userData?.address);
    return userData?.address || '';
  }

  getMembershipLevel() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Membership Level:", userData?.member_level);
    return userData?.member_level || '';
  }
   // getMembershipLevel() {
  //   const data = this.getUserData();
  //   return data ? data.member_level : null;
  // }
  // getMembershipLevel() {
  //   const userData = this.getUserData()?.userData;
  //   console.log("Mengambil Outlet Code:", userData?.member_level);
  //   return localStorage.getItem('member_level') || '';
  // }


  // getPhoneNumber() {
  //   const userData = this.getUserData()?.userData;
  //   console.log("Mengambil Outlet Code:", userData?.phone);
  //   return localStorage.getItem('phone') || '';
  // }
  getPhoneNumber() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Nomor HP:", userData?.phone);
    return userData?.phone || '';
  }

  getUserName() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil Outlet Code:", userData?.username);
    return localStorage.getItem('username') || '';
  }

  getUserLevel() {
    const userData = this.getUserData()?.userData;
    console.log("Mengambil User Level:", userData?.users_level);
    return userData?.users_level || '';
  }



}
