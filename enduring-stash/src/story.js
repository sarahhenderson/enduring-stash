/*!
* story.js v0.1
*
* Copyright (c) Sela Group and Gil Fink. All rights reserved.
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* Date: Fri Apr 20 14:00:12 2012 
*/

/*
* story.js enables web developers to use client-side storages in a common and simple way. 
* It includes abstraction layer on top of Web Storage API, IndexedDB API, Cookies API and 
* In-Memory storage.
*
* Authors        Gil Fink
* Contributors   Ran Wahle
*/

define(['Q'], function (Q) {
   "use strict";

   var story = {};
   var storyKeyPrefix = "__story__", storyStorageDefaultName = "_story_";
   story.storage = function (name) {
      if (!name) {
         return story.types[story.StorageTypes.IN_MEMORY];
      }
      return story.types[name];
   };
   story.types = [];
   story.StorageTypes = {
      LOCAL_STORAGE: "LocalStorage",
      SESSION_STORAGE: "SessionStorage",
      INDEXEDDB: "IndexedDB",
      COOKIE: "Cookie",
      IN_MEMORY: "InMemroy"
   };
   var registerType = function (name, type) {
      story.types[name] = type;
   };
   var createStoreKey = function (key) {
      return storyKeyPrefix + key;
   };
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






   var Promise = (function () {
      function Promise() {
         this.thens = [];
      }
      Promise.prototype.then = function (onResolve, onReject) {
         this.thens.push({
            resolve: onResolve,
            reject: onReject
         });
      };
      Promise.prototype.resolve = function (value) {
         if (typeof value === "undefined") { value = undefined; }
         this.complete('resolve', value);
      };
      Promise.prototype.reject = function (error) {
         if (typeof error === "undefined") { error = undefined; }
         this.complete('reject', error);
      };
      Promise.prototype.complete = function (which, arg) {
         if (which === 'resolve') {
            this.then = function (resolve, reject) {
               resolve(arg);
            };
         } else {
            this.then = function (resolve, reject) {
               reject(arg);
            };
         }
         this.resolve = this.reject = function () {
            throw new Error('Promise already completed.');
         };
         var i = 0, aThen = this.thens[i];
         while (aThen) {
            aThen[which] && aThen[which](arg);
            i += 1;
            aThen = this.thens[i];
         }
         delete this.thens;
      };
      return Promise;
   })();



   story.Promise = Promise;




   function promiseWrap(storyStorage, impl) {
      //var promise = new story.Promise();
      var deferred = Q.defer();
      impl(storyStorage, deferred);
      return deferred.promise;
   }

   // Returns whether a constructor is the constructor of a value
   var isType = function(Ctor, val) {
      return val !== undefined && val !== null && val.constructor === Ctor;
   }

   // Returns a safely quoted string
   var quoteStr = function(str) {
      return "'" +
		String(str)
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t') +
		"'";
   }

   // Return an element from HTML
   var elementFromHtml = function(html) {
      var container = doc.createElement('_');
      container.innerHTML = html;
      return container.firstChild;
   }

   // Return HTML from an element
   var HtmlFromElement = function(el) {
      if (el.outerHTML) return el.outerHTML;
      var container = doc.createElement('_');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML;
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
         console.log('[' + values.join(',') + ']');
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
//			val === undefined ||
//			val === null ||
			isType(RegExp, val)
       ) return String(val);
      return JSON.stringify(val);
      //var callee = arguments.callee, valArr = [], valLen, i = -1, e;
      // string
      if (isType(String, val)) return quoteStr(val);
      // boolean, function, number, regexp, undefined, null
      if (
			val === undefined ||
			val === null ||
			isType(Boolean, val) ||
			isType(Number, val) ||
			isType(RegExp, val) ||
			(isType(Function, val) && !/^function[^\{]+\{\s*\[native code\]/.test(String(val)))
		) return String(val);
      // date
      // array
      // object
      if (isType(Object, val)) {
         var values = [];         
         for (var property in val) values.push(quoteStr(property) + ':' + val[property]);
         return '{' + values + '}';
      }
      return JSON.stringify(val);
   }

   // Returns a JavaScript version of a string
   var unstringify = function(str) {
      return new Function('return ' + str).apply();
   }





   var WebStorage = (function () {
      function WebStorage(type) {
         if (type === "session") {
            this.storage = window.sessionStorage;
         } else {
            this.storage = window.localStorage;
         }
      }
      WebStorage.prototype.get = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               var item = storyStorage.storage.getItem(createStoreKey(key));
               if (item !== null && item !== "undefined") {
                  item = unstringify(item);
               } else {
                  item = undefined;
               }
               promise.resolve(item);
            } catch (e) {
               promise.reject(e);
            }
         });
      };
      WebStorage.prototype.getAll = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               var items = [];
               var len = storyStorage.storage.length;
               for (var i = 0; i < len; i += 1) {
                  var key = storyStorage.storage.key(i);
                  var item = unstringify(storyStorage.storage.getItem(key));
                  items.push(item);
               }
               promise.resolve(items);
            } catch (e) {
               promise.reject(e);
            }
         });
      };
      WebStorage.prototype.set = function (key, value) {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               storyStorage.storage.setItem(createStoreKey(key), stringify(value));
               promise.resolve({
                  key: key,
                  value: value
               });
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
         });
      };
      WebStorage.prototype.update = function (key, value) {
         return this.set(key, value);
      };
      WebStorage.prototype.add = function (key, value) {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               var item = storyStorage.storage.getItem(createStoreKey(key));
               if (item !== null) {
                  promise.reject("Item with key " + key + " already exists");
               } else {
                  promise.resolve(storyStorage.set(key, value));
               }
            } catch (e) { 
               promise.reject(e);
            }
         });
      };
      WebStorage.prototype.remove = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               storyStorage.storage.removeItem(createStoreKey(key));
               promise.resolve();
            } catch (e) {
               promise.reject(e);
            }
         });
      };
      WebStorage.prototype.contains = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               var item = storyStorage.storage.getItem(createStoreKey(key));
               promise.resolve(item !== null);
            } catch (e) {
               promise.reject(e);
            }
         });
      };
      WebStorage.prototype.clear = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            try {
               storyStorage.storage.clear();
               promise.resolve();
            } catch (e) {
               promise.reject(e);
            }
         });
      };
      return WebStorage;
   })();
   if (window.localStorage) {
      registerType(story.StorageTypes.LOCAL_STORAGE, new WebStorage("local"));
   }
   if (window.sessionStorage) {
      registerType(story.StorageTypes.SESSION_STORAGE, new WebStorage("session"));
   }
   var indexeddb = window.indexedDB || window.msIndexedDB;
   var transaction = {
      READ_ONLY: "readonly",
      READ_WRITE: "readwrite"
   };
   var openTransaction = function (store, mode) {
      var promise = new story.Promise();
      var name = store.name;
      var db = store.storage;
      if (db) {
         promise.resolve({
            trans: db.transaction(name, mode),
            name: name
         });
      } else {
         var request = db.open(storyStorageDefaultName + name);
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
      return promise;
   };
   var IDBStorage = (function () {
      function IDBStorage() { }
      IDBStorage.prototype.createStore = function (options) {
         var promise = new story.Promise();
         var name = options.name;
         var store = new IDBStorage();
         var request = indexeddb.open(name || storyStorageDefaultName, options.version || 1);
         request.onsuccess = function (e) {
            store.storage = request.result;
            promise.resolve(store);
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
         return promise;
      };
      IDBStorage.prototype.get = function (key) {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.getAll = function () {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.add = function (key, value) {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.update = function (key, value) {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.remove = function (key) {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.contains = function (key) {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.clear = function () {
         var promise = new story.Promise();
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
         return promise;
      };
      IDBStorage.prototype.close = function () {
         if (this.storage) {
            this.storage.close();
            this.storage = null;
         }
      };
      return IDBStorage;
   })();
   if (indexeddb) {
      registerType(story.StorageTypes.INDEXEDDB, new IDBStorage());
   }
   var Cookie = (function () {
      function Cookie() { }
      Cookie.prototype.get = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            if (match) {
               promise.resolve(decodeURIComponent(match[2]));
            } else {
               promise.reject({
                  message: "Cookie doesn't exists"
               });
            }
         });
      };
      Cookie.prototype.getAll = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            var pairs = document.cookie.split(';');
            var len = pairs.length;
            var cookies = [];
            for (var i = 0; i < len; i++) {
               var pair = pairs[i].split('=');
               if (pair[0] !== "") {
                  cookies.push({
                     key: pair[0],
                     value: encodeURIComponent(pair[1])
                  });
               }
            }
            promise.resolve(cookies);
         });
      };
      Cookie.prototype.add = function (key, value) {
         return promiseWrap(this, function (storyStorage, promise) {
            var cookieStr = key + "=" + encodeURIComponent(value);
            document.cookie = cookieStr;
            promise.resolve({
               key: key,
               cookieString: cookieStr
            });
         });
      };
      Cookie.prototype.update = function (key, value) {
         return this.add(key, value);
      };
      Cookie.prototype.remove = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            var expiry = new Date();
            expiry.setTime(expiry.getTime() - 1);
            document.cookie = key += "=; expires=" + expiry.toUTCString();
            promise.resolve();
         });
      };
      Cookie.prototype.contains = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            match ? promise.resolve(true) : promise.resolve(false);
         });
      };
      Cookie.prototype.clear = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            document.cookie = "";
            promise.resolve();
         });
      };
      return Cookie;
   })();
   registerType(story.StorageTypes.COOKIE, new Cookie());










   var MemoryStorage = (function () {
      function MemoryStorage() {
         this.storage = {
         };
      }
      MemoryStorage.prototype.validateKey = function (key) {
         if (key instanceof Array || key === null || key === undefined) {
            return false;
         }
         return true;
      };
      MemoryStorage.prototype.get = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            if ((storyStorage).validateKey(key)) {
               promise.resolve(storyStorage.storage[key]);
            } else {
               promise.reject("Invalid Key");
            }
         });
      };
      MemoryStorage.prototype.getAll = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            var items = [];
            for (var property in storyStorage.storage) {
               if (storyStorage.storage.hasOwnProperty(property)) {
                  items.push({
                     key: property,
                     value: storyStorage.storage[property]
                  });
               }
            }
            promise.resolve(items);
         });
      };
      MemoryStorage.prototype.add = function (key, value) {
         return promiseWrap(this, function (storyStorage, promise) {
            if ((storyStorage).validateKey(key)) {
               if (!storyStorage.storage.hasOwnProperty(key)) {
                  storyStorage.storage[key] = value;
                  promise.resolve({
                     key: key,
                     value: value
                  });
               } else {
                  promise.reject({
                     message: "key already exists",
                     key: key
                  });
               }
            }
         });
      };
      MemoryStorage.prototype.update = function (key, value) {
         return promiseWrap(this, function (storyStorage, promise) {
            if ((storyStorage).validateKey(key)) {
               if (storyStorage.storage.hasOwnProperty(key)) {
                  storyStorage.storage[key] = value;
                  promise.resolve({
                     key: key,
                     value: value
                  });
               }
            }
         });
      };
      MemoryStorage.prototype.remove = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            if ((storyStorage).validateKey(key)) {
               if (storyStorage.storage.hasOwnProperty(key)) {
                  delete storyStorage.storage[key];
               }
               promise.resolve();
            }
         });
      };
      MemoryStorage.prototype.contains = function (key) {
         return promiseWrap(this, function (storyStorage, promise) {
            promise.resolve(storyStorage.storage.hasOwnProperty(key));
         });
      };
      MemoryStorage.prototype.clear = function () {
         return promiseWrap(this, function (storyStorage, promise) {
            storyStorage.storage = {
            };
            promise.resolve();
         });
      };
      return MemoryStorage;
   })();
   registerType(story.StorageTypes.IN_MEMORY, new MemoryStorage());
   for (var prop in story.types) {
      if (story.types.hasOwnProperty(prop)) {
         story.types[prop].query = new Query();
      }
   }
   return story;
});