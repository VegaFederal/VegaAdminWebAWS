import json
import os
import boto3
import logging
from botocore.config import Config

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Configure boto3 with longer timeouts and more retries for VPC environment
boto_config = Config(
    connect_timeout=10,
    read_timeout=10,
    retries={'max_attempts': 4})

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', config=boto_config)

# Environment variables (set in CloudFormation)
EXISTING_TABLE = os.environ.get('EXISTING_TABLE', 'vega-web-contact-table-dev-dev')

def get_all_data_handler(event):
    """Get all data from the existing DynamoDB table for display on the webpage."""
    logger.info(f"Processing get all data request: {json.dumps(event)}")
    try:
        # Log environment variables
        logger.info(f"EXISTING_TABLE: {EXISTING_TABLE}")
        logger.info(f"AWS_REGION: {os.environ.get('AWS_REGION', 'not set')}")
        
        # Get the table reference
        table = dynamodb.Table(EXISTING_TABLE)
        
        # Scan the table to get all items
        logger.info(f"Scanning table: {EXISTING_TABLE}")
        response = table.scan()
        
        # Get all items from the response
        items = response['Items']
        logger.info(f"Retrieved {len(items)} items from table")
        
        # Handle pagination if there are more items
        while 'LastEvaluatedKey' in response:
            logger.info("More items available, continuing scan...")
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
            logger.info(f"Total items retrieved: {len(items)}")
        
        # Log a sample of the data (first 2 items) for debugging
        if items:
            logger.info(f"Sample data: {json.dumps(items[:2], indent=2)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Data retrieved successfully',
                'count': len(items),
                'data': items
            })
        }
    except Exception as e:
        logger.error(f"Error retrieving data: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to retrieve data: {str(e)}'})
        }

def update_application_handler(event):
    """Update an application's status in the existing DynamoDB table."""
    logger.info(f"Processing application update: {json.dumps(event)}")
    try:
        # Log environment variables
        logger.info(f"EXISTING_TABLE: {EXISTING_TABLE}")
        
        # Parse the request body
        update_data = json.loads(event['body'])
        application_id = update_data.get('id')
        
        if not application_id:
            logger.warning("Missing application ID")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Application ID is required'})
            }
        
        # Get the table reference
        table = dynamodb.Table(EXISTING_TABLE)
        
        # Update the item in DynamoDB
        update_expression = "SET "
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        # Build update expression dynamically
        update_fields = []
        for key, value in update_data.items():
            if key != 'id':  # Skip the ID field
                attr_name = f"#{key}"
                attr_value = f":{key}"
                update_fields.append(f"{attr_name} = {attr_value}")
                expression_attribute_names[attr_name] = key
                expression_attribute_values[attr_value] = value
        
        update_expression += ", ".join(update_fields)
        
        logger.info(f"Updating application {application_id} with expression: {update_expression}")
        
        response = table.update_item(
            Key={'id': application_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )
        
        logger.info(f"Update response: {json.dumps(response)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Application updated successfully',
                'updatedItem': response.get('Attributes', {})
            })
        }
    except Exception as e:
        logger.error(f"Error updating application: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to update application: {str(e)}'})
        }

def lambda_handler(event, context):
    """Lambda handler receives the request from the html page and process the request."""
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Handle OPTIONS preflight requests for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'message': 'OK'})
        }
    
    path = event.get('path', '')
    
    if path == '/api/get-all-data':
        return get_all_data_handler(event)
    elif path == '/api/update-application':
        return update_application_handler(event)
    else:
        logger.warning(f"Invalid path requested: {path}")
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Not found'})
        }