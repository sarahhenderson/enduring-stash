
(function () {
   "use strict";

   var enduring = window.enduring || undefined;
   if (!enduring) {
      throw "Enduring Stash: Enduring Stash is missing!";
   }


/*   var defaultDBName = "_stash_idb_";
   var indexeddb = window.indexedDB || window.msIndexedDB;
   var transaction = {
      READ_ONLY: "readonly",
      READ_WRITE: "readwrite"
   };

   var openTransaction = function (store, mode) {
      
      var name = store.name;
      var db = store.storage;
      if (db) {
         promise.resolve({
            trans: db.transaction(name, mode),
            name: name
         });
      } else {
         var request = db.open(defaultDBName + name);
         request.onsuccess = function (e) {
            store.storage = e.target.result;
            promise.resolve({
               trans: db.transaction(name, mode),
               name: name
            });
         };
         request.onerror = function (e) {
            promise.reject(e);
         };
      }
      
   };


   var IDBStorage = (function () {   
      var name = '_stashdb_';
      var storage = null;
//      var store = new IDBStorage();
      var request = indexeddb.open(name, 1);
      request.onsuccess = function (e) {
         storage = request.result;
         promise.resolve(this);
      };
      request.onerror = function (e) {
         promise.reject("IndexedDB error: " + e.message);
      };
      request.onupgradeneeded = function (e) {
         var objectStore = request.result.createObjectStore(name, {
            keyPath: options.keyPath,
            autoIncrement: options.autoInc
         });
         for (var len = options.names.length, i = 0; i < len; i += 1) {
            objectStore.createIndex(options.names[i], options.values[i], {
               unique: options.unique[i]
            });
         }
      };
      
   });


   IDBStorage.prototype.get = function (key, promise) {
      
      openTransaction(this, transaction.READ_WRITE).then(function (options) {
         var values = [];
         options.trans.onerror = function (e) {
            promise.reject(e);
         };
         options.trans.oncomplete = function () {
            promise.resolve({
               key: key,
               value: values
            });
         };
         var objectStore = options.trans.objectStore(options.name);
         var request = objectStore.get(key);
         request.onsuccess = function (event) {
            values.push(event.target.result);
         };
      }, function (e) {
         promise.reject(e);
      });
      
   };
   IDBStorage.prototype.getAll = function (key, promise) {
      
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
   IDBStorage.prototype.add = function (key, value, promise) {

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



   if (indexeddb) {
      enduring.provider.registerProvider("IndexedDB", IDBStorage);
   }


   return IDBStorage;
   */

})();