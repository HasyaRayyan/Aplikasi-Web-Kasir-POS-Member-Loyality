// src/app/services/secure-storage.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

interface NativeSS {
  set(success: (res?: any) => void, error: (err: any) => void, key: string, value: string): void;
  get(success: (val: string) => void, error: (err: any) => void, key: string): void;
  remove(success: (res?: any) => void, error: (err: any) => void, key: string): void;
  clear(success: (res?: any) => void, error: (err: any) => void): void;
}

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private nativeInstance: NativeSS | null = null;
  private readonly fallbackPrefix = 'epos_insecure_';
  private readonly storeName = 'epos_secure_store';

  constructor(private platform: Platform) {}

  // call this in app.component (platform.ready()) or ngOnInit of login page
  async init(): Promise<void> {
    await this.platform.ready();
    try {
      // Cordova plugin exposes constructor at: window.cordova.plugins.SecureStorage or window.SecureStorage (varies)
      const w: any = window as any;
      if (this.platform.is('hybrid')) {
        // try common locations
        const ctor =
        (w.cordova?.plugins?.SecureStorage) ||
        (w.SecureStorage) ||
        (w.plugins?.SecureStorage) ||
        (w.cordova?.plugin?.SecureStorage) ||
        null;
        if (!ctor) {
          console.warn('SecureStorage plugin not found on window, fallback to localStorage');
          this.nativeInstance = null;
          return;
        }

        // plugin api often: new cordova.plugins.SecureStorage(success, error, storeName)
        try {
          // create instance (some builds require new ctor(...))
          const inst = new ctor(
            () => { /* created */ },
            (err: any) => { console.warn('SecureStorage create error', err); },
            this.storeName
          );
          // instantiate wrapper exposing set/get/remove/clear
          this.nativeInstance = {
            set: (success, error, key, value) => (inst.set(success, error, key, value)),
            get: (success, error, key) => (inst.get(success, error, key)),
            remove: (success, error, key) => (inst.remove(success, error, key)),
            clear: (success, error) => (inst.clear(success, error)),
          };
          console.log('SecureStorage native instance created');
        } catch (e) {
          console.warn('Failed to create SecureStorage instance', e);
          this.nativeInstance = null;
        }
      } else {
        // web / browser
        this.nativeInstance = null;
      }
    } catch (e) {
      console.warn('SecureStorage init error', e);
      this.nativeInstance = null;
    }
  }

  private isNativeAvailable(): boolean {
    return !!this.nativeInstance;
  }

  async set(key: string, value: string): Promise<void> {
    if (this.isNativeAvailable()) {
      return new Promise<void>((resolve, reject) => {
        try {
          this.nativeInstance!.set(
            () => resolve(),
            (err: any) => {
              console.warn('SecureStorage native set failed', err);
              // fallback: persist in localStorage encoded
              try {
                localStorage.setItem(this.fallbackPrefix + key, btoa(value));
                resolve();
              } catch (le) {
                reject(err);
              }
            },
            key,
            value
          );
        } catch (e) {
          console.warn('SecureStorage set exception', e);
          localStorage.setItem(this.fallbackPrefix + key, btoa(value));
          resolve();
        }
      });
    } else {
      // fallback
      localStorage.setItem(this.fallbackPrefix + key, btoa(value));
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isNativeAvailable()) {
      return new Promise<string | null>((resolve) => {
        try {
          this.nativeInstance!.get(
            (val: string) => resolve(val ?? null),
            (err: any) => {
              console.warn('SecureStorage native get failed', err);
              const fb = localStorage.getItem(this.fallbackPrefix + key);
              resolve(fb ? atob(fb) : null);
            },
            key
          );
        } catch (e) {
          console.warn('SecureStorage get exception', e);
          const fb = localStorage.getItem(this.fallbackPrefix + key);
          return resolve(fb ? atob(fb) : null);
        }
      });
    } else {
      const fb = localStorage.getItem(this.fallbackPrefix + key);
      return fb ? atob(fb) : null;
    }
  }

  async remove(key: string): Promise<void> {
    if (this.isNativeAvailable()) {
      return new Promise<void>((resolve) => {
        try {
          this.nativeInstance!.remove(
            () => resolve(),
            (err: any) => {
              console.warn('SecureStorage native remove failed', err);
              localStorage.removeItem(this.fallbackPrefix + key);
              resolve();
            },
            key
          );
        } catch (e) {
          console.warn('SecureStorage remove exception', e);
          localStorage.removeItem(this.fallbackPrefix + key);
          resolve();
        }
      });
    } else {
      localStorage.removeItem(this.fallbackPrefix + key);
    }
  }

  async clear(): Promise<void> {
    if (this.isNativeAvailable()) {
      return new Promise<void>((resolve) => {
        try {
          this.nativeInstance!.clear(
            () => resolve(),
            (err: any) => {
              console.warn('SecureStorage native clear failed', err);
              // fallback: remove our prefixed keys
              Object.keys(localStorage).filter(k => k.startsWith(this.fallbackPrefix)).forEach(k => localStorage.removeItem(k));
              resolve();
            }
          );
        } catch (e) {
          console.warn('SecureStorage clear exception', e);
          Object.keys(localStorage).filter(k => k.startsWith(this.fallbackPrefix)).forEach(k => localStorage.removeItem(k));
          resolve();
        }
      });
    } else {
      Object.keys(localStorage).filter(k => k.startsWith(this.fallbackPrefix)).forEach(k => localStorage.removeItem(k));
    }
  }
}
