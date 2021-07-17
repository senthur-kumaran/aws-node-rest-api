const AWS = require('aws-sdk')

const sendEmail = async (event) => {
    const ses = new AWS.SES()
    const { to, from, subject, text } = JSON.parse(event.body)

    if (!to || !from || !subject || !text) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "to, from, subject and text are all required in the body"
            })
        }
    }

    const params = {
        Destination: {
            ToAddresses: [ to ]
        },
        Message: {
            Body: {
                Text: { Data: text }
            },
            Subject: { Data: subject }
        },
        Source: from
    }

    try {
        await ses.sendEmail(params).promise()
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Email sent successfully!"
            })
        }
    } catch (error) {
        console.log('error sending emai ', error)
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: error
            })
        }
    }
}


module.exports = {
    handler: sendEmail
}