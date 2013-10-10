define(['enduring'], function (enduring) {
   "use strict";

   var Cookie = function () {

   };

   Cookie.prototype.get = function (key, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (match) {
         promise.resolve(this.unstringify(decodeURIComponent(match[2])));
      } else {
         promise.resolve(undefined);
      }

   };
   Cookie.prototype.getAll = function (key, promise) {

      var pairs = document.cookie.split(';');
      var len = pairs.length;
      var cookies = [];
      for (var i = 0; i < len; i++) {
         var pair = pairs[i].split('=');
         
         var itemKey = pair[0].trim();
         if (itemKey !== "" && itemKey.substring(0, key.length) === key) {
            cookies.push(
               this.unstringify(decodeURIComponent(pair[1]))
            );
         }
      }
      promise.resolve(cookies);

   };

   Cookie.prototype.set = function (key, value, promise) {

      var cookieStr = key + "=" + encodeURIComponent(this.stringify(value));
      document.cookie = cookieStr;
      promise.resolve(value);

   };

   Cookie.prototype.add = function (key, value, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (!match) {
         return this.set(key, value, promise);
      } else {
         promise.reject("Item already exists");
      }
   };
   Cookie.prototype.update = function (key, value, promise) {
      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (match) {
         return this.set(key, value, promise);
      } else {
         promise.reject("Item does not exist");
      }
   };

   Cookie.prototype.remove = function (key, promise) {

      var expiry = new Date();
      expiry.setTime(expiry.getTime() - 1);
      document.cookie = key += "=; expires=" + expiry.toUTCString();
      promise.resolve();

   };
   Cookie.prototype.contains = function (key, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      match ? promise.resolve(true) : promise.resolve(false);

   };
   Cookie.prototype.removeAll = function (promise) {

      try{
         var pairs = document.cookie.split(';');
         var len = pairs.length;
         var cookies = [];
         for (var i = 0; i < len; i++) {
            var pair = pairs[i].split('=');
            var expiry = new Date();
            expiry.setTime(expiry.getTime() - 1);
            document.cookie = pair[0] += "=; expires=" + expiry.toUTCString();
         }
         promise.resolve();
      } catch (e) {
         promise.reject(e);
      }
   };

   enduring.provider.registerProvider("Cookie", Cookie);

   return Cookie;


});
define(['enduring'], function (enduring) {
   "use strict";

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
});
define(['enduring'], function (enduring) {
   "use strict";

   var MemoryStorage = function () {
      this.storage = {};
   };

   MemoryStorage.prototype.get = function (key, promise) {
      promise.resolve(this.storage[key]);
   };

   MemoryStorage.prototype.getAll = function (key, promise) {

      var items = [];
      for (var itemKey in this.storage) {
         if (this.storage.hasOwnProperty(itemKey)
            && itemKey.substring(0, key.length) === key) {
            items.push(this.storage[itemKey]);
         }
      }
      promise.resolve(items);

   };

   MemoryStorage.prototype.set = function (key, value, promise) {

      this.storage[key] = value;
      promise.resolve(value);
   };

   MemoryStorage.prototype.add = function (key, value, promise) {

      if (!this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item already exists");
      }

   };

   MemoryStorage.prototype.update = function (key, value, promise) {

      if (this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item does not exist");
      }

   };


   MemoryStorage.prototype.remove = function (key, promise) {

      if (this.storage.hasOwnProperty(key)) {
         delete this.storage[key];
      }
      promise.resolve();


   };
   MemoryStorage.prototype.contains = function (key, promise) {

      promise.resolve(this.storage.hasOwnProperty(key));

   };
   MemoryStorage.prototype.removeAll = function (promise) {

      this.storage = {};
      promise.resolve();

   };

   enduring.provider.registerProvider("Memory", MemoryStorage);

   return MemoryStorage;


});
define(function () {
   "use strict";

   var Query = (function () {
      function Query() {
         this.items = [];
      }
      Query.prototype.from = function (source) {
         this.items = source;
         return this;
      };
      Query.prototype.select = function (projection) {
         var len = this.items.length;
         for (var i = 0; i < len; i += 1) {
            this.items[i] = projection(this.items[i]);
         }
         return this;
      };
      Query.prototype.forEach = function (action) {
         var len = this.items.length;
         for (var i = 0; i < len; i += 1) {
            action(this.items[i]);
         }
         return this;
      };
      Query.prototype.where = function (predicate) {
         var filteredArray = [];
         var len = this.items.length;
         for (var i = 0; i < len; i += 1) {
            if (predicate(this.items[i])) {
               filteredArray[filteredArray.length] = this.items[i];
            }
         }
         this.items = filteredArray;
         return this;
      };
      Query.prototype.first = function () {
         var fst = this.firstOrDefault();
         if (fst !== null) {
            throw new Error("Query is empty");
         } else {
            return fst;
         }
      };
      Query.prototype.firstOrDefault = function () {
         if (this.items.length > 0) {
            return this.items[0];
         } else {
            return null;
         }
      };
      Query.prototype.last = function () {
         var lst = this.lastOrDefault();
         if (!lst) {
            throw new Error("Query is empty");
         } else {
            return lst;
         }
      };
      Query.prototype.lastOrDefault = function () {
         if (this.items.length > 0) {
            return this.items[this.items.length - 1];
         } else {
            return null;
         }
      };
      Query.prototype.contains = function (item) {
         var len = this.items.length;
         for (var i = 0; i < len; i += 0) {
            if (item === this.items[i].value) {
               return true;
            }
         }
         return false;
      };
      Query.prototype.skip = function (count) {
         return this.items.slice(count);
      };
      Query.prototype.take = function (count) {
         return this.items.slice(0, count);
      };
      Query.prototype.orderBy = function (sortFunc) {
         this.items.sort(sortFunc);
         return this;
      };
      Query.prototype.reverse = function () {
         this.items.reverse();
         return this;
      };
      Query.prototype.elementAt = function (index) {
         return this.items[index];
      };
      Query.prototype.toArray = function () {
         var result = [];
         var len = this.items.length;
         for (var i = 0; i < len; i += 1) {
            result.push(this.items[i]);
         }
         return result;
      };
      Query.prototype.count = function () {
         return this.items.length;
      };
      return Query;
   })();
   story.Query = Query;

   for (var prop in story.types) {
      if (story.types.hasOwnProperty(prop)) {
         story.types[prop].query = new Query();
      }
   }



});
define(['Q'], function (Q) {
   "use strict";

   var Stash = function (name, provider) {

      if (!provider) {
         throw "Cannot create a stash without a provider";
      }

      // establish keyPrefix for this collection
      var keyPrefix = "_stash_";
      keyPrefix += name ? name + "_" : "";
      keyPrefix = keyPrefix.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      // creates a key unique to the collection and this application
      var createStoreKey = function (key) {
         if (key instanceof Array || key === null || key === undefined) {
            throw "Invalid key: " + key;
         }
         return keyPrefix + key;
      };


      // wraps each provider method in a promise
      var promiseWrap = function (callback) {
         var deferred = Q.defer();
         callback(deferred);
         return deferred.promise;
      }


      // individual methods
      var get = function (key) {
         return promiseWrap(function (promise) {
            provider.get(createStoreKey(key), promise);
         });
      };

      var set = function (key, value) {
         return promiseWrap(function (promise) {
            provider.set(createStoreKey(key), value, promise);
         });
      };

      var getAll = function () {
         return promiseWrap(function (promise) {
            provider.getAll(keyPrefix, promise);
         });
      };
      var update = function (key, value) {
         return promiseWrap(function (promise) {
            provider.update(createStoreKey(key), value, promise);
         });
      };
      var add = function (key, value) {
         return promiseWrap(function (promise) {
            provider.add(createStoreKey(key), value, promise);
         });
      };
      var remove = function (key) {
         return promiseWrap(function (promise) {
            provider.remove(createStoreKey(key), promise);
         });
      };
      var contains = function (key) {
         return promiseWrap(function (promise) {
            provider.contains(createStoreKey(key), promise);
         });
      };
      var removeAll = function () {
         return promiseWrap(function (promise) {
            provider.removeAll(promise);
         });
      };
   

      return {
         get: get,
         getAll: getAll,
         set: set,
         add: add,
         update: update,
         contains: contains,
         remove: remove,
         removeAll: removeAll
      };

   }
   return Stash;
});
define(['enduring'], function (enduring) {
   "use strict";

   var WebSQLStorage = function () {
      this.storage = {};
   };

   WebSQLStorage.prototype.get = function (key, promise) {
      promise.resolve(this.storage[key]);
   };

   WebSQLStorage.prototype.getAll = function (key, promise) {

      var items = [];
      for (var itemKey in this.storage) {
         if (this.storage.hasOwnProperty(itemKey)
            && itemKey.substring(0, key.length) === key) {
            items.push(this.storage[itemKey]);
         }
      }
      promise.resolve(items);

   };

   WebSQLStorage.prototype.set = function (key, value, promise) {

      this.storage[key] = value;
      promise.resolve(value);
   };

   WebSQLStorage.prototype.add = function (key, value, promise) {

      if (!this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item already exists");
      }

   };

   WebSQLStorage.prototype.update = function (key, value, promise) {

      if (this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item does not exist");
      }

   };


   WebSQLStorage.prototype.remove = function (key, promise) {

      if (this.storage.hasOwnProperty(key)) {
         delete this.storage[key];
      }
      promise.resolve();


   };
   WebSQLStorage.prototype.contains = function (key, promise) {

      promise.resolve(this.storage.hasOwnProperty(key));

   };
   WebSQLStorage.prototype.removeAll = function (promise) {

      this.storage = {};
      promise.resolve();

   };

   enduring.provider.registerProvider("WebSQL", WebSQLStorage);

   return WebSQLStorage;


});
define(['enduring'], function (enduring) {
   "use strict";

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
      return SessionStorage;

   }

});
/*!
* Stash.js
* (c) Sarah Henderson 2013
*/

