import os
import json
import logging
from kafka import KafkaConsumer, KafkaProducer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC_SCAN_REQUESTS = 'scan.requests'
TOPIC_SCAN_RESULTS = 'scan.results'

def main():
    logger.info("Starting Scanner Engine...")
    
    # Initialize Kafka Consumer
    consumer = KafkaConsumer(
        TOPIC_SCAN_REQUESTS,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='scanner-engine-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    # Initialize Kafka Producer
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda x: json.dumps(x).encode('utf-8')
    )

    logger.info(f"Listening for messages on {TOPIC_SCAN_REQUESTS}...")

    for message in consumer:
        try:
            scan_job = message.value
            logger.info(f"Received scan job: {scan_job}")
            
            # Actual scanning logic
            scan_id = scan_job.get('scanId')
            target_url = scan_job.get('targetUrl')
            
            logger.info(f"Starting crawl for scan {scan_id} on {target_url}")
            from core.crawler import Crawler
            from modules.sqli import check_sqli
            
            crawler = Crawler(target_url, max_depth=2)
            urls = crawler.crawl()
            logger.info(f"Crawled {len(urls)} URLs")
            
            all_vulnerabilities = []
            for url in urls:
                logger.info(f"Scanning {url}...")
                vulns = check_sqli(url)
                all_vulnerabilities.extend(vulns)
            
            # Send result back
            result = {
                'scanId': scan_id,
                'status': 'COMPLETED',
                'vulnerabilities': all_vulnerabilities,
                'urls_scanned': len(urls)
            }
            
            producer.send(TOPIC_SCAN_RESULTS, value=result)
            logger.info(f"Sent result for scan {scan_id} with {len(all_vulnerabilities)} vulns")

        except Exception as e:
            logger.error(f"Error processing message: {e}")

if __name__ == '__main__':
    main()
