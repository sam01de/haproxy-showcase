from locust import HttpUser, task, between

class DirectAppUser(HttpUser):
    """User that tests direct app access bypassing HAProxy"""
    wait_time = between(1, 1)
    host = "http://app0:3000"
    
    @task(1)
    def test_direct_app_proxytest(self):
        """Test direct app access via /proxytest endpoint"""
        with self.client.get("/proxytest", name="Direct App: /proxytest") as response:
            if response.status_code == 200:
                pass  # Success 