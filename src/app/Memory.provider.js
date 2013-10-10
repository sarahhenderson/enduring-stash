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