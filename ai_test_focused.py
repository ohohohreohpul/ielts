#!/usr/bin/env python3
"""
Focused AI generation testing for Mydemy - ALL section types
"""

import asyncio
import aiohttp
import json
import time

BASE_URL = "https://premium-unlock-23.preview.emergentagent.com/api"

async def test_ai_endpoint(session, test_case):
    """Test a single AI endpoint with detailed validation"""
    print(f"\n🔍 Testing {test_case['name']}")
    print("-" * 50)
    
    try:
        start_time = time.time()
        
        async with session.post(
            f"{BASE_URL}/ai/generate-questions", 
            json=test_case["data"]
        ) as response:
            status = response.status
            text = await response.text()
            
        duration = time.time() - start_time
        print(f"⏱️  Response time: {duration:.2f}s")
        print(f"📊 Status: {status}")
        
        if status == 200:
            try:
                data = json.loads(text)
                
                # Check basic structure
                if not all(field in data for field in ['examType', 'section', 'questions']):
                    print("❌ Missing required fields in response")
                    return False
                
                questions = data.get('questions', [])
                if not isinstance(questions, list) or len(questions) == 0:
                    print("❌ No questions generated")
                    return False
                
                print(f"✅ Generated {len(questions)} questions")
                
                # Validate each question
                for i, question in enumerate(questions):
                    missing_fields = [field for field in test_case["expected_fields"] if field not in question]
                    if missing_fields:
                        print(f"❌ Question {i+1} missing: {missing_fields}")
                        return False
                    
                    # Type-specific validation
                    if "type_check" in test_case:
                        if question.get("type") != test_case["type_check"]:
                            print(f"❌ Question {i+1} wrong type: expected '{test_case['type_check']}', got '{question.get('type')}'")
                            return False
                
                print(f"✅ All questions have required fields: {test_case['expected_fields']}")
                if "type_check" in test_case:
                    print(f"✅ All questions have correct type: {test_case['type_check']}")
                
                return True
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parse error: {e}")
                print(f"Response: {text[:200]}...")
                return False
        else:
            print(f"❌ HTTP error {status}")
            print(f"Response: {text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

async def main():
    print("🤖 AI Generation Comprehensive Testing")
    print("=" * 60)
    
    # All test cases as specified in the review request
    test_cases = [
        {
            "name": "TOEIC Reading",
            "data": {"examType": "TOEIC", "section": "reading", "count": 2},
            "expected_fields": ["id", "type"]
        },
        {
            "name": "TOEIC Listening", 
            "data": {"examType": "TOEIC", "section": "listening", "count": 2},
            "expected_fields": ["id", "type"]
        },
        {
            "name": "IELTS Reading",
            "data": {"examType": "IELTS", "section": "reading", "count": 2},
            "expected_fields": ["id", "type"]
        },
        {
            "name": "IELTS Listening",
            "data": {"examType": "IELTS", "section": "listening", "count": 2},
            "expected_fields": ["id", "type"]
        },
        {
            "name": "IELTS Writing",
            "data": {"examType": "IELTS", "section": "writing", "count": 2},
            "expected_fields": ["id", "type", "prompt", "task"],
            "type_check": "writing"
        },
        {
            "name": "IELTS Speaking",
            "data": {"examType": "IELTS", "section": "speaking", "count": 2},
            "expected_fields": ["id", "type", "question", "part"],
            "type_check": "speaking"
        }
    ]
    
    # Setup session with longer timeout
    timeout = aiohttp.ClientTimeout(total=45)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        results = {}
        
        for test_case in test_cases:
            success = await test_ai_endpoint(session, test_case)
            results[test_case["name"]] = success
            
            # Small delay between requests
            await asyncio.sleep(2)
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 SUMMARY")
        print("=" * 60)
        
        total = len(results)
        passed = sum(results.values())
        
        print(f"Total tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"Success rate: {(passed/total*100):.1f}%")
        
        print("\nResults by endpoint:")
        for name, success in results.items():
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {name:15} {status}")
        
        if passed == total:
            print("\n🎉 ALL AI GENERATION ENDPOINTS WORKING PERFECTLY!")
        else:
            failed = [name for name, success in results.items() if not success]
            print(f"\n⚠️  Failed endpoints: {', '.join(failed)}")

if __name__ == "__main__":
    asyncio.run(main())