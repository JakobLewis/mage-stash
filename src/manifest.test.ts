import { Wisp, Manifest, loadDefaults } from './main.js';
import assert from 'node:assert';
import { describe, it, expect } from '@jest/globals';

loadDefaults();

const success = Array.apply(null, Array(Manifest.count())).map(() => true);

it('TODO: Unloading manifest plugin should cause all read/write attempts to fail', () => { });

it('Calling loadDefaults() should mount at least 1 Manifest', () => assert(Manifest.count() > 0));

describe('Illegal writes should fail', () => {
    it('to the root path', async () => await expect(Manifest.writeWisp({
        path: '/',
        content: '',
    })).rejects.toThrow(Wisp.MalformedPathError));

    it('to a path with invalid characters', async () => await expect(Manifest.writeWisp({
        path: '/!@#$%^&*()_',
        content: '',
    })).rejects.toThrow(Wisp.MalformedPathError));

    it('to an empty parent path', async () => await expect(Manifest.writeWisp({
        path: '//',
        content: '',
    })).rejects.toThrow(Wisp.MalformedPathError));

    it('with a missing parent', async () => assert.notDeepEqual(await Manifest.writeWisp({
        path: '/aParentThatDoesntExist/test',
        content: ''
    }), success));

    it('with a ContentWisp parent', async () => {
        const wisp: Wisp.ContentWisp = {
            path: '/realNiceContentWisp',
            content: 'oh boy this is great stuff'
        };
        try {
            await Manifest.writeWisp(wisp);
            assert.notDeepEqual(await Manifest.writeWisp({
                path: `${wisp.path}/oops`,
                content: 'some more great stuff'
            }), success);
        } finally {
            await Manifest.deleteWisp(wisp.path);
        }
    })
});

describe('Deletes should fail', () => {
    it('to a top-level Wisp that doesn\'t exist', async () => assert.notDeepEqual(await Manifest.deleteWisp(`/${Math.random().toString(16).replace('.', '')}`), success));
    it('to a child Wisp that doesn\'t exist', async () => assert.notDeepEqual(await Manifest.deleteWisp(`/${Math.random().toString(16).replace('.', '')}/${Math.random().toString(16).replace('.', '')}`), success));
    it('to the root path', async () => await expect(Manifest.deleteWisp('/')).rejects.toThrow(Wisp.MalformedPathError));
});

describe('Reads to non-existent Wisps should fail', () => {
    it('to a top level Wisp', async () => assert.equal(await Manifest.readWisp(`/${Math.random().toString(16).replace('.', '')}`), undefined));
    it('to a child wisp', async () => assert.equal(await Manifest.readWisp(`/${Math.random().toString(16).replace('.', '')}/${Math.random().toString(16).replace('.', '')}`), undefined));
});

describe('Valid writes should succeed', () => {
    it('with a top-level ContentWisp', async () => {
        try {
            assert.deepEqual(await Manifest.writeWisp({
                path: '/writeTest1',
                content: 'lorem ipsum'
            }), success);
        } finally {
            await Manifest.deleteWisp('/writeTest1');
        }
    });

    it('with a top-level GroupWisp', async () => {
        try {
            assert.deepEqual(await Manifest.writeWisp({
                path: '/writeTest2',
                content: ['bogusChild']
            }), success);
        } finally {
            await Manifest.deleteWisp('/writeTest2');
        }
    });

    it('with child Wisps', async () => {
        await Manifest.writeWisp({
            path: '/writeTest3',
            content: []
        });
        try {
            assert.deepEqual(await Manifest.writeWisp({
                path: '/writeTest3/child1',
                content: []
            }), success);
            assert.deepEqual(await Manifest.writeWisp({
                path: '/writeTest3/child2',
                content: 'child Wisp content'
            }), success);
        } finally {
            await Manifest.deleteWisp('/writeTest3');
        }
    });
});

