"use strict";

(function () {
   var LocalStorage = function () {
      this.storage = window.localStorage;
   };

   var SessionStorage = function () {
      this.storage = window.sessionStorage;
   };

   LocalStorage.prototype.get = function (key, promise) {
      try {
         var item = this.storage.getItem(key);
         if (item !== null && item !== "undefined") {
            item = this.unstringify(item);
         } else {
            item = undefined;
         }
         promise.resolve(item);
      } catch (e) {
         promise.reject(e);
      }
   };

   LocalStorage.prototype.set = function (key, value, promise) {
      try {
         this.storage.setItem(key, this.stringify(value));
         promise.resolve(value);
      } catch (e) {
         if (e.code === 22 || e.number === 2147942414) {
            promise.reject({
               message: "QUOTA_EXCEEDED_ERR",
               error: e
            });
         } else {
            promise.reject(e);
         }
      }
   }

   LocalStorage.prototype.getAll = function (key, promise) {
      try {
         var items = [];
         var len = this.storage.length;
         for (var i = 0; i < len; i += 1) {
            var itemKey = this.storage.key(i);
            if (itemKey.substring(0, key.length) === key) {
               var item = this.unstringify(this.storage.getItem(itemKey));
               items.push(item);
            }
         }
         promise.resolve(items);
      } catch (e) {
         promise.reject(e);
      }

   };

   LocalStorage.prototype.update = function (key, value, promise) {
      try {
         var item = this.storage.getItem(key);
         if (item === null) {
            promise.reject("Item does not exist");
         } else {
            this.set(key, value, promise);
         }
      } catch (e) {
         promise.reject(e);
      }
   };

   LocalStorage.prototype.add = function (key, value, promise) {

      try {
         var item = this.storage.getItem(key);
         if (item !== null) {
            promise.reject("Item already exists");
         } else {
            this.set(key, value, promise);
         }
      } catch (e) {
         promise.reject(e);
      }

   };
   LocalStorage.prototype.remove = function (key, promise) {

      try {
         this.storage.removeItem(key);
         promise.resolve();
      } catch (e) {
         promise.reject(e);
      }

   };
   LocalStorage.prototype.contains = function (key, promise) {
      try {
         var item = this.storage.getItem(key);
         promise.resolve(item !== null);
      } catch (e) {
         promise.reject(e);
      }

   };
   LocalStorage.prototype.removeAll = function (promise) {
      try {
         this.storage.clear();
         promise.resolve();
      } catch (e) {
         promise.reject(e);
      }

   };


   if (window.localStorage) {

      enduring.provider.registerProvider("LocalStorage", LocalStorage);
      return LocalStorage;

   } else if (window.sessionStorage) {

      SessionStorage.prototype = LocalStorage.prototype;
      enduring.provider.registerProvider("SessionStorage", SessionStorage);
   }

})();