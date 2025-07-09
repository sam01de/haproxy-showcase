# HAProxy Showcase

A hands-on demonstration project showcasing HAProxy load balancing capabilities. This project runs multiple containerized Express.js servers to demonstrate various load balancing algorithms, routing rules, and performance characteristics.

## Project Overview

This showcase includes:
- **6 Node.js Express applications** (app0-app5) running in Docker containers, all limited in their ressources. 
- **HAProxy load balancer** managing traffic to app1-app5
- **app0** runs standalone for comparison (direct access)
- **Locust load testing** tools for performance comparison
- **HAProxy stats dashboard** for monitoring
- **Test scripts** for distribution analysis

## Architecture

```
                                                   
┌─────────────────┐            
│                 │            ┌─────────────────┐
│  HAProxy :80    │───────────▶│  app1:3000      │
│                 │            ├─────────────────┤
│  Load Balances  │───────────▶│  app2:3000      │
│  Backend Pool   │            ├─────────────────┤
│                 │───────────▶│  app3:3000      │
│  Stats :8404    │            ├─────────────────┤
│                 │───────────▶│  app4:3000      │
│                 │            ├─────────────────┤
│                 │───────────▶│  app5:3000      │
└─────────────────┘            └─────────────────┘ 
       |
       |
┌─────────────────┐
│ Locust HAProxy  │
│    :8090        │
└─────────────────┘

┌─────────────────┐            
│ Locust Direct   │            
│    :8089        │            
└─────────────────┘   
        |
┌─────────────────┐
│  app0:3000      │
│  (Direct)       │
└─────────────────┘
```

## Setup

### Prerequisites
- Docker and Docker Compose
- `curl` (for testing scripts)
- `bc` calculator (for shell script calculations)

### Quick Start

1. **Clone and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

3. **Check HAProxy stats dashboard:**
   ```
   http://localhost:8404
   ```

## Testing & Experimentation

### A) Load Testing with Locust

Compare performance between direct access and load-balanced access:

**Direct App Testing (bypasses HAProxy):**
- Web UI: http://localhost:8089
- Target: app0 directly
- Shows baseline performance

**HAProxy Load Balanced Testing:**
- Web UI: http://localhost:8090  
- Target: HAProxy load balancer
- Shows distributed load performance

**How to use:**
1. Open both Locust web interfaces
2. Start tests with same parameters (e.g., 100 users, 10 spawn rate)
3. Compare response times, throughput, and error rates
4. HAProxy should show better performance under high load due to distribution

### B) Load Balancing Algorithms

Test different algorithms by modifying `haproxy.cfg`:

1. **Round Robin (default):**
   ```haproxy
   backend apps
       balance roundrobin
   ```

2. **Least Connections:**
   ```haproxy
   backend apps
       balance leastconn
   ```

3. **Source IP Hash:**
   ```haproxy
   backend apps
       balance source
   ```

**Testing in Browser/Postman:**
- URL: `http://localhost/proxytest`
- Watch the `"Serving app instance"` number change
- Round robin: Sequential rotation (1→2→3→4→5→1...)
- Least connections: Routes to server with fewest active connections
- Source: Same client IP always goes to same server

**To change algorithms:**
```bash
# Edit haproxy.cfg
nano haproxy.cfg

# Restart HAProxy
docker-compose restart haproxy
```

### C) Distribution Analysis Script

Run the shell script to see request distribution:

```bash
chmod +x test-requests.sh
./test-requests.sh
```

**What it does:**
- Sends 100 concurrent requests (10 processes × 10 requests each)
- Shows which app instance handled each request
- Provides percentage distribution summary
- Demonstrates load balancing effectiveness

**Example output:**
```
App 1: 20 requests (20.0%)
App 2: 20 requests (20.0%)
App 3: 20 requests (20.0%)
App 4: 20 requests (20.0%)
App 5: 20 requests (20.0%)
```

### D) High Availability Testing

Simulate server failures to see HAProxy's resilience:

1. **Kill one application:**
   ```bash
   docker stop haproxy-showcase-app3
   ```

2. **Monitor HAProxy stats:**
   - Visit http://localhost:8404
   - Watch app3 status change to DOWN
   - See traffic redistribute to remaining servers

3. **Test continued functionality:**
   ```bash
   curl http://localhost/proxytest
   # Should still work, traffic goes to app1,2,4,5
   ```

4. **Restart the failed service:**
   ```bash
   docker start haproxy-showcase-app3
   ```
   - Watch it come back online in stats dashboard
   - Traffic automatically includes it again

### E) Advanced Routing Features

**Admin Endpoint Blocking:**
```bash
curl http://localhost/proxytest/admin
# Returns: HTTP 403 Forbidden (blocked by HAProxy)
```

**Server-Specific Routing:**
```bash
curl http://localhost/proxytest/server5
# Always routes to app5, regardless of load balancing algorithm
```

### F) Performance with Delayed Responses

Test load balancing with servers having different response times:

```bash
curl "http://localhost/proxytest?distributedelay=true"
```

- Each app instance adds delay based on its number (app1: 200ms, app2: 400ms, etc.)
- Shows how `leastconn` algorithm handles servers with different performance characteristics
- Compare with `roundrobin` to see the difference

## Configuration Files

### Key Files
- **`haproxy.cfg`** - HAProxy configuration with load balancing rules
- **`compose.yaml`** - Docker Compose setup for all services
- **`index.js`** - Node.js Express application
- **`locustfile-*.py`** - Load testing configurations
- **`test-requests.sh`** - Distribution analysis script

### HAProxy Features Demonstrated
- Multiple load balancing algorithms
- Health checks and automatic failover
- Path-based routing and ACLs
- Request blocking and filtering
- Statistics and monitoring
- Backend server weighting

## Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Direct App | http://localhost:3000 | Bypass HAProxy |
| HAProxy | http://localhost | Load balanced access |
| HAProxy Stats | http://localhost:8404 | Monitoring dashboard |
| Locust Direct | http://localhost:8089 | Direct app load testing |
| Locust HAProxy | http://localhost:8090 | HAProxy load testing |

## Cleanup

Stop and remove all containers:
```bash
docker-compose down
```

Remove all images:
```bash
docker-compose down --rmi all
```

## Experiment Ideas

1. **Compare algorithms** under different load patterns
2. **Add custom health checks** for specific endpoints
3. **Implement sticky sessions** for stateful applications
4. **Test SSL termination** with HTTPS
5. **Configure rate limiting** to prevent abuse
6. **Set up geographic routing** based on headers
7. **Implement circuit breaker patterns** for resilience

## Learning Objectives

- Understand load balancing concepts and algorithms
- Learn HAProxy configuration syntax and features
- Experience high availability and failover scenarios
- Compare performance characteristics of different setups
- Practice monitoring and troubleshooting load balancers

---

**Happy Load Balancing!** 🚀

For more complex configurations, check out `haproxy-complex-example.txt` which demonstrates advanced features like SSL termination, rate limiting, and geographic blocking. 