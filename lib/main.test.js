import assert from 'assert';
import * as Main from './main.js';
const logger = new Main.Logger.default('main.test.js');
logger.info('Beginning test', true);
function test(message, statement) {
    assert(statement, message);
    logger.info('PASSED: ' + message, true);
}
function objectsAreEqual(obj1, obj2) {
    if (obj1 !== null && obj2 !== null && typeof obj1 === 'object' && typeof obj2 === 'object') {
        for (const key in obj1)
            if (!(key in obj2) || !objectsAreEqual(obj1[key], obj2[key]))
                return false;
        for (const key in obj2)
            if (!(key in obj1) || !objectsAreEqual(obj1[key], obj2[key]))
                return false;
        return true;
    }
    else
        return typeof obj1 === typeof obj2 && obj1 === obj2;
}
const groupWisp = {
    path: '/temp',
    content: ['data'],
    metadata: {}
};
const contentWisp = {
    path: '/temp/data',
    content: 'this is also content',
    metadata: {}
};
let invalidWisp = {
    path: '/',
    content: 'this should fail',
    metadata: {}
};
{ // Writing
    test('Writing to the root path should fail', await Main.Manifest.writeWisp(invalidWisp) === false);
    test('Writing to a non-existent GroupWisp should fail', await Main.Manifest.writeWisp(contentWisp) === false);
    test('Writing a valid GroupWisp should succeed', await Main.Manifest.writeWisp(groupWisp) === true);
    test('Writing a valid ContentWisp beneath a GroupWisp should succeed', await Main.Manifest.writeWisp(contentWisp) === true);
}
{ // Reading
    test('Reading a valid ContentWisp should match what was previously written', objectsAreEqual(await Main.Manifest.readWisp(contentWisp.path), contentWisp));
    test('Reading a valid GroupWisp should match what was previously written', objectsAreEqual(await Main.Manifest.readWisp(groupWisp.path), groupWisp));
}
test('Deleting a valid ContentWisp should succeed', await Main.Manifest.deleteWisp(contentWisp.path) === true);
test('Deleting an empty GroupWisp should succeed', await Main.Manifest.deleteWisp(groupWisp.path) === true);
Main.Logger.default.write(3, 'main.test.js', 'Testing completed', true);
Main.Logger.configArguments.logToFile = false;
Main.Logger.default.purge();
