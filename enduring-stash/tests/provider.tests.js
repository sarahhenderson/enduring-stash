"use strict";
define(
    ['QUnit', 'QPromises', 'enduring'],
    function (QUnit, QPromises, enduring) {

       var stash = null;
       var provider = '';

       var run = function (name, providerName) {
 
          module(name);

          stash = enduring.stashOf(name, providerName);
          provider = providerName;

          test("enduring stash can be created using " + name, function () {
             ok(stash);
          });

          runDataTypeTests();
          runAccessTests();
          runCollectionTests();
       }

       var runCollectionTests = function () {

          var peopleStash = enduring.stashOf('people', provider);
          var carStash = enduring.stashOf('cars', provider);

          test("enduring stash with named collection can be created using Local Storage", function (assert) {
             ok(peopleStash);
          });

          test("enduring stash doesn't retrieve items added to a different stash", function (assert) {

             var expected = { key: 'val', value: 3.14 };

             assert.willDeepEqual(
                carStash.set('val', expected.value),
                expected.value, 'value set in base stash');

             assert.willEqual(
               peopleStash.contains(expected.key),
               false, 'is not available in the named stash');

             assert.willDeepEqual(
               peopleStash.get(expected.key),
               undefined, 'and cannot be retrieved');

             assert.willEqual(
               carStash.contains(expected.key),
               true, 'but is available in the base stash');

             assert.willDeepEqual(
               carStash.get(expected.key),
               expected.value, 'and can be retrieved');


          });


          test("enduring stash doesn't retrieve items added to a different stash", function (assert) {

             var now = new Date().getTime();
             var expected1 = { key: 'val' + now+Math.random(), value: 11 };
             var expected2 = { key: 'val' + now + Math.random(), value: 22 };
             var expected3 = { key: 'val' + now + Math.random(), value: 33 };
   
             assert.will(
             carStash.removeAll(),
             'stash is initially empty');

             assert.willDeepEqual(
                carStash.set(expected1.key, expected1.value),
                expected1.value, 'add one item to the stash');

             assert.willDeepEqual(
                carStash.set(expected2.key, expected2.value),
                expected2.value, 'and then another');

             assert.willDeepEqual(
                peopleStash.set(expected3.key, expected3.value),
               expected3.value, 'add one item a different stash');

             assert.will(
               carStash.getAll(),
               'and we should return just the items added to the first stash',
               function (value) {
                  assert.equal(value.length, 2, 'array contains correct number of items');
                  assert.ok(value.indexOf(expected1.value) > -1, 'first item is present');
                  assert.ok(value.indexOf(expected2.value) > -1, 'second item is present');
                  assert.ok(value.indexOf(expected3.value) == -1, 'third item is not');
               });
  
             assert.willEqual(
               carStash.contains(expected3.key),
               false, 'and the third item is not in our stash');


          });


       }

       var runAccessTests = function () {

          test("enduring stash 'set' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             assert.willDeepEqual(
                stash.set(expected.key, expected.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  ok(!isNaN(value), 'returns number');
               });
          });


          test("enduring stash 'set' updates a value if it already exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = expected;
             expected2.value = 5;

             assert.willDeepEqual(
                stash.set(expected.key, expected.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
                stash.set(expected.key, expected2.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected2.value, 'get promise resolved',
               function (value) {
                  ok(!isNaN(value), 'returns number');
                  assert.equal(value, 5);
               });
          });

          test("enduring stash 'get' promise is resolved with undefined if no value exists", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: undefined };
             assert.willEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved'
              );
          });

          test("enduring stash 'getAll' promise is resolved with array of items", function (assert) {

             assert.will(
               stash.removeAll(),
               'start by clearing everything');

             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 5 };
             var expectedArray = [];
             var promises = [];
             for (var i = 0; i < 10; i++) {
                expectedArray.push(expected.value + i);
                promises.push(stash.set(expected.key + i, expected.value + i));
             }

             assert.willDeepEqual(
               stash.getAll(),
               expectedArray, 'getAll promise resolved',
               function (value) {
                  assert.equal(10, value.length, 'correct number of items returned');
                  assert.deepEqual(expectedArray, value);
               }
              );
          });

          test("enduring stash 'getAll' promise is resolved with an empty array if no values exists", function (assert) {

             assert.will(
               stash.removeAll(),
               'start by clearing everything');

             var expectedArray = [];

             assert.willDeepEqual(
               stash.getAll(),
               expectedArray, 'getAll promise resolved',
               function (value) {
                  assert.equal(0, value.length, 'correct number of items returned');
                  assert.deepEqual(expectedArray, value);
               }
              );
          });


          test("enduring stash 'add' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };

             assert.willDeepEqual(
                stash.add(expected.key, expected.value),
                expected.value, 'add promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash 'add' does not update a value if it already exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };

             assert.willDeepEqual( // first time
                stash.add(expected.key, expected.value),
                expected.value, 'add succeeds the first time');

             assert.wont(
                stash.add(expected.key, 22),
                'but fails if trying to add with the same key again');

             assert.willEqual(
               stash.get(expected.key),
               expected.value, 'leaving the data unchanged');
          });


          test("enduring stash 'update' does not add an item if it doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             assert.wont(
                stash.update(expected.key, expected.value),
                'update promise rejected and no change was made');

             assert.willEqual(
               stash.contains(expected.key),
               false, "item still doesn't exist");
          });

          test("enduring stash 'update' updates a value if it already exists", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = expected;
             expected2.value = 5;

             assert.willDeepEqual(
                stash.set(expected.key, expected.value),
                expected.value, 'new item is added');

             assert.willDeepEqual(
                stash.update(expected.key, expected2.value),
                expected.value, 'and then the value is updated');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected2.value, 'get promise resolved',
               function (value) {
                  assert.equal(value, 5, 'and we can get the new value');
               });
          });


          test("enduring stash 'contains' returns true if an item exists", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             assert.willDeepEqual(
                stash.set(expected.key, expected.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willEqual(
                stash.contains(expected.key),
                true, 'contains promise fulfilled and returns true');
          });

          test("enduring stash 'contains' returns false if an item does not exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             assert.willEqual(
                stash.contains(expected.key),
                false, 'contains promise fulfilled and returns false');
          });


          test("enduring stash 'remove' promise resolves and item is removed", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             assert.willDeepEqual(
              stash.set(expected.key, expected.value),
              expected.value, 'item is added');


             assert.willEqual(
                stash.contains(expected.key),
                true, 'and contains returns true');

             assert.will(
                stash.remove(expected.key),
                'remove promise fulfilled');

             assert.willEqual(
                stash.contains(expected.key),
                false, 'and now contains is false');

             assert.willDeepEqual(
               stash.get(expected.key),
               undefined, 'and retrieving the item gives undefined');
          });

          test("enduring stash 'remove' return promise resolves with no action if an item does not exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             assert.willEqual(
                stash.contains(expected.key),
                false, 'contains promise fulfilled and returns false before removal');

             assert.will(
                stash.remove(expected.key),
                'remove promise fulfilled and returns false');

             assert.willEqual(
                stash.contains(expected.key),
                false, 'contains promise fulfilled and returns false after removal');

          });

          test("enduring stash 'removeAll' removes all items", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             assert.willDeepEqual(
              stash.set(expected.key, expected.value),
              expected.value, 'item is added');

             assert.willDeepEqual(
              stash.set(expected2.key, expected2.value),
              expected2.value, 'and a second item is added');

             assert.willEqual(
                stash.contains(expected.key),
                true, 'and contains returns true');


             assert.willEqual(
                stash.contains(expected2.key),
                true, 'for both items');

             assert.will(
                stash.removeAll(expected.key),
                'removeAll promise fulfilled');

             assert.willEqual(
                stash.contains(expected.key),
                false, 'and now contains is false');

             assert.willEqual(
                stash.contains(expected2.key),
                false, 'for both items');

             assert.willDeepEqual(
               stash.get(expected.key),
               undefined, 'and retrieving the item gives undefined');

             assert.willDeepEqual(
              stash.get(expected2.key),
              undefined, 'as does retrieving the other item');

          });

       }

       var runDataTypeTests = function () {

          test("enduring stash sets and gets a number", function (assert) {
             var expected = { key: 'val', value: 3.14 };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  ok(!isNaN(value), 'returns number');
               });
          });

          test("enduring stash sets and gets a number, 0", function (assert) {
             var expected = { key: 'val', value: 0 };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash sets and gets a string", function (assert) {
             var expected = { key: 'val', value: "Hello World" };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash gets and sets a string with special characters", function (assert) {
             var expected = { key: 'val', value: "Hello World\how\are\you\today" };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a regular expression", function (assert) {
             var expected = { key: 'val', value: /lorem|ipsum/ };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash sets and gets a true boolean", function (assert) {
             var expected = { key: 'val', value: true };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a false boolean", function (assert) {
             var expected = { key: 'val', value: false };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets null", function (assert) {
             var expected = { key: 'val', value: null };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets undefined", function (assert) {
             var expected = { key: 'val', value: undefined };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a date", function (assert) {
             var expected = { key: 'val', value: new Date() };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash sets and gets a complex object", function (assert) {
             var object = {
                name: "Operation Enduring Stash",
                created: new Date(),
                isAwesome: true,
                levelOfAwesomeness: 11,
                contributors: ["Sarah Henderson", "Maybe you?"]
             };
             var expected = { key: 'val', value: object };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  assert.deepEqual(value, object, 'object is good!')
                  assert.strictEqual(value.name, object.name, 'string is the same');
                  assert.deepEqual(value.created, object.created, 'date is the same');
                  assert.strictEqual(value.isAwesome, object.isAwesome, 'boolean is the same');
                  assert.strictEqual(value.levelOfAwesomeness, object.levelOfAwesomeness, 'number is the same');
                  assert.deepEqual(value.contributors, object.contributors, 'array is the same');
               });
          });

          test("enduring stash sets and gets an array of complex object", function (assert) {
             var array = [];
             array.push({ id: 1, name: "Enduring", created: new Date() });
             array.push({ id: 2, name: "Stash", created: new Date() });

             var expected = { key: 'val', value: array };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected.value, 'returns expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  assert.strictEqual(value[0], object[0], 'first item is the same')
                  assert.strictEqual(value[1].name, object[1].name, 'second item string is the same');
                  assert.deepEqual(value[1].created, object[1].created, 'second item date is the same');
               });
          });

       };
       return {
          run: run
       }
    }
);

