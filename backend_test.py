import requests
import sys
import json
from datetime import datetime

class LinkedInPostGeneratorTester:
    def __init__(self, base_url="https://linkpost-wizard.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=70):
        """Run a single API test with extended timeout for n8n webhook"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}, Response: {json.dumps(response_data, indent=2)[:200]}..."
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}..."
            else:
                try:
                    error_data = response.json()
                    details = f"Expected {expected_status}, got {response.status_code}. Error: {error_data}"
                except:
                    details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}..."

            return self.log_test(name, success, details), response

        except requests.exceptions.Timeout:
            details = f"Request timed out after {timeout} seconds"
            return self.log_test(name, False, details), None
        except Exception as e:
            details = f"Error: {str(e)}"
            return self.log_test(name, False, details), None

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "api/",
            200
        )

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test GET status (should return empty list initially)
        success1, _ = self.run_test(
            "Get Status Checks",
            "GET", 
            "api/status",
            200
        )

        # Test POST status
        test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        success2, response = self.run_test(
            "Create Status Check",
            "POST",
            "api/status", 
            200,
            data=test_data
        )

        return success1 and success2

    def test_generate_post_validation(self):
        """Test generate endpoint with invalid data"""
        # Test with missing blog_url
        success1, _ = self.run_test(
            "Generate Post - Missing URL",
            "POST",
            "api/generate",
            422,  # FastAPI validation error
            data={}
        )

        # Test with invalid URL format
        success2, _ = self.run_test(
            "Generate Post - Invalid URL",
            "POST", 
            "api/generate",
            422,  # Should fail validation or return error
            data={"blog_url": "not-a-valid-url"}
        )

        return success1 and success2

    def test_generate_post_real_webhook(self):
        """Test generate endpoint with real n8n webhook call"""
        # Use a real blog URL for testing
        test_url = "https://blog.openai.com/chatgpt/"
        
        print(f"\n🚀 Testing real n8n webhook integration with URL: {test_url}")
        print("   This may take 30-60 seconds...")
        
        success, response = self.run_test(
            "Generate Post - Real Webhook",
            "POST",
            "api/generate", 
            200,
            data={"blog_url": test_url},
            timeout=70  # Extended timeout for webhook
        )

        if success and response:
            try:
                data = response.json()
                # Verify response structure
                required_fields = ['post_body', 'hashtags', 'full_post']
                has_all_fields = all(field in data for field in required_fields)
                
                if has_all_fields:
                    print(f"   ✅ Response has all required fields: {required_fields}")
                    print(f"   📝 Post body length: {len(data.get('post_body', ''))}")
                    print(f"   🏷️  Hashtags: {data.get('hashtags', '')[:100]}...")
                else:
                    print(f"   ❌ Missing fields. Got: {list(data.keys())}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error parsing response: {e}")
                return False

        return success

    def test_cors_headers(self):
        """Test CORS configuration"""
        try:
            response = requests.options(f"{self.base_url}/api/", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            details = f"CORS Headers: {cors_headers}"
            # CORS should allow all origins based on backend config
            success = response.headers.get('Access-Control-Allow-Origin') == '*'
            return self.log_test("CORS Configuration", success, details)
            
        except Exception as e:
            return self.log_test("CORS Configuration", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting LinkedIn Post Generator Backend Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print("=" * 60)

        # Test basic API functionality
        self.test_api_root()
        self.test_status_endpoints()
        
        # Test CORS
        self.test_cors_headers()
        
        # Test generate endpoint validation
        self.test_generate_post_validation()
        
        # Test real webhook integration (this is the critical test)
        self.test_generate_post_real_webhook()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed. Check details above.")
            
        return self.tests_passed == self.tests_run

def main():
    tester = LinkedInPostGeneratorTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%",
                'timestamp': datetime.now().isoformat()
            },
            'test_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())