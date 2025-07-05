#!/bin/bash

URL="http://localhost/proxytest?distributedelay=true"
CONCURRENT_PROCESSES=5
REQUESTS_PER_PROCESS=10
TOTAL_REQUESTS=$((CONCURRENT_PROCESSES * REQUESTS_PER_PROCESS))
OUTPUT_FILE="/tmp/test_results_$$.txt"

echo "Starting $CONCURRENT_PROCESSES concurrent processes, each sending $REQUESTS_PER_PROCESS sequential requests..."
echo "Total requests: $TOTAL_REQUESTS"
echo "========================================================================"

# Clear the output file
> "$OUTPUT_FILE"

start_time=$(date +%s%3N)

# Function for a single process to make sequential requests
make_sequential_requests() {
    local process_id=$1
    local process_output_file="/tmp/process_${process_id}_$$.txt"
    
    for i in $(seq 1 $REQUESTS_PER_PROCESS); do
        local request_id="P${process_id}-${i}"
        
        # Make the request and wait for response
        response=$(curl -s -w "Status: %{http_code}, Time: %{time_total}s" -o /dev/stdout "$URL")
        
        echo "Process $process_id, Request $i: $response"
        echo "Process $process_id, Request $i: $response" >> "$process_output_file"
    done
    
    # Append process results to main output file
    cat "$process_output_file" >> "$OUTPUT_FILE"
    rm -f "$process_output_file"
}

# Launch concurrent processes
for process_id in $(seq 1 $CONCURRENT_PROCESSES); do
    make_sequential_requests $process_id &
done

# Wait for all background processes to complete
wait

# Small delay to ensure all file writes are complete
sleep 0.1

end_time=$(date +%s%3N)
total_time=$((end_time - start_time))

echo "========================================================================"
echo "Completed $TOTAL_REQUESTS requests in ${total_time}ms"
echo "Average time per request: $((total_time / TOTAL_REQUESTS))ms"
echo ""
echo "App Instance Usage Summary:"
echo "========================================================================"

# Count directly using grep
declare -A app_counts
for i in {1..5}; do
    count=$(grep -o "Serving app instance: $i" "$OUTPUT_FILE" | wc -l)
    app_counts[$i]=$count
done

# Display results
for i in {1..5}; do
    percentage=$(echo "scale=1; ${app_counts[$i]} * 100 / $TOTAL_REQUESTS" | bc -l)
    echo "App $i: ${app_counts[$i]} requests (${percentage}%)"
done
echo "========================================================================"

# Clean up
rm -f "$OUTPUT_FILE" 