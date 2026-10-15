import assert from 'node:assert';
import type { DocumentNode, ContentBlock } from '../types';
import {
  findNode,
  findPath,
  addNode,
  updateNode,
  deleteNode,
  duplicateNode,
  reorderBlocks,
  searchTree,
  countTotalNodes,
} from './treeOperations';

console.log('--- RUNNING IMMUTABLE TREE OPERATIONS TESTS ---');

// Helper to deeply freeze an object to guarantee zero in-place mutation
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj as object)) {
    const val = (obj as Record<string, unknown>)[key];
    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

const sampleTree: DocumentNode[] = [
  {
    id: 'root-1',
    title: 'Root 1',
    icon: '🚀',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'Paragraf 1' },
      { id: 'b2', type: 'paragraph', content: 'Paragraf 2' },
      { id: 'b3', type: 'todo', content: 'Tugas 1', checked: false },
    ],
    children: [
      {
        id: 'child-1-1',
        title: 'Child 1-1',
        icon: '📁',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        blocks: [{ id: 'b4', type: 'h1', content: 'Heading Level 2' }],
        children: [
          {
            id: 'child-1-1-1',
            title: 'Deep Child 1-1-1 (Level 3)',
            icon: '📄',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            blocks: [{ id: 'b5', type: 'code', content: 'console.log("hello")', language: 'typescript' }],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    title: 'Root 2',
    icon: '📝',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    blocks: [],
    children: [],
  },
];

// Deep freeze to catch any direct mutations
deepFreeze(sampleTree);

// TEST 1: findNode at deep level
console.log('Test 1: findNode deep in hierarchy...');
const deepNode = findNode(sampleTree, 'child-1-1-1');
assert.ok(deepNode, 'Should find deep node');
assert.strictEqual(deepNode?.title, 'Deep Child 1-1-1 (Level 3)');
console.log('✓ Test 1 passed.');

// TEST 2: findPath (breadcrumbs)
console.log('Test 2: findPath breadcrumb generation...');
const path = findPath(sampleTree, 'child-1-1-1');
assert.ok(path, 'Path should exist');
assert.strictEqual(path.length, 3, 'Path should have 3 segments (Root > Child > Deep Child)');
assert.strictEqual(path[0].id, 'root-1');
assert.strictEqual(path[1].id, 'child-1-1');
assert.strictEqual(path[2].id, 'child-1-1-1');
console.log('✓ Test 2 passed.');

// TEST 3: addNode immutability check
console.log('Test 3: addNode immutability (adding to deep node)...');
const newChild: DocumentNode = {
  id: 'child-1-1-1-1',
  title: 'Level 4 child',
  icon: '⚡',
  createdAt: '2026-01-02',
  updatedAt: '2026-01-02',
  blocks: [],
  children: [],
};
const updatedTree = addNode(sampleTree, 'child-1-1-1', newChild);
assert.notStrictEqual(updatedTree, sampleTree, 'Tree reference must be different');
const foundAdded = findNode(updatedTree, 'child-1-1-1-1');
assert.ok(foundAdded, 'New node must be in updated tree');
assert.strictEqual(findNode(sampleTree, 'child-1-1-1-1'), null, 'Original frozen tree must NOT contain new node');
console.log('✓ Test 3 passed.');

// TEST 4: updateNode immutability
console.log('Test 4: updateNode immutability...');
const titleUpdated = updateNode(sampleTree, 'child-1-1-1', { title: 'Updated Title' });
const updatedDeep = findNode(titleUpdated, 'child-1-1-1');
assert.strictEqual(updatedDeep?.title, 'Updated Title');
assert.strictEqual(findNode(sampleTree, 'child-1-1-1')?.title, 'Deep Child 1-1-1 (Level 3)', 'Original title must remain unchanged');
console.log('✓ Test 4 passed.');

// TEST 5: deleteNode immutability
console.log('Test 5: deleteNode deep node...');
const afterDelete = deleteNode(sampleTree, 'child-1-1');
assert.strictEqual(findNode(afterDelete, 'child-1-1'), null, 'Deleted child-1-1 should not exist');
assert.strictEqual(findNode(afterDelete, 'child-1-1-1'), null, 'Descendants must also be deleted');
assert.ok(findNode(sampleTree, 'child-1-1'), 'Original tree still has child-1-1');
console.log('✓ Test 5 passed.');

// TEST 6: duplicateNode
console.log('Test 6: duplicateNode...');
const duplicated = duplicateNode(sampleTree, 'root-2');
assert.strictEqual(duplicated.length, 3, 'Duplicated tree should have 3 root elements');
console.log('✓ Test 6 passed.');

// TEST 7: reorderBlocks
console.log('Test 7: reorderBlocks (dnd-kit integration logic)...');
const origBlocks: ContentBlock[] = [
  { id: 'b1', type: 'paragraph', content: 'Block 1' },
  { id: 'b2', type: 'h1', content: 'Block 2' },
  { id: 'b3', type: 'image', content: 'http://img.jpg' },
];
deepFreeze(origBlocks);
const reordered = reorderBlocks(origBlocks, 'b3', 'b1');
assert.notStrictEqual(reordered, origBlocks);
assert.strictEqual(reordered[0].id, 'b3', 'b3 should now be at index 0');
assert.strictEqual(reordered[1].id, 'b1', 'b1 should now be at index 1');
assert.strictEqual(reordered[2].id, 'b2', 'b2 should now be at index 2');
console.log('✓ Test 7 passed.');

// TEST 8: countTotalNodes & searchTree
console.log('Test 8: countTotalNodes & deep searchTree...');
assert.strictEqual(countTotalNodes(sampleTree), 4);
const searchResults = searchTree(sampleTree, 'Heading');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].doc.id, 'child-1-1');
console.log('✓ Test 8 passed.');

console.log('🎉 ALL 8 TESTS PASSED! Immutable tree operations verified without direct state mutation.');
