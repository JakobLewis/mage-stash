import { Wisp, Manifest, loadDefaults } from './main.js';
import assert from 'node:assert';
import { describe, it, expect } from '@jest/globals';
loadDefaults();
const contentWisp = {
    path: '/temporary',
    content: 'this is also content',
    metadata: {}
};
const groupWisp = {
    path: '/temp',
    content: ['temp', 'temporary'],
    metadata: {}
};
const childWisp1 = {
    path: '/temp/temp',
    content: 'this is also content',
    metadata: {}
};
const childWisp2 = {
    path: '/temp/temporary',
    content: 'this is also also content',
    metadata: {}
};
const success = Array.apply(null, Array(Manifest.count())).map(() => true);
it('TODO: Unloading manifest plugin should cause all read/write attempts to fail', () => { });
it('TODO: Access collisions should not occur', () => { });
it('Calling loadDefaults() should mount at least 1 Manifest', () => assert(Manifest.count() > 0));
describe('Illegal writes should fail', () => {
    it('to the root path', async () => await expect(Manifest.writeWisp({
        path: '/',
        content: '',
        metadata: {}
    })).rejects.toThrow(Wisp.MalformedPathError));
    it('to a path with invalid characters', async () => await expect(Manifest.writeWisp({
        path: '/!@#$%^&*()_',
        content: '',
        metadata: {}
    })).rejects.toThrow(Wisp.MalformedPathError));
    it('to an empty parent path', async () => await expect(Manifest.writeWisp({
        path: '//',
        content: '',
        metadata: {}
    })).rejects.toThrow(Wisp.MalformedPathError));
    it('with a missing parent', async () => assert.notDeepEqual(await Manifest.writeWisp(childWisp1), success));
});
describe('Deletes to nonexistent Wisps should fail', () => {
    it('ContentWisp', async () => assert.notDeepEqual(await Manifest.deleteWisp('/test'), success));
    it('GroupWisp', async () => assert.notDeepEqual(await Manifest.deleteWisp(groupWisp.path), success));
    it('child ContentWisps', async () => {
        assert.notDeepEqual(await Manifest.deleteWisp(childWisp1.path), success);
        assert.notDeepEqual(await Manifest.deleteWisp(childWisp2.path), success);
    });
});
describe('Reads to nonexistent Wisps should fail', () => {
    it('ContentWisp', async () => assert.equal(await Manifest.readWisp(contentWisp.path), undefined));
    it('GroupWisp', async () => assert.equal(await Manifest.readWisp(groupWisp.path), undefined));
    it('child ContentWisps', async () => {
        assert.equal(await Manifest.readWisp(childWisp1.path), undefined);
        assert.equal(await Manifest.readWisp(childWisp2.path), undefined);
    });
});
describe('Valid writes should succeed', () => {
    it('ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(contentWisp), success));
    it('GroupWisp', async () => assert.deepEqual(await Manifest.writeWisp(groupWisp), success));
    it('child ContentWisps', async () => {
        assert.deepEqual(await Manifest.writeWisp(childWisp1), success);
        assert.deepEqual(await Manifest.writeWisp(childWisp2), success);
    });
});
describe('Valid reads should succeed', () => {
    const gw = { ...groupWisp };
    it('ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(contentWisp.path), contentWisp));
    it('GroupWisp', async () => assert.deepEqual(await Manifest.readWisp(groupWisp.path), gw));
    it('ContentWisps', async () => {
        assert.deepEqual(await Manifest.readWisp(childWisp1.path), childWisp1);
        assert.deepEqual(await Manifest.readWisp(childWisp2.path), childWisp2);
    });
});
const newContentWisp = {
    ...contentWisp,
    content: 'less'
};
const newGroupWisp = {
    ...groupWisp,
    metadata: {
        wowData: 1234
    }
};
const newChildWisp1 = {
    ...childWisp1,
    content: 'more more more way way way more content so much much wow'
};
describe('Overwrites of the same type should succeed', () => {
    it('ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(newContentWisp), success));
    it('GroupWisp', async () => assert.deepEqual(await Manifest.writeWisp(newGroupWisp), success));
    it('child ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(newChildWisp1), success));
});
describe('Reads should reflect overwrites', () => {
    it('ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(newContentWisp.path), newContentWisp));
    it('GroupWisp', async () => assert.deepEqual(await Manifest.readWisp(newGroupWisp.path), newGroupWisp));
    it('child ContentWisps', async () => assert.deepEqual(await Manifest.readWisp(newChildWisp1.path), newChildWisp1));
});
const newNewGroupWisp = {
    ...newGroupWisp,
    content: ['temp']
};
describe('Deleting a child Wisp', () => {
    it('should succeed', async () => assert.deepEqual(await Manifest.deleteWisp(childWisp2.path), success));
    it('should fail to read after', async () => assert.equal(await Manifest.readWisp(childWisp2.path), undefined));
    it('should be reflected in the parent GroupWisp', async () => assert.deepEqual(await Manifest.readWisp(newNewGroupWisp.path), newNewGroupWisp));
});
describe('Deletions should succeed', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.deleteWisp(contentWisp.path), success));
    it('with a GroupWisp', async () => assert.deepEqual(await Manifest.deleteWisp(groupWisp.path), success));
});
describe('After deletion, reads should fail', () => {
    it('ContentWisp', async () => assert.equal(await Manifest.readWisp(contentWisp.path), undefined));
    it('GroupWisp', async () => assert.equal(await Manifest.readWisp(groupWisp.path), undefined));
    it('child GroupWisp', async () => assert.equal(await Manifest.readWisp(childWisp1.path), undefined));
});