define(['Stash', 'enduring.provider'], function (Stash, enduring.provider) {
   "use strict";

   var createStash = function (collection, providerName) {

      // Stash requires json 
      if (!JSON) throw 'Enduring Stash: JSON unavailable! Include http://www.json.org/json2.js to fix.'

      if (!enduring.provider.hasProvider()) {
         throw 'Enduring Stash: No storage providers available! Include at least one provider.';
      }

      if (providerName) {
         var provider = enduring.provider.forceProvider(providerName);
         if (!provider) {
            throw "Cannot force use of " + providerName + " provider - it is not available";
         }
      } else {
         var provider = enduring.provider.getProvider();
      }

      var stash = new Stash(collection, provider);
      return stash; 
   }


   var stashOf = function (collection, providerName) {
      return createStash(collection, providerName);
   };


   var stash = function () {
      return createStash('');
   };



   return {
      stash: stash,
      stashOf: stashOf
   }
});
define(function () {
   "use strict";

   var providers = [];
   var namedProviders = {};

   // Allows providers to register themselves if their storage method is supported
   // parameters: name and constructor function for the provider
   var registerProvider = function (name, Provider) {
   
      if (providerIsValid(name, Provider)) {
         // add necessary prototype methods to the provider
         Provider.prototype.stringify = stringify;
         Provider.prototype.unstringify = unstringify;
         Provider.prototype.isType = isType;
         Provider.prototype.quoteStr = quoteStr;
      
         providers.push(Provider);
         namedProviders[name] = Provider;
      }
   };

   var providerIsValid = function(name, Provider) {
      
      var methods = 'get getAll set add update contains remove removeAll'.split(' ');
      var providerInstance = new Provider();

      for (var i = 0; i < methods.length; i++) {
         var method = methods[i];

         if (!providerInstance[method]) {
            if (console && console.error) {
               console.error("Enduring Stash: Invalid provider! " + name + " provider is missing method " + method);
            }
            return false;
         }
      }
      return true;
   }
   

      // Returns whether there are any supported providers
      var hasProvider = function () {
         return providers.length > 0;
      }

      // Returns the first provider that registered that it works
      var getProvider = function () {
         if (hasProvider()) {
            var Provider = providers[0];
            return new Provider();
         } else {
            return undefined;
         }
      }

      // Returns a specific provider when multiple are available
      // Mostly for testing
      var forceProvider = function (name) {
         var Provider = namedProviders[name] || undefined;
         if (Provider) {
            return new Provider();
         } else {
            return null;
         }
      }


      // Returns whether a constructor is the constructor of a value
      var isType = function (Ctor, val) {
         return val !== undefined && val !== null && val.constructor === Ctor;
      }

      // Returns a safely quoted string
      var quoteStr = function (str) {
         return "'" +
         String(str)
         .replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(/\n/g, '\\n')
         .replace(/\r/g, '\\r')
         .replace(/\t/g, '\\t') +
         "'";
      }


      // Returns a string version of JavaScript
      var stringify = function (val) {

         if (isType(Date, val)) {
            return 'new Date(' + val.getTime() + ')';
         }

         if (isType(Array, val)) {
            var values = [];
            for (var i = 0; i < val.length; i++) {
               values.push(stringify(val[i]));
            }
            return '[' + values.join(',') + ']';
         }

         if (isType(Object, val)) {
            var values = [];
            for (var property in val) {
               values.push(quoteStr(property) + ':' + stringify(val[property]));
            }
            return '{' + values.join(',') + '}';
         }

         if (
            isType(RegExp, val)
          ) return String(val);

         return JSON.stringify(val);
      }

      // Returns a JavaScript version of a string
      var unstringify = function (str) {
         return new Function('return ' + str).apply();
      }

      return {
         hasProvider: hasProvider,
         getProvider: getProvider,
         forceProvider: forceProvider,
         registerProvider: registerProvider
      }


   });