describe('Valid reads should succeed', () => {
    it('with a top-level ContentWisp', async () => {
        const wisp: Wisp.ContentWisp = {
            path: '/readTest1',
            content: 'lorem ipsomething'
        };
        try {
            await Manifest.writeWisp(wisp);
            assert.deepEqual(await Manifest.readWisp(wisp.path), wisp);
        } finally {
            await Manifest.deleteWisp(wisp.path);
        }
    });

    it('with a top-level GroupWisp', async () => {
        const wisp: Wisp.GroupWisp = {
            path: '/readTest2',
            content: []
        };

        try {
            await Manifest.writeWisp(wisp);
            assert.deepEqual(await Manifest.readWisp(wisp.path), wisp);
        } finally {
            await Manifest.deleteWisp(wisp.path);
        }
    });

    it('with child Wisps', async () => {
        const wisp1: Wisp.ContentWisp = {
            path: '/readTest3/child1',
            content: 'lorem ipsomething',
            metadata: {
                'some': 'interesting metadata'
            }
        };
        const wisp2: Wisp.GroupWisp = {
            path: '/readTest3/child2',
            content: [],
            metadata: {
                'view-count': 1241958
            }
        };

        try {
            await Promise.all([Manifest.writeWisp({
                path: '/readTest3',
                content: []
            }), Manifest.writeWisp(wisp1), Manifest.writeWisp(wisp2)]);
            assert.deepEqual(await Manifest.readWisp(wisp1.path), wisp1);
            assert.deepEqual(await Manifest.readWisp(wisp2.path), wisp2);
        } finally {
            await Manifest.deleteWisp('/readTest3');
        }
    });
});

