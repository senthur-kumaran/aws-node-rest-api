const AWS = require('aws-sdk')

const fetchData = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient()

    let data;

    try {
        const results = await dynamodb.scan({ TableName: "SchedulerTable" }).promise()
        data = results.Items
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