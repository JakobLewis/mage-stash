import { Wisp, Manifest, loadDefaults } from './main.js';
import assert from 'node:assert';
import { describe, it, expect } from '@jest/globals';

loadDefaults();

let contentWisp: Wisp.ContentWisp = {
    path: '/temporary',
    content: 'this is also content',
    metadata: {}
};

let groupWisp: Wisp.GroupWisp = {
    path: '/temp',
    content: ['temp'],
    metadata: {}
};

let childWisp: Wisp.ContentWisp = {
    path: '/temp/temp',
    content: 'this is also content',
    metadata: {}
};


const invalidWisp = {
    path: '/',
    content: 'this should fail',
    metadata: {}
} as const;

const success = Array.apply(null, Array(Manifest.count())).map(() => true);

it('Calling loadDefaults() should mount at least 1 Manifest', () => assert(Manifest.count() > 0));

describe('Illegal writes should fail', () => {
    it('with a non-existent parent', async () => assert.notDeepEqual(await Manifest.writeWisp(childWisp), success));
    it('with an invalid Wisp', async () => await expect(Manifest.writeWisp(invalidWisp)).rejects.toThrow(Error));
});

describe('Deletes to nonexistent Wisps should fail', () => {
    it('with a ContentWisp', async () => assert.notDeepEqual(await Manifest.deleteWisp(contentWisp.path), success));
    it('with a GroupWisp', async () => assert.notDeepEqual(await Manifest.deleteWisp(groupWisp.path), success));
    it('with a child ContentWisp', async () => assert.notDeepEqual(await Manifest.deleteWisp(childWisp.path), success));
});

describe('Valid writes should succeed', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(contentWisp), success));
    it('with a GroupWisp', async () => assert.deepEqual(await Manifest.writeWisp(groupWisp), success));
    it('with a child ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(childWisp), success));
});

describe('Valid reads should succeed', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(contentWisp.path), contentWisp));
    it('with a GroupWisp', async () => assert.deepEqual(await Manifest.readWisp(groupWisp.path), groupWisp));
    it('with a child ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(childWisp.path), childWisp));
});

contentWisp = {
    ...contentWisp,
    content: 'less'
};

groupWisp = {
    ...groupWisp,
    metadata: {
        wowData: 1234
    }
};

childWisp = {
    ...childWisp,
    content: 'more more more way way way more content so much'
};

describe('Overwrites should succeed', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(contentWisp), success));
    it('with a child ContentWisp', async () => assert.deepEqual(await Manifest.writeWisp(childWisp), success));
});

describe('Reads should reflect overwrites', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(contentWisp.path), contentWisp));
    it('with a GroupWisp', async () => assert.deepEqual(await Manifest.readWisp(groupWisp.path), groupWisp));
    it('with a child ContentWisp', async () => assert.deepEqual(await Manifest.readWisp(childWisp.path), childWisp));
});

describe('Deletions should succeed', () => {
    it('with a ContentWisp', async () => assert.deepEqual(await Manifest.deleteWisp(contentWisp.path), success));
    it('with a child ContentWisp', async () => assert.deepEqual(await Manifest.deleteWisp(childWisp.path), success));
    it('with a GroupWisp', async () => assert.deepEqual(await Manifest.deleteWisp(groupWisp.path), success));
});

it('GroupWisps should reflect removal and addition of children: TODO', () => { });
it('Deleting a GroupWisp should delete child wisps: TODO', () => { });
it('Access collisions should not occur: TODO', () => { });