describe('Overwrites should succeed', () => {
    it('with a ContentWisp over another ContentWisp', async () => {
        const path = '/overwriteTest1';
        const wisp1: Wisp.ContentWisp = {
            path,
            content: 'original string',
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.ContentWisp = {
            path,
            content: 'a new string which is longer',
        }
        try {
            assert.deepEqual(await Manifest.writeWisp(wisp1), success);
            assert.deepEqual(await Manifest.writeWisp(wisp2), success);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a GroupWisp over another GroupWisp', async () => {
        const path = '/overwriteTest2';
        const wisp1: Wisp.GroupWisp = {
            path,
            content: [],
            metadata: {
                'some': 'other interesting data'
            }
        };
        const wisp2: Wisp.GroupWisp = {
            path,
            content: [],
        }
        try {
            assert.deepEqual(await Manifest.writeWisp(wisp1), success);
            assert.deepEqual(await Manifest.writeWisp(wisp2), success);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a GroupWisp over a ContentWisp', async () => {
        const path = '/overwriteTest3';
        const wisp1: Wisp.ContentWisp = {
            path,
            content: "some important data",
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.GroupWisp = {
            path,
            content: [],
        }
        try {
            assert.deepEqual(await Manifest.writeWisp(wisp1), success);
            assert.deepEqual(await Manifest.writeWisp(wisp2), success);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a ContentWisp over a GroupWisp', async () => {
        const path = '/overwriteTest3';
        const wisp1: Wisp.GroupWisp = {
            path,
            content: [],
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.ContentWisp = {
            path,
            content: "wow nice content :o",
        }
        try {
            assert.deepEqual(await Manifest.writeWisp(wisp1), success);
            assert.deepEqual(await Manifest.writeWisp(wisp2), success);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });
});

describe('Overwrites should read correctly', () => {
    it('with a ContentWisp over another ContentWisp', async () => {
        const path = '/overwriteReadTest1';
        const wisp1: Wisp.ContentWisp = {
            path,
            content: 'original string',
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.ContentWisp = {
            path,
            content: 'a new string which is longer',
        }
        await Manifest.writeWisp(wisp1);
        await Manifest.writeWisp(wisp2);
        try {
            assert.deepEqual(await Manifest.readWisp(path), wisp2);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a GroupWisp over another GroupWisp', async () => {
        const path = '/overwriteReadTest2';
        const wisp1: Wisp.GroupWisp = {
            path,
            content: [],
            metadata: {
                'some': 'other interesting data'
            }
        };
        const wisp2: Wisp.GroupWisp = {
            path,
            content: [],
        }
        await Manifest.writeWisp(wisp1);
        await Manifest.writeWisp(wisp2);
        try {
            assert.deepEqual(await Manifest.readWisp(path), wisp2);
        } catch { }
        finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a GroupWisp over a ContentWisp', async () => {
        const path = '/overwriteReadTest3';
        const wisp1: Wisp.ContentWisp = {
            path,
            content: "some important data",
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.GroupWisp = {
            path,
            content: [],
        }
        await Manifest.writeWisp(wisp1);
        await Manifest.writeWisp(wisp2);
        try {
            assert.deepEqual(await Manifest.readWisp(path), wisp2);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });

    it('with a ContentWisp overa GroupWisp', async () => {
        const path = '/overwriteReadTest3';
        const wisp1: Wisp.GroupWisp = {
            path,
            content: [],
            metadata: {
                'some': 'interesting data'
            }
        };
        const wisp2: Wisp.ContentWisp = {
            path,
            content: "wow nice content :o",
        }
        await Manifest.writeWisp(wisp1);
        await Manifest.writeWisp(wisp2);
        try {
            assert.deepEqual(await Manifest.readWisp(path), wisp2);
        } finally {
            await Manifest.deleteWisp(path);
        }
    });
});

describe('Deletions should succeed', () => {
    it('with a top-level ContentWisp', async () => {
        const wisp: Wisp.ContentWisp = {
            path: '/deletionTest1',
            content: 'something that won\'t exist for long'
        };
        try {
            await Manifest.writeWisp(wisp);
        } finally {
            assert.deepEqual(await Manifest.deleteWisp(wisp.path), success);
        }
    });

    it('with an empty top-level GroupWisp', async () => {
        const wisp: Wisp.GroupWisp = {
            path: '/deletionTest2',
            content: []
        };
        try {
            await Manifest.writeWisp(wisp);
        } finally {
            assert.deepEqual(await Manifest.deleteWisp(wisp.path), success);
        }
    });

    it('with a top-level GroupWisp', async () => {
        const wisp1: Wisp.GroupWisp = {
            path: '/deletionTest3/child1',
            content: []
        };
        const wisp2: Wisp.ContentWisp = {
            path: '/deletionTest3/child1',
            content: 'oH mAh gAWd'
        };
        try {
            await Promise.all([Manifest.writeWisp({
                path: '/deletionTest3',
                content: []
            }), Manifest.writeWisp(wisp1), Manifest.writeWisp(wisp2)]);
        } finally {
            assert.deepEqual(await Manifest.deleteWisp(wisp1.path), success);
        }
    });
});

describe('After deletion, reads should fail', () => {
    it('with a top-level ContentWisp', async () => {
        const wisp: Wisp.ContentWisp = {
            path: '/deletionTestWithRead1',
            content: 'something that won\'t exist for long'
        };
        await Manifest.writeWisp(wisp);
        await Manifest.deleteWisp(wisp.path);
        assert.equal(await Manifest.readWisp(wisp.path), undefined);
    });

    it('with an empty top-level GroupWisp', async () => {
        const wisp: Wisp.GroupWisp = {
            path: '/deletionTestWithRead2',
            content: []
        };
        await Manifest.writeWisp(wisp);
        await Manifest.deleteWisp(wisp.path);
        assert.equal(await Manifest.readWisp(wisp.path), undefined);
    });

    it('with a top-level GroupWisp and its children', async () => {
        const wisp1: Wisp.GroupWisp = {
            path: '/deletionTestWithRead3/child1',
            content: []
        };
        const wisp2: Wisp.ContentWisp = {
            path: '/deletionTestWithRead3/child1',
            content: 'oH mAh gAWd'
        };
        await Promise.all([Manifest.writeWisp({
            path: '/deletionTestWithRead3',
            content: []
        }), Manifest.writeWisp(wisp1), Manifest.writeWisp(wisp2)]);
        await Manifest.deleteWisp('/deletionTestWithRead3');
        assert.equal(await Manifest.readWisp(wisp1.path), undefined);
        assert.equal(await Manifest.readWisp(wisp2.path), undefined);
        assert.equal(await Manifest.readWisp('/deletionTestWithRead3'), undefined);
    });
});