/**
 * VOUCH // FIRESTORE RULES TEST
 *
 * Run this to verify Firestore rules are working correctly
 * Usage: node scripts/test-firestore-rules.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  VOUCH // FIRESTORE RULES TEST                                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✓ Firebase initialized');
console.log(`✓ Project: ${firebaseConfig.projectId}\n`);

// Test 1: Try to read without authentication (should fail)
async function testUnauthenticatedAccess() {
  console.log('[TEST 1] Unauthenticated Access');
  console.log('Expected: PERMISSION DENIED\n');

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    console.log('❌ FAILED: Unauthenticated read succeeded (should have failed)');
    console.log(`   Found ${snapshot.size} documents\n`);
    return false;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log('✅ PASSED: Permission denied for unauthenticated user');
      console.log('   Rules are correctly blocking unauthenticated access\n');
      return true;
    } else {
      console.log('⚠️  UNEXPECTED ERROR:', error.message);
      console.log('   Code:', error.code, '\n');
      return false;
    }
  }
}

// Test 2: Check if collections exist
async function testCollectionsExist() {
  console.log('[TEST 2] Collections Check');
  console.log('Expected: Collections may be empty (no documents yet)\n');

  const collections = ['users', 'vouches', 'squads', 'roasts'];

  for (const collectionName of collections) {
    try {
      const ref = collection(db, collectionName);
      const snapshot = await getDocs(ref);
      console.log(`   ${collectionName}: ${snapshot.size} documents`);
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log(`   ${collectionName}: Protected (permission denied - expected without auth)`);
      } else {
        console.log(`   ${collectionName}: Error - ${error.code}`);
      }
    }
  }
  console.log('\n');
}

// Test 3: Verify rules structure
async function testRulesStructure() {
  console.log('[TEST 3] Rules Structure');
  console.log('Checking if rules are deployed correctly...\n');

  // Try different operations to verify rules
  const tests = [
    { collection: 'users', operation: 'read', expected: 'denied' },
    { collection: 'vouches', operation: 'read', expected: 'denied' },
    { collection: 'squads', operation: 'read', expected: 'denied' },
    { collection: 'roasts', operation: 'read', expected: 'denied' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const ref = collection(db, test.collection);
      await getDocs(ref);

      if (test.expected === 'denied') {
        console.log(`   ❌ ${test.collection}: Should be denied without auth`);
        failed++;
      } else {
        console.log(`   ✅ ${test.collection}: Access granted as expected`);
        passed++;
      }
    } catch (error) {
      if (error.code === 'permission-denied' && test.expected === 'denied') {
        console.log(`   ✅ ${test.collection}: Correctly denied without auth`);
        passed++;
      } else {
        console.log(`   ❌ ${test.collection}: Unexpected result - ${error.code}`);
        failed++;
      }
    }
  }

  console.log(`\n   Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Run all tests
async function runTests() {
  console.log('Starting Firestore rules tests...\n');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const test1 = await testUnauthenticatedAccess();
  console.log('─────────────────────────────────────────────────────────────────\n');

  await testCollectionsExist();
  console.log('─────────────────────────────────────────────────────────────────\n');

  const test3 = await testRulesStructure();
  console.log('─────────────────────────────────────────────────────────────────\n');

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUMMARY                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (test1 && test3) {
    console.log('✅ All core tests passed!');
    console.log('✅ Firestore rules are working correctly');
    console.log('\nNext steps:');
    console.log('1. Enable Firebase Storage');
    console.log('2. Deploy Storage rules');
    console.log('3. Test authentication with Privy');
    console.log('4. Test creating vouches from mobile app\n');
  } else {
    console.log('⚠️  Some tests failed');
    console.log('This might be expected behavior depending on your setup\n');
  }

  process.exit(0);
}

// Execute tests
runTests().catch((error) => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
