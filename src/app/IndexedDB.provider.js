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

      var defer = Q ? Q.defer() : $.Deferred();
      this.stashName = "stash";
      this.READ_ONLY = "readonly";
      this.READ_WRITE = "readwrite";


      indexedDB.onerror = function (error) { defer.reject(); console.error(error); };

      var request = indexedDB.open("enduringStash", "1");

      request.onupgradeneeded = function (e) {
         self.storage = e.target.result;

         if (!self.storage.objectStoreNames.contains(self.stashName)) {
            self.storage.createObjectStore(self.stashName);
         }
         defer.resolve();
      };

      request.onsuccess = function (e) {
         self.storage = e.target.result;
         defer.resolve();
      };

      request.onfailure = indexedDB.onerror;

      this.ready = Q ? defer.promise : defer.promise();
   };

   IDBStorage.prototype.getTransaction = function (mode, promise) {
      var self = this;
      var defer = Q ? Q.defer() : $.Deferred();
      this.ready.then(function () {
         var trans = self.storage.transaction([self.stashName], mode);

         trans.onabort = function (e) { promise.reject(e); };
         trans.onerror = trans.onabort;
         trans.store = trans.objectStore(self.stashName);
         defer.resolve(trans);
      });
      return Q ? defer.promise : defer.promise();
   };



   IDBStorage.prototype.get = function (key, promise) {
      var self = this;
      this.getTransaction(this.READ_ONLY, promise).then(function (trans) {
         var request = trans.store.get(key);

         request.onerror = function (event) {
            promise.reject(request.error);
         };

         request.onsuccess = function (event) {
            promise.resolve(self.unstringify(request.result));
         };
      });
   };

   IDBStorage.prototype.getAll = function (keyPrefix, promise) {
      var self = this;
      var items = [];
      this.getTransaction(this.READ_WRITE, promise).then(function (trans) {

         var request = trans.store.openCursor();
         request.onerror = function (event) {
            promise.reject(request.error);
         };

         request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
               var key = cursor.key;
               if (key.substring(0, keyPrefix.length) === keyPrefix) {
                  var value = self.unstringify(cursor.value)
                  items.push(value);
               }
               cursor.continue();
            } else {
               promise.resolve(items);
            }
         };
      });
   };

   IDBStorage.prototype.set = function (key, value, promise) {
      var self = this;
      this.getTransaction(self.READ_WRITE, promise).then(function (trans) {
         var request = trans.store.put(self.stringify(value), key);

         request.onerror = function (event) {
            promise.reject(request.error);
         };

         request.onsuccess = function (event) {
            promise.resolve(value);
         };
      });
   };

   IDBStorage.prototype.add = function (key, value, promise) {
      var self = this;
      this.getTransaction(self.READ_WRITE, promise).then(function (trans) {
         var request = trans.store.add(self.stringify(value), key);
         request.onerror = function (event) {
            promise.reject(request.error);
         };
         request.onsuccess = function (event) {
            promise.resolve(value);
         };
      });
   };

   // IDB put will create items that don't exist.  We don't want that, so we have to 
   // check first whether the item exists and only create it if it doesn't
   IDBStorage.prototype.update = function (key, value, promise) {
      var self = this;
      var defer = Q ? Q.defer() : $.Deferred();
      self.contains(key, defer);
      var checkedIfExists = Q ? defer.promise : defer.promise();

      checkedIfExists.then(function (contains) {
         if (!contains) {
            promise.reject("Item does not exist");
         } else {
            self.getTransaction(self.READ_WRITE, promise).then(function (trans) {
               var request = trans.store.put(self.stringify(value), key);
               request.onerror = function (event) {
                  promise.reject(request.error);
               };
               request.onsuccess = function (event) {
                  promise.resolve(value);
               };
            });
         }
      });
   };

   IDBStorage.prototype.remove = function (key, promise) {
      var self = this;
      self.getTransaction(self.READ_WRITE, promise).then(function (trans) {
         var request = trans.store.delete(key);
         request.onerror = function (event) {
            promise.reject(request.error);
         };
         request.onsuccess = function (event) {
            promise.resolve();
         };
      });
   };

   IDBStorage.prototype.contains = function (key, promise) {
      var self = this;
      self.getTransaction(self.READ_ONLY, promise).then(function (trans) {
         var request = trans.store.get(key);

         request.onerror = function (event) {
            promise.reject(request.error);
         };

         request.onsuccess = function (event) {
            promise.resolve(!!request.result);
         };
      });
   };

   IDBStorage.prototype.removeAll = function (promise) {
      var self = this;
      self.getTransaction(self.READ_WRITE, promise).then(function (trans) {

         var request = trans.store.clear();

         request.onerror = function (event) {
            promise.reject(request.error);
         };

         request.onsuccess = function (event) {
            promise.resolve();
         };

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