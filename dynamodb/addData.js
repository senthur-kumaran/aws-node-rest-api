const { v4 } = require('uuid')
const AWS = require('aws-sdk')

const addData = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient()

    const { data } = JSON.parse(event.body)
    const createdAt = new Date().toDateString()
    const id = v4()

    console.log("This is an id", id)

    const addData = {
        id,
        data,
        createdAt,
        completed: false
    }

    await dynamodb.put({
        TableName: "SchedulerTable",
        Item: addData
    }).promise()

    return {
        statusCode: 200,
        body: JSON.stringify(addData)
    }
}

module.exports = {
    handler: addData
}