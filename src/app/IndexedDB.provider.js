(function () {
   "use strict";

   var indexeddb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
   var transaction = window.IDBTransaction || window.webkitIDBTransaction;

   var enduring = window.enduring || undefined;
   if (!enduring) {
      throw "Enduring Stash: Enduring Stash is missing!";
   }

   var IDBStorage = function () {
      var self = this;

      this.stashName = "stash";
      this.READ_ONLY = "readonly";
      this.READ_WRITE = "readwrite";

      indexedDB.onerror = function (error) { console.error(error); };

      var request = indexedDB.open("enduringStash", "1");

      request.onupgradeneeded = function (e) {
         self.storage = e.target.result;

         if (!self.storage.objectStoreNames.contains(self.stashName)) {
            self.storage.createObjectStore(self.stashName);
         }
      };

      request.onsuccess = function (e) {
         self.storage = e.target.result;
      };

      request.onfailure = indexedDB.onerror;
   };

   IDBStorage.prototype.getTransaction = function (mode, promise) {
      var trans = this.storage.transaction([this.stashName], mode);

      trans.onabort = function (e) { promise.reject(e); };
      trans.onerror = trans.onabort;
      trans.store = trans.objectStore(this.stashName);

      return trans;
   };


   IDBStorage.prototype.get = function (key, promise) {
      var self = this;
      var trans = this.getTransaction(this.READ_ONLY);

      trans.oncomplete = function (result) {
         console.log(result);
         promise.resolve(5);//self.unstringify(value));
      };

      trans.store.get(key);

      //openTransaction(this, transaction.READ_WRITE).then(function (options) {
      //   var values = [];
      //   options.trans.onerror = function (e) {
      //      promise.reject(e);
      //   };
      //   options.trans.oncomplete = function () {
      //      promise.resolve({
      //         key: key,
      //         value: values
      //      });
      //   };
      //   var objectStore = options.trans.objectStore(options.name);
      //   var request = objectStore.get(key);
      //   request.onsuccess = function (event) {
      //      values.push(event.target.result);
      //   };
      //}, function (e) {
      //   promise.reject(e);
      //});

   };

   IDBStorage.prototype.getAll = function (key, promise) {
      promise.resolve([]);
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         var items = [];
         options.trans.oncomplete = function (evt) {
            promise.resolve(items);
         };
         var objectStore = options.trans.objectStore(options.name);
         var request = objectStore.openCursor();
         request.onerror = function (e) {
            promise.reject(e);
         };
         request.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
               items.push(cursor.value);
               cursor["continue"]();
            }
         };
      }, function (e) {
         promise.reject(e);
      });

   };

   IDBStorage.prototype.set = function (key, value, promise) {
      promise.resolve(key);
      var trans = this.storage.transaction([this.stashName], this.READ_WRITE);

      trans.onabort = function (e) {
         promise.reject(e);
      };
      trans.onerror = trans.onabort;
      trans.oncomplete = function (result) {
         promise.resolve(value);
      };
      
      var store = trans.objectStore(this.stashName);
      store.add(this.stringify(value), key);
   };

   IDBStorage.prototype.add = function (key, value, promise) {
      promise.resolve(key);
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         options.trans.onabort = function (e) {
            promise.reject(e);
         };
         options.trans.oncomplete = function () {
            promise.resolve({
               key: key,
               value: value
            });
         };
         options.trans.objectStore(options.name).add(value, key);
      }, function (e) {
         if (e.code === 11) {
            e = {
               name: "QUOTA_EXCEEDED_ERR",
               error: e
            };
         }
         promise.reject(e);
      });

   };
   IDBStorage.prototype.update = function (key, value, promise) {
      promise.resolve(key);
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         options.trans.onabort = function (e) {
            promise.reject(e);
         };
         options.trans.oncomplete = function () {
            promise.resolve({
               key: key,
               value: value
            });
         };
         var request = options.trans.objectStore(options.name).openCursor(key);
         request.pair = {
            key: key,
            value: value
         };
         request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
               cursor.update(event.target.pair.value);
            } else {
               options.trans.abort();
            }
         };
      }, function (e) {
         promise.reject(e);
      });

   };
   IDBStorage.prototype.remove = function (key, promise) {
      promise.resolve(key);
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         options.trans.onerror = function (e) {
            promise.reject(e);
         };
         options.trans.oncomplete = function () {
            promise.resolve();
         };
         var objectStore = options.trans.objectStore(options.name);
         objectStore["delete"](key);
      }, function (e) {
         promise.reject(e);
      });

   };
   IDBStorage.prototype.contains = function (key, promise) {
      promise.resolve(key);
      openTransaction(this, transaction.READ_ONLY).then(function (options) {
         var request = options.trans.objectStore(options.name).openCursor(IDBKeyRange.prototype.only(key));
         options.trans.oncomplete = function () {
            promise.resolve(request.result !== undefined);
         };
         options.trans.onerror = function (e) {
            promise.reject(e);
         };
      }, function (e) {
         promise.reject(e);
      });

   };
   IDBStorage.prototype.removeAll = function () {
      promise.resolve();
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         options.trans.onerror = function (e) {
            promise.reject(e);
         };
         options.trans.oncomplete = function () {
            promise.resolve();
         };
         options.trans.objectStore(options.name).clear();
      }, function (e) {
         promise.reject(e);
      });

   };


   IDBStorage.prototype.close = function () {
      if (this.storage) {
         this.storage.close();
         this.storage = null;
      }
   };


   if (window.indexedDB) {
      enduring.provider.registerProvider("IndexedDB", IDBStorage);
      return IDBStorage;
   }




})();