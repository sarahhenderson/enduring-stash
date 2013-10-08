"use strict";
define(
    ['QUnit', 'QPromises', 'enduring'],
    function (QUnit, QPromises, enduring) {

       var testStorage = true;
       var testRetrieval = true;
       var stash = enduring.stash;

       var run = function () {
          module("Local Storage");

          test("enduring stash can be created using Local Storage", function () {
             ok(stash);
          });

          runDataTypeTests();
          runAccessTests();
//          runOtherTests();
       }

       var runAccessTests = function () {

          test("enduring stash 'set' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             assert.willDeepEqual(
                stash.set(expected.key, expected.value),
                expected, 'set promise fulfilled and returns key and value');

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
                expected, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
                stash.set(expected.key, expected2.value),
                expected, 'set promise fulfilled and returns key and value');

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

          test("enduring stash 'getAll' promise is resolved with an empty array if no values exists", function (assert) {
             
             stash.clear();

             var expected = { key: 'val', value: 5 };
             var expectedArray = [];
             var promises = [];
             for (var i = 0; i < 10; i++) {
                expectedArray.push(expected.value + i);
                promises.push(stash.set(expected.key + i, expected.value + i));
             }

             //assert.will(Q.all(promises), 'items added correctly'); // 10 items added

             assert.willEqual(
               stash.getAll(),
               expectedArray, 'getAll promise resolved',
               function (value) {
                  console.log(value);
                  assert.equal(10, value.length, 'correct number of items returned');
                  assert.deepEqual(expectedArray, value);
               }
              );
          });

          test("enduring stash 'getAll' promise is resolved with an empty array if no values exists", function (assert) {

             stash.clear();

             var expectedArray = [];
             
             assert.willEqual(
               stash.getAll(),
               expectedArray, 'getAll promise resolved',
               function (value) {
                  console.log(value);
                  assert.equal(0, value.length, 'correct number of items returned');
                  assert.deepEqual(expectedArray, value);
               }
              );
          });


          test("enduring stash 'add' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };

             assert.willDeepEqual(
                stash.add(expected.key, expected.value),
                expected, 'add promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash 'add' does not update a value if it already exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };
       
             assert.willDeepEqual( // first time
                stash.add(expected.key, expected.value),
                expected, 'add succeeds the first time');

             assert.wont(
                stash.add(expected.key, 22),
                'but fails if trying to add with the same key again');

             assert.willEqual(
               stash.get(expected.key),
               expected.value, 'leaving the data unchanged');
          });


          test("enduring stash 'update' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             assert.willDeepEqual(
                stash.update(expected.key, expected.value),
                expected, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  ok(!isNaN(value), 'returns number');
               });
          });


          test("enduring stash 'update' updates a value if it already exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = expected;
             expected2.value = 5;

             assert.willDeepEqual(
                stash.update(expected.key, expected.value),
                expected, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
                stash.update(expected.key, expected2.value),
                expected, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected2.value, 'get promise resolved',
               function (value) {
                  ok(!isNaN(value), 'returns number');
                  assert.equal(value, 5);
               });
          });

       }

       var runDataTypeTests = function() {
          
          test("enduring stash sets and gets a number", function (assert) {
             var expected = { key: 'val', value: 3.14 };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'set promise fulfilled and returns key and value');

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
                expected, 'set promise fulfilled and returns key and value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved' );
          });

          test("enduring stash sets and gets a string", function (assert) {
             var expected = { key: 'val', value: "Hello World" };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });

          test("enduring stash gets and sets a string with special characters", function (assert) {
             var expected = { key: 'val', value: "Hello World\how\are\you\today" };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a regular expression", function (assert) {
             var expected = { key: 'val', value: /lorem|ipsum/ };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');
          });
          
          test("enduring stash sets and gets a true boolean", function (assert) {
             var expected = { key: 'val', value: true };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a false boolean", function (assert) {
             var expected = { key: 'val', value: false };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets null", function (assert) {
             var expected = { key: 'val', value: null };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets undefined", function (assert) {
             var expected = { key: 'val', value: undefined };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved');

          });

          test("enduring stash sets and gets a date", function (assert) {
             var expected = { key: 'val', value: new Date() };
             assert.willDeepEqual(
                stash.set('val', expected.value),
                expected, 'returns object with key and expected value');

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
                expected, 'returns object with key and expected value');

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
                expected, 'returns object with key and expected value');

             assert.willDeepEqual(
               stash.get(expected.key),
               expected.value, 'get promise resolved',
               function (value) {
                  console.log(value);
                  assert.strictEqual(value[0], object[0], 'first item is the same')
                  assert.strictEqual(value[1].name, object[1].name, 'second item string is the same');
                  assert.deepEqual(value[1].created, object[1].created, 'second item date is the same');
               });
          });

       };
       return {
          testStorage: testStorage,
          testRetrieval: testRetrieval,
          run: run
       }
    }
);

