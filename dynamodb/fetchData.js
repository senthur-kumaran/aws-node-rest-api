const AWS = require('aws-sdk')

const fetchData = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient()
    const { id } = event.pathParameters

    let data;

    try {
        const result = await dynamodb.get({
            TableName: "SchedulerTable",
            Key: { id }
        }).promise()
        data = result.Item
    } catch (error) {
        console.log(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    }
}

module.exports = {
    handler: fetchData
}