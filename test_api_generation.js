// Test script to diagnose AI generation issue
const fetch = require('node:fetch');

async function testGeneration() {
  console.log('Testing AI generation endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examType: 'TOEIC',
        section: 'reading',
        count: 3
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\nResponse body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Generated', data.questions?.length, 'questions');
    } else {
      console.log('\n❌ ERROR:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testGeneration();
