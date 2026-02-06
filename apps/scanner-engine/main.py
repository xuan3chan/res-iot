import json
import os
import time
import logging
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv

load_dotenv()

# Configuration
KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC_Scan_CREATED = 'scan.created'
TOPIC_SCAN_STATUS = 'scan.status'
TOPIC_SCAN_COMPLETED = 'scan.completed'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_mock_scan(target_url, profile):
    logger.info(f"Starting mock scan for {target_url} with profile {profile}")
    time.sleep(5) # Simulate work
    
    # Mock findings
    vulnerabilities = [
        {
            "name": "X-Frame-Options Header Not Set",
            "severity": "MEDIUM",
            "description": "The X-Frame-Options header is not set.",
            "solution": "Set X-Frame-Options to DENY or SAMEORIGIN"
        }
    ]
    
    if "admin" in target_url:
        vulnerabilities.append({
            "name": "Admin Portal Exposed",
            "severity": "HIGH",
            "description": "Admin portal detected publically.",
            "solution": "Restrict access to admin portal"
        })
        
    return vulnerabilities

def main():
    logger.info("Starting Scanner Engine...")
    
    # Initialize Kafka
    consumer = KafkaConsumer(
        TOPIC_Scan_CREATED,
        bootstrap_servers=[KAFKA_BROKER],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='scanner-engine-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda x: json.dumps(x).encode('utf-8')
    )
    
    logger.info(f"Listening on topic {TOPIC_Scan_CREATED}...")
    
    for message in consumer:
        try:
            data = message.value
            scan_id = data.get('scanId')
            target_url = data.get('targetUrl')
            profile = data.get('profile')
            
            logger.info(f"Received scan job: {scan_id} for {target_url}")
            
            # Update status to RUNNING
            producer.send(TOPIC_SCAN_STATUS, {'scanId': scan_id, 'status': 'RUNNING'})
            
            # Run Scan
            vulnerabilities = run_mock_scan(target_url, profile)
            
            # Complete
            result = {
                'scanId': scan_id,
                'status': 'COMPLETED',
                'vulnerabilities': vulnerabilities
            }
            
            producer.send(TOPIC_SCAN_COMPLETED, result)
            logger.info(f"Scan {scan_id} completed. Found {len(vulnerabilities)} vulnerabilities.")
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")

if __name__ == "__main__":
    main()
