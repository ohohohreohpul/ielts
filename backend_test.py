#!/usr/bin/env python3
"""
Comprehensive backend API testing for Mydemy application
Tests all API endpoints with proper error handling and validation
"""

import asyncio
import aiohttp
import json
import os
import uuid
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://premium-unlock-23.preview.emergentagent.com/api"

class MydemyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.test_results = {}
        
    async def setup_session(self):
        """Setup HTTP session with proper headers"""
        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mydemy-Test-Client/1.0'
            }
        )
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def make_request(self, method, endpoint, data=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            print(f"[REQUEST] {method} {url}")
            if data:
                print(f"[PAYLOAD] {json.dumps(data, indent=2)}")
                
            if method.upper() == 'GET':
                async with self.session.get(url) as response:
                    text = await response.text()
                    return response.status, text
            elif method.upper() == 'POST':
                async with self.session.post(url, json=data) as response:
                    text = await response.text()
                    return response.status, text
                    
        except asyncio.TimeoutError:
            return None, "Timeout error"
        except Exception as e:
            return None, f"Connection error: {str(e)}"
    
    async def test_root_endpoint(self):
        """Test GET / and GET /root endpoints"""
        print("\n" + "="*50)
        print("Testing Root Endpoint")
        print("="*50)
        
        endpoints_to_test = ["/", "/root"]
        for endpoint in endpoints_to_test:
            try:
                status, response_text = await self.make_request("GET", endpoint)
                
                if status is None:
                    print(f"❌ FAILED: {endpoint} - {response_text}")
                    self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = False
                    continue
                
                print(f"[RESPONSE] Status: {status}")
                print(f"[RESPONSE] Body: {response_text[:500]}")
                
                if status == 200:
                    try:
                        data = json.loads(response_text)
                        required_fields = ['message', 'version', 'endpoints']
                        if all(field in data for field in required_fields):
                            print(f"✅ SUCCESS: {endpoint} endpoint working correctly")
                            self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = True
                        else:
                            print(f"❌ FAILED: {endpoint} - Missing required fields")
                            self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = False
                    except json.JSONDecodeError:
                        print(f"❌ FAILED: {endpoint} - Invalid JSON response")
                        self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = False
                else:
                    print(f"❌ FAILED: {endpoint} - Expected 200, got {status}")
                    self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = False
                    
            except Exception as e:
                print(f"❌ ERROR: {endpoint} - {str(e)}")
                self.test_results[f"root_{endpoint.replace('/', 'slash')}"] = False
    
    async def test_generate_exam_endpoint(self):
        """Test POST /generate-exam endpoint"""
        print("\n" + "="*50)
        print("Testing Generate Exam Endpoint")
        print("="*50)
        
        test_cases = [
            {"examType": "TOEIC", "questionCount": 5},
            {"examType": "IELTS", "questionCount": 3},
            {"examType": "CU-TEP", "questionCount": 10},
            {"examType": "TOEIC"},  # Default questionCount
            {}  # All defaults
        ]
        
        for i, payload in enumerate(test_cases):
            try:
                print(f"\nTest Case {i+1}: {payload}")
                status, response_text = await self.make_request("POST", "/generate-exam", payload)
                
                if status is None:
                    print(f"❌ FAILED: Test case {i+1} - {response_text}")
                    self.test_results[f"generate_exam_case_{i+1}"] = False
                    continue
                
                print(f"[RESPONSE] Status: {status}")
                
                if status == 200:
                    try:
                        data = json.loads(response_text)
                        required_fields = ['id', 'examType', 'questions', 'createdAt', 'totalQuestions']
                        
                        if all(field in data for field in required_fields):
                            # Validate question structure
                            questions = data.get('questions', [])
                            if questions and len(questions) > 0:
                                # Check question types
                                question_types = set(q.get('type') for q in questions)
                                expected_types = {'multiple-choice', 'reorder', 'reading'}
                                if question_types.issubset(expected_types):
                                    print(f"✅ SUCCESS: Test case {i+1} - Exam generated successfully")
                                    print(f"   - Generated {len(questions)} questions")
                                    print(f"   - Question types: {list(question_types)}")
                                    self.test_results[f"generate_exam_case_{i+1}"] = True
                                else:
                                    print(f"❌ FAILED: Test case {i+1} - Invalid question types")
                                    self.test_results[f"generate_exam_case_{i+1}"] = False
                            else:
                                print(f"❌ FAILED: Test case {i+1} - No questions generated")
                                self.test_results[f"generate_exam_case_{i+1}"] = False
                        else:
                            print(f"❌ FAILED: Test case {i+1} - Missing required fields")
                            self.test_results[f"generate_exam_case_{i+1}"] = False
                            
                    except json.JSONDecodeError:
                        print(f"❌ FAILED: Test case {i+1} - Invalid JSON response")
                        self.test_results[f"generate_exam_case_{i+1}"] = False
                else:
                    print(f"❌ FAILED: Test case {i+1} - Expected 200, got {status}")
                    print(f"Response: {response_text}")
                    self.test_results[f"generate_exam_case_{i+1}"] = False
                    
            except Exception as e:
                print(f"❌ ERROR: Test case {i+1} - {str(e)}")
                self.test_results[f"generate_exam_case_{i+1}"] = False
    
    async def test_lessons_endpoint(self):
        """Test GET /lessons endpoint"""
        print("\n" + "="*50)
        print("Testing Lessons Endpoint")
        print("="*50)
        
        try:
            status, response_text = await self.make_request("GET", "/lessons")
            
            if status is None:
                print(f"❌ FAILED: Lessons endpoint - {response_text}")
                self.test_results["lessons"] = False
                return
            
            print(f"[RESPONSE] Status: {status}")
            
            if status == 200:
                try:
                    data = json.loads(response_text)
                    if isinstance(data, list):
                        print(f"✅ SUCCESS: Lessons endpoint working - returned {len(data)} lessons")
                        
                        # Validate lesson structure if any exist
                        if len(data) > 0:
                            lesson = data[0]
                            expected_fields = ['id', 'examType', 'questions', 'createdAt', 'totalQuestions']
                            if all(field in lesson for field in expected_fields):
                                print("   - Lesson structure is valid")
                            else:
                                print("   - Warning: Some lessons may have incomplete structure")
                        
                        self.test_results["lessons"] = True
                    else:
                        print(f"❌ FAILED: Lessons endpoint - Expected array, got {type(data)}")
                        self.test_results["lessons"] = False
                        
                except json.JSONDecodeError:
                    print(f"❌ FAILED: Lessons endpoint - Invalid JSON response")
                    self.test_results["lessons"] = False
            else:
                print(f"❌ FAILED: Lessons endpoint - Expected 200, got {status}")
                print(f"Response: {response_text}")
                self.test_results["lessons"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Lessons endpoint - {str(e)}")
            self.test_results["lessons"] = False
    
    async def test_progress_endpoints(self):
        """Test POST /progress and GET /progress/{userId} endpoints"""
        print("\n" + "="*50)
        print("Testing Progress Endpoints")
        print("="*50)
        
        test_user_id = f"test-user-{uuid.uuid4().hex[:8]}"
        test_lesson_id = f"lesson-{uuid.uuid4().hex[:8]}"
        
        # Test POST /progress
        print("\n--- Testing POST /progress ---")
        
        # Valid progress data
        progress_data = {
            "userId": test_user_id,
            "lessonId": test_lesson_id,
            "score": 85
        }
        
        try:
            status, response_text = await self.make_request("POST", "/progress", progress_data)
            
            if status is None:
                print(f"❌ FAILED: POST /progress - {response_text}")
                self.test_results["progress_post"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_fields = ['id', 'userId', 'lessonId', 'score', 'createdAt']
                    if all(field in data for field in required_fields):
                        print("✅ SUCCESS: POST /progress working correctly")
                        print(f"   - Progress saved with ID: {data.get('id')}")
                        self.test_results["progress_post"] = True
                    else:
                        print("❌ FAILED: POST /progress - Missing required fields")
                        self.test_results["progress_post"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: POST /progress - Invalid JSON response")
                    self.test_results["progress_post"] = False
            else:
                print(f"❌ FAILED: POST /progress - Expected 200, got {status}")
                self.test_results["progress_post"] = False
                
        except Exception as e:
            print(f"❌ ERROR: POST /progress - {str(e)}")
            self.test_results["progress_post"] = False
        
        # Test invalid progress data (missing userId)
        print("\n--- Testing POST /progress with missing userId ---")
        invalid_data = {"lessonId": test_lesson_id, "score": 85}
        
        try:
            status, response_text = await self.make_request("POST", "/progress", invalid_data)
            
            if status == 400:
                print("✅ SUCCESS: POST /progress correctly rejects missing userId")
                self.test_results["progress_post_validation"] = True
            else:
                print(f"❌ FAILED: POST /progress - Expected 400 for missing userId, got {status}")
                self.test_results["progress_post_validation"] = False
                
        except Exception as e:
            print(f"❌ ERROR: POST /progress validation - {str(e)}")
            self.test_results["progress_post_validation"] = False
        
        # Test GET /progress/{userId}
        print(f"\n--- Testing GET /progress/{test_user_id} ---")
        
        try:
            status, response_text = await self.make_request("GET", f"/progress/{test_user_id}")
            
            if status is None:
                print(f"❌ FAILED: GET /progress/{test_user_id} - {response_text}")
                self.test_results["progress_get"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    if isinstance(data, list):
                        print(f"✅ SUCCESS: GET /progress/{test_user_id} working - returned {len(data)} records")
                        
                        # Validate structure if any records exist
                        if len(data) > 0:
                            record = data[0]
                            expected_fields = ['id', 'userId', 'lessonId', 'score', 'createdAt']
                            if all(field in record for field in expected_fields):
                                print("   - Progress record structure is valid")
                            else:
                                print("   - Warning: Some progress records may have incomplete structure")
                        
                        self.test_results["progress_get"] = True
                    else:
                        print(f"❌ FAILED: GET /progress/{test_user_id} - Expected array, got {type(data)}")
                        self.test_results["progress_get"] = False
                        
                except json.JSONDecodeError:
                    print(f"❌ FAILED: GET /progress/{test_user_id} - Invalid JSON response")
                    self.test_results["progress_get"] = False
            else:
                print(f"❌ FAILED: GET /progress/{test_user_id} - Expected 200, got {status}")
                self.test_results["progress_get"] = False
                
        except Exception as e:
            print(f"❌ ERROR: GET /progress/{test_user_id} - {str(e)}")
            self.test_results["progress_get"] = False
    
    async def test_user_endpoints(self):
        """Test POST /user and GET /user/{userId} endpoints"""
        print("\n" + "="*50)
        print("Testing User Endpoints")
        print("="*50)
        
        test_user_id = f"user-{uuid.uuid4().hex[:8]}"
        
        # Test POST /user (create)
        print("\n--- Testing POST /user (create) ---")
        
        user_data = {
            "userId": test_user_id,
            "name": "Alex Johnson",
            "goal": "toeic-700",
            "streak": 5,
            "hearts": 3
        }
        
        try:
            status, response_text = await self.make_request("POST", "/user", user_data)
            
            if status is None:
                print(f"❌ FAILED: POST /user create - {response_text}")
                self.test_results["user_post_create"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_fields = ['id', 'name', 'goal', 'streak', 'hearts', 'updatedAt']
                    if all(field in data for field in required_fields):
                        print("✅ SUCCESS: POST /user (create) working correctly")
                        print(f"   - User created: {data.get('name')} (Goal: {data.get('goal')})")
                        self.test_results["user_post_create"] = True
                    else:
                        print("❌ FAILED: POST /user create - Missing required fields")
                        self.test_results["user_post_create"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: POST /user create - Invalid JSON response")
                    self.test_results["user_post_create"] = False
            else:
                print(f"❌ FAILED: POST /user create - Expected 200, got {status}")
                self.test_results["user_post_create"] = False
                
        except Exception as e:
            print(f"❌ ERROR: POST /user create - {str(e)}")
            self.test_results["user_post_create"] = False
        
        # Test POST /user (update)
        print("\n--- Testing POST /user (update) ---")
        
        updated_data = {
            "userId": test_user_id,
            "name": "Alex Johnson",
            "goal": "ielts-7",
            "streak": 8,
            "hearts": 5
        }
        
        try:
            status, response_text = await self.make_request("POST", "/user", updated_data)
            
            if status == 200:
                try:
                    data = json.loads(response_text)
                    if data.get('streak') == 8 and data.get('goal') == 'ielts-7':
                        print("✅ SUCCESS: POST /user (update) working correctly")
                        print(f"   - User updated: Streak {data.get('streak')}, Goal {data.get('goal')}")
                        self.test_results["user_post_update"] = True
                    else:
                        print("❌ FAILED: POST /user update - Data not updated properly")
                        self.test_results["user_post_update"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: POST /user update - Invalid JSON response")
                    self.test_results["user_post_update"] = False
            else:
                print(f"❌ FAILED: POST /user update - Expected 200, got {status}")
                self.test_results["user_post_update"] = False
                
        except Exception as e:
            print(f"❌ ERROR: POST /user update - {str(e)}")
            self.test_results["user_post_update"] = False
        
        # Test POST /user with missing userId
        print("\n--- Testing POST /user with missing userId ---")
        
        invalid_user_data = {"name": "Invalid User", "goal": "toeic-700"}
        
        try:
            status, response_text = await self.make_request("POST", "/user", invalid_user_data)
            
            if status == 400:
                print("✅ SUCCESS: POST /user correctly rejects missing userId")
                self.test_results["user_post_validation"] = True
            else:
                print(f"❌ FAILED: POST /user - Expected 400 for missing userId, got {status}")
                self.test_results["user_post_validation"] = False
                
        except Exception as e:
            print(f"❌ ERROR: POST /user validation - {str(e)}")
            self.test_results["user_post_validation"] = False
        
        # Test GET /user/{userId}
        print(f"\n--- Testing GET /user/{test_user_id} ---")
        
        try:
            status, response_text = await self.make_request("GET", f"/user/{test_user_id}")
            
            if status is None:
                print(f"❌ FAILED: GET /user/{test_user_id} - {response_text}")
                self.test_results["user_get_existing"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_fields = ['id', 'name', 'goal', 'streak', 'hearts']
                    if all(field in data for field in required_fields):
                        print(f"✅ SUCCESS: GET /user/{test_user_id} working correctly")
                        print(f"   - Retrieved user: {data.get('name')} (Goal: {data.get('goal')})")
                        self.test_results["user_get_existing"] = True
                    else:
                        print(f"❌ FAILED: GET /user/{test_user_id} - Missing required fields")
                        self.test_results["user_get_existing"] = False
                except json.JSONDecodeError:
                    print(f"❌ FAILED: GET /user/{test_user_id} - Invalid JSON response")
                    self.test_results["user_get_existing"] = False
            else:
                print(f"❌ FAILED: GET /user/{test_user_id} - Expected 200, got {status}")
                self.test_results["user_get_existing"] = False
                
        except Exception as e:
            print(f"❌ ERROR: GET /user/{test_user_id} - {str(e)}")
            self.test_results["user_get_existing"] = False
        
        # Test GET /user/{nonexistent}
        print("\n--- Testing GET /user/{nonexistent} ---")
        
        nonexistent_user_id = f"nonexistent-{uuid.uuid4().hex[:8]}"
        
        try:
            status, response_text = await self.make_request("GET", f"/user/{nonexistent_user_id}")
            
            if status == 404:
                print("✅ SUCCESS: GET /user/{nonexistent} correctly returns 404")
                self.test_results["user_get_nonexistent"] = True
            else:
                print(f"❌ FAILED: GET /user/{nonexistent_user_id} - Expected 404, got {status}")
                self.test_results["user_get_nonexistent"] = False
                
        except Exception as e:
            print(f"❌ ERROR: GET /user/{nonexistent_user_id} - {str(e)}")
            self.test_results["user_get_nonexistent"] = False

    async def make_auth_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with authentication header"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
            
        try:
            print(f"[REQUEST] {method} {url}")
            if data:
                print(f"[PAYLOAD] {json.dumps(data, indent=2)}")
            if token:
                print(f"[AUTH] Bearer {token[:10]}...")
                
            if method.upper() == 'GET':
                async with self.session.get(url, headers=headers) as response:
                    text = await response.text()
                    return response.status, text
            elif method.upper() == 'POST':
                async with self.session.post(url, json=data, headers=headers) as response:
                    text = await response.text()
                    return response.status, text
                    
        except asyncio.TimeoutError:
            return None, "Timeout error"
        except Exception as e:
            return None, f"Connection error: {str(e)}"
    
    async def test_auth_endpoints(self):
        """Test authentication endpoints: signup, login, session"""
        print("\n" + "="*50)
        print("Testing Authentication Endpoints")
        print("="*50)
        
        # Generate unique test credentials
        test_email = f"testuser{uuid.uuid4().hex[:8]}@example.com"
        test_password = "SecurePassword123!"
        test_name = "Sarah Thompson"
        auth_token = None
        
        # Test Auth Signup
        print("\n--- Testing POST /auth/signup ---")
        
        signup_data = {
            "name": test_name,
            "email": test_email,
            "password": test_password
        }
        
        try:
            status, response_text = await self.make_auth_request("POST", "/auth/signup", signup_data)
            
            if status is None:
                print(f"❌ FAILED: Auth signup - {response_text}")
                self.test_results["auth_signup"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_fields = ['user', 'token']
                    user_fields = ['id', 'name', 'email', 'streak', 'hearts', 'totalXP', 'createdAt']
                    
                    if all(field in data for field in required_fields):
                        user = data.get('user', {})
                        if all(field in user for field in user_fields) and 'password' not in user:
                            auth_token = data.get('token')
                            print("✅ SUCCESS: Auth signup working correctly")
                            print(f"   - User created: {user.get('name')} ({user.get('email')})")
                            print(f"   - Token received: {auth_token[:10]}...")
                            self.test_results["auth_signup"] = True
                        else:
                            print("❌ FAILED: Auth signup - Invalid user object (missing fields or password exposed)")
                            self.test_results["auth_signup"] = False
                    else:
                        print("❌ FAILED: Auth signup - Missing user or token in response")
                        self.test_results["auth_signup"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: Auth signup - Invalid JSON response")
                    self.test_results["auth_signup"] = False
            elif status == 400:
                print("❌ FAILED: Auth signup - User may already exist or validation error")
                print(f"Response: {response_text}")
                self.test_results["auth_signup"] = False
            else:
                print(f"❌ FAILED: Auth signup - Expected 200, got {status}")
                print(f"Response: {response_text}")
                self.test_results["auth_signup"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Auth signup - {str(e)}")
            self.test_results["auth_signup"] = False
        
        # Test Auth Login - Success
        print("\n--- Testing POST /auth/login (valid credentials) ---")
        
        login_data = {
            "email": test_email,
            "password": test_password
        }
        
        try:
            status, response_text = await self.make_auth_request("POST", "/auth/login", login_data)
            
            if status is None:
                print(f"❌ FAILED: Auth login - {response_text}")
                self.test_results["auth_login_success"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_fields = ['user', 'token']
                    user_fields = ['id', 'name', 'email', 'streak', 'hearts']
                    
                    if all(field in data for field in required_fields):
                        user = data.get('user', {})
                        if all(field in user for field in user_fields) and 'password' not in user:
                            login_token = data.get('token')
                            print("✅ SUCCESS: Auth login working correctly")
                            print(f"   - User logged in: {user.get('name')} ({user.get('email')})")
                            print(f"   - Token received: {login_token[:10]}...")
                            # Use login token for session test
                            if not auth_token:
                                auth_token = login_token
                            self.test_results["auth_login_success"] = True
                        else:
                            print("❌ FAILED: Auth login - Invalid user object (missing fields or password exposed)")
                            self.test_results["auth_login_success"] = False
                    else:
                        print("❌ FAILED: Auth login - Missing user or token in response")
                        self.test_results["auth_login_success"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: Auth login - Invalid JSON response")
                    self.test_results["auth_login_success"] = False
            else:
                print(f"❌ FAILED: Auth login - Expected 200, got {status}")
                print(f"Response: {response_text}")
                self.test_results["auth_login_success"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Auth login - {str(e)}")
            self.test_results["auth_login_success"] = False
        
        # Test Auth Login - Wrong Password
        print("\n--- Testing POST /auth/login (wrong password) ---")
        
        wrong_login_data = {
            "email": test_email,
            "password": "WrongPassword123!"
        }
        
        try:
            status, response_text = await self.make_auth_request("POST", "/auth/login", wrong_login_data)
            
            if status == 401:
                print("✅ SUCCESS: Auth login correctly rejects wrong password")
                self.test_results["auth_login_wrong_password"] = True
            else:
                print(f"❌ FAILED: Auth login - Expected 401 for wrong password, got {status}")
                print(f"Response: {response_text}")
                self.test_results["auth_login_wrong_password"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Auth login wrong password - {str(e)}")
            self.test_results["auth_login_wrong_password"] = False
        
        # Test Auth Session - Valid Token
        if auth_token:
            print("\n--- Testing GET /auth/session (with valid token) ---")
            
            try:
                status, response_text = await self.make_auth_request("GET", "/auth/session", token=auth_token)
                
                if status is None:
                    print(f"❌ FAILED: Auth session - {response_text}")
                    self.test_results["auth_session_valid"] = False
                elif status == 200:
                    try:
                        data = json.loads(response_text)
                        required_fields = ['user']
                        user_fields = ['id', 'name', 'email', 'streak', 'hearts']
                        
                        if 'user' in data:
                            user = data.get('user', {})
                            if all(field in user for field in user_fields) and 'password' not in user:
                                print("✅ SUCCESS: Auth session working correctly")
                                print(f"   - User data retrieved: {user.get('name')} ({user.get('email')})")
                                self.test_results["auth_session_valid"] = True
                            else:
                                print("❌ FAILED: Auth session - Invalid user object (missing fields or password exposed)")
                                self.test_results["auth_session_valid"] = False
                        else:
                            print("❌ FAILED: Auth session - Missing user in response")
                            self.test_results["auth_session_valid"] = False
                    except json.JSONDecodeError:
                        print("❌ FAILED: Auth session - Invalid JSON response")
                        self.test_results["auth_session_valid"] = False
                else:
                    print(f"❌ FAILED: Auth session - Expected 200, got {status}")
                    print(f"Response: {response_text}")
                    self.test_results["auth_session_valid"] = False
                    
            except Exception as e:
                print(f"❌ ERROR: Auth session - {str(e)}")
                self.test_results["auth_session_valid"] = False
        
        # Test Auth Session - No Token
        print("\n--- Testing GET /auth/session (without token) ---")
        
        try:
            status, response_text = await self.make_auth_request("GET", "/auth/session")
            
            if status == 401:
                print("✅ SUCCESS: Auth session correctly rejects missing token")
                self.test_results["auth_session_no_token"] = True
            else:
                print(f"❌ FAILED: Auth session - Expected 401 for missing token, got {status}")
                print(f"Response: {response_text}")
                self.test_results["auth_session_no_token"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Auth session no token - {str(e)}")
            self.test_results["auth_session_no_token"] = False
    
    async def test_ai_endpoints(self):
        """Test AI-powered endpoints - ALL section types"""
        print("\n" + "="*50)
        print("Testing AI Generate Questions - ALL SECTION TYPES")
        print("="*50)
        
        # Test cases for ALL section types as requested
        ai_test_cases = [
            {
                "name": "TOEIC Reading",
                "data": {"examType": "TOEIC", "section": "reading", "count": 2},
                "key": "ai_generate_toeic_reading",
                "expected_fields": ["id", "type"]
            },
            {
                "name": "TOEIC Listening", 
                "data": {"examType": "TOEIC", "section": "listening", "count": 2},
                "key": "ai_generate_toeic_listening",
                "expected_fields": ["id", "type"]
            },
            {
                "name": "IELTS Reading",
                "data": {"examType": "IELTS", "section": "reading", "count": 2},
                "key": "ai_generate_ielts_reading", 
                "expected_fields": ["id", "type"]
            },
            {
                "name": "IELTS Listening",
                "data": {"examType": "IELTS", "section": "listening", "count": 2},
                "key": "ai_generate_ielts_listening",
                "expected_fields": ["id", "type"]
            },
            {
                "name": "IELTS Writing",
                "data": {"examType": "IELTS", "section": "writing", "count": 2},
                "key": "ai_generate_ielts_writing",
                "expected_fields": ["id", "type", "prompt", "task"],
                "type_check": "writing"
            },
            {
                "name": "IELTS Speaking",
                "data": {"examType": "IELTS", "section": "speaking", "count": 2}, 
                "key": "ai_generate_ielts_speaking",
                "expected_fields": ["id", "type", "question", "part"],
                "type_check": "speaking"
            }
        ]
        
        for test_case in ai_test_cases:
            print(f"\n--- Testing POST /ai/generate-questions ({test_case['name']}) ---")
            
            try:
                # Use longer timeout for AI generation (30 seconds as per request)
                original_timeout = self.session.timeout
                self.session = aiohttp.ClientSession(
                    connector=aiohttp.TCPConnector(ssl=False),
                    timeout=aiohttp.ClientTimeout(total=30),
                    headers={'Content-Type': 'application/json', 'User-Agent': 'Mydemy-Test-Client/1.0'}
                )
                
                status, response_text = await self.make_auth_request("POST", "/ai/generate-questions", test_case["data"])
                
                if status is None:
                    print(f"❌ FAILED: AI {test_case['name']} - {response_text}")
                    self.test_results[test_case["key"]] = False
                    continue
                    
                print(f"[RESPONSE] Status: {status}")
                if len(response_text) > 500:
                    print(f"[RESPONSE] Body: {response_text[:500]}...")
                else:
                    print(f"[RESPONSE] Body: {response_text}")
                
                if status == 200:
                    try:
                        data = json.loads(response_text)
                        required_fields = ['examType', 'section', 'questions']
                        
                        if all(field in data for field in required_fields):
                            questions = data.get('questions', [])
                            
                            # Verify response structure
                            if data.get('examType') == test_case["data"]["examType"] and data.get('section') == test_case["data"]["section"]:
                                
                                if isinstance(questions, list) and len(questions) > 0:
                                    # Validate each question structure 
                                    all_valid = True
                                    for i, question in enumerate(questions):
                                        missing_fields = [field for field in test_case["expected_fields"] if field not in question]
                                        if missing_fields:
                                            print(f"   ❌ Question {i+1} missing fields: {missing_fields}")
                                            all_valid = False
                                        
                                        # Check specific type requirements
                                        if "type_check" in test_case:
                                            if question.get("type") != test_case["type_check"]:
                                                print(f"   ❌ Question {i+1} has wrong type: expected '{test_case['type_check']}', got '{question.get('type')}'")
                                                all_valid = False
                                    
                                    if all_valid:
                                        print(f"✅ SUCCESS: AI {test_case['name']} working correctly")
                                        print(f"   - Generated {len(questions)} questions")
                                        print(f"   - ExamType: {data.get('examType')}, Section: {data.get('section')}")
                                        print(f"   - All questions have required fields: {test_case['expected_fields']}")
                                        if "type_check" in test_case:
                                            print(f"   - All questions have correct type: {test_case['type_check']}")
                                        self.test_results[test_case["key"]] = True
                                    else:
                                        print(f"❌ FAILED: AI {test_case['name']} - Invalid question structure")
                                        self.test_results[test_case["key"]] = False
                                else:
                                    print(f"❌ FAILED: AI {test_case['name']} - No questions generated or empty array")
                                    self.test_results[test_case["key"]] = False
                            else:
                                print(f"❌ FAILED: AI {test_case['name']} - Response examType/section mismatch")
                                print(f"   Expected: {test_case['data']['examType']}/{test_case['data']['section']}")
                                print(f"   Got: {data.get('examType')}/{data.get('section')}")
                                self.test_results[test_case["key"]] = False
                        else:
                            print(f"❌ FAILED: AI {test_case['name']} - Missing required response fields: {[f for f in required_fields if f not in data]}")
                            self.test_results[test_case["key"]] = False
                    except json.JSONDecodeError as e:
                        print(f"❌ FAILED: AI {test_case['name']} - Invalid JSON response: {str(e)}")
                        print(f"   Raw response: {response_text[:200]}...")
                        self.test_results[test_case["key"]] = False
                elif status == 400:
                    print(f"❌ FAILED: AI {test_case['name']} - API key not configured or validation error")
                    print(f"Response: {response_text}")
                    self.test_results[test_case["key"]] = False
                elif status == 500:
                    print(f"❌ FAILED: AI {test_case['name']} - Server error (likely AI API issue)")
                    print(f"Response: {response_text}")
                    self.test_results[test_case["key"]] = False
                else:
                    print(f"❌ FAILED: AI {test_case['name']} - Expected 200, got {status}")
                    print(f"Response: {response_text}")
                    self.test_results[test_case["key"]] = False
                    
            except Exception as e:
                print(f"❌ ERROR: AI {test_case['name']} - {str(e)}")
                self.test_results[test_case["key"]] = False
            
            # Small delay between AI requests to avoid rate limits
            await asyncio.sleep(1)
    
    async def test_admin_keys_endpoint(self):
        """Test admin API keys endpoint"""
        print("\n" + "="*50)
        print("Testing Admin Keys Endpoint")
        print("="*50)
        
        # Test GET /admin/keys
        print("\n--- Testing GET /admin/keys ---")
        
        try:
            status, response_text = await self.make_auth_request("GET", "/admin/keys")
            
            if status is None:
                print(f"❌ FAILED: Admin keys GET - {response_text}")
                self.test_results["admin_keys_get"] = False
            elif status == 200:
                try:
                    data = json.loads(response_text)
                    required_keys = ['gemini', 'googleTTS', 'elevenLabs', 'openAI']
                    
                    if all(key in data for key in required_keys):
                        # Validate that all values are booleans
                        all_booleans = all(isinstance(data[key], bool) for key in required_keys)
                        if all_booleans:
                            print("✅ SUCCESS: Admin keys GET working correctly")
                            print(f"   - API Keys status: {data}")
                            self.test_results["admin_keys_get"] = True
                        else:
                            print("❌ FAILED: Admin keys GET - Values should be booleans")
                            self.test_results["admin_keys_get"] = False
                    else:
                        print("❌ FAILED: Admin keys GET - Missing required keys")
                        self.test_results["admin_keys_get"] = False
                except json.JSONDecodeError:
                    print("❌ FAILED: Admin keys GET - Invalid JSON response")
                    self.test_results["admin_keys_get"] = False
            else:
                print(f"❌ FAILED: Admin keys GET - Expected 200, got {status}")
                print(f"Response: {response_text}")
                self.test_results["admin_keys_get"] = False
                
        except Exception as e:
            print(f"❌ ERROR: Admin keys GET - {str(e)}")
            self.test_results["admin_keys_get"] = False
    
    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Mydemy Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("="*70)
        
        await self.setup_session()
        
        try:
            # Run all test suites
            await self.test_root_endpoint()
            await self.test_auth_endpoints()
            await self.test_ai_endpoints() 
            await self.test_admin_keys_endpoint()
            await self.test_generate_exam_endpoint() 
            await self.test_lessons_endpoint()
            await self.test_progress_endpoints()
            await self.test_user_endpoints()
            
        finally:
            await self.cleanup_session()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*70)
        print("🏁 TEST RESULTS SUMMARY")
        print("="*70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test_name, result in self.test_results.items():
                if not result:
                    print(f"   - {test_name}")
        
        print("\n✅ PASSED TESTS:")
        for test_name, result in self.test_results.items():
            if result:
                print(f"   - {test_name}")
        
        print("\n" + "="*70)
        
        # Determine overall status
        critical_endpoints = [
            'auth_signup', 'auth_login_success', 'auth_session_valid',
            'ai_generate_toeic_reading', 'ai_generate_toeic_listening', 
            'ai_generate_ielts_reading', 'ai_generate_ielts_listening',
            'ai_generate_ielts_writing', 'ai_generate_ielts_speaking',
            'admin_keys_get', 'generate_exam_case_1', 'progress_post', 
            'progress_get', 'user_post_create', 'user_get_existing', 'lessons'
        ]
        
        critical_failures = [test for test in critical_endpoints if test in self.test_results and not self.test_results[test]]
        
        if not critical_failures:
            print("🎉 ALL CRITICAL BACKEND ENDPOINTS ARE WORKING!")
        else:
            print(f"⚠️  CRITICAL ENDPOINTS FAILING: {len(critical_failures)}")
            for failure in critical_failures:
                print(f"   - {failure}")

async def main():
    """Main test runner"""
    tester = MydemyAPITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())