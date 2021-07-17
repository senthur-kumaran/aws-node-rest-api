const AWS = require('aws-sdk')

const updateData = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient()

    const { completed } = JSON.parse(event.body)
    const { id } = event.pathParameters

    await dynamodb.update({
        TableName: "SchedulerTable",
        Key: { id },
        UpdateExpression: 'set completed = :completed',
        ExpressionAttributeValues: {
            ':completed': completed
        },
        ReturnValues: "ALL_NEW"
    }).promise()

    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "This data updated!"
        })
    }
}

module.exports = {
    handler: updateData
}