from locust import HttpUser, task, between

class HAProxyLoadBalancerUser(HttpUser):
    """User that tests HAProxy load balancing functionality"""
    wait_time = between(1, 1)
    host = "http://haproxy:80"
    
    @task(1)
    def test_proxy_load_balancing(self):
        """Test HAProxy load balancing via /proxytest endpoint"""
        with self.client.get("/proxytest", name="HAProxy: /proxytest") as response:
            if response.status_code == 200:
                pass  # Success 