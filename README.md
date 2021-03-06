enduring-stash
==============

Simple client-side persistence with a lightweight, promise-based API and multiple storage providers.

**Don't use this**

I wrote this before I knew about [local-forage](https://github.com/mozilla/localForage).  Use it instead.

Currently supported storage providers are:

* LocalStorage
* IndexedDB
* WebSQL
* Cookies
* Memory

Just include the storage providers you'd like to use (in order of preference), and Enduring Stash will automatically use the first one that is supported on the client device.

## Getting Started

1. Include a promise framework. Currently Q and jQuery are supported (I recommend Q).
1. Include enduring-stash.js
1. Include the storage providers you want to use.  Enduring Stash will select the first supported provider it finds, so the order matters.

```html
<script src="q.min.js"></script>
<script src="enduring-stash.min.js"></script>
<script src="WebStorage.provider.js"></script>
````
    
## Create a new Enduring Stash:

```javascript
var settings = new enduring.stash();
```

Or, create a new named Enduring Stash:

```javascript
var people = new enduring.stashOf('people');
```

## API

To try these samples in your browser, visit the demo site: http://sarahhenderson.github.io/enduring-stash/

#### Set a value

Set adds a value if it doesn't exist, updates it if it does

```javascript
settings.set("Username", username);
var person = { name: "Pat Lee", id: "PL001" };
people.set(person.id, person);
```

#### Get a value

Get returns a promise. When the promise is resolved, the value is provided as parameter to the success callback. If the value doesn't exist, the promise will be resolved, but the value will be undefined. The promise will only be rejected if some error condition occurred.

```javascript
settings.get(key)
.then(function (value) {
	alert(value);
});
people.get("PL001")
.then(function (person) {
	alert("Hello " + person.name);
});
```
   
#### Add a value

Adds a value if it doesn't exist. It returns a promise so you can check the returned value to see whether the add succeeded. If it succeeded, the promise resolves with the value returned as data. If an item with the same key already exists, the promise is rejected.

```javascript
settings.add("FavouriteColour", "blue");
```


#### Update a value

Update a value if it already exists. It returns a promise, so you can check the return value to see whether the update succeeded. If it succeeded, the promise resolves with the value returned as data. If the item doesn't exist in the store, the promise is rejected.

```javascript
settings.update("YearsOfExperience", 2);
```

#### Contains

Returns true or false indicating whether an item with that key exists or not.

```javascript
settings.contains("FavouriteColour")
.then(function(itemExists) {
	if (itemExists) {
		// something
	} else {
		// something else
	}
});
```

#### GetAll

Returns an array of ALL values in the stash. Well, technically it doesn't 'return' it. The array of values is available as a parameter in the success callback. .

```javascript
settings.getAll()
.then(function (result) {
	// result is an array of values
});
```

#### Remove

Removes an item from the stash.

```javascript
settings.remove("FavouriteNumber")
.then(function(){
	// optional action
});
```

#### RemoveAll

Clears out everything in the stash.

```javascript
settings.removeAll();
.then(function(){
	// optional action
});
```

## Licence

This project is open source, licenced under GPL v2.

## Author

This project is maintained by [Sarah Henderson](http://sarahhenderson.info).
