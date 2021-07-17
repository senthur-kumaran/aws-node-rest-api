require('dotenv').config()
const { v4 } = require('uuid')
const AWS = require('aws-sdk')
const db = require('serverless-mysql')({
  config: {
    host: process.env.ENDPOINT,
    port: process.env.PORT,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  }
});

myTestFunction = async (event, context) => {
  var d = new Date();
  d.setMonth(d.getMonth() - 1);
  const results = await db.query(`
    SELECT
      s.id as student_id,
      s.first_name as student_first_name,
      s.last_name as student_last_name,
      s.email as student_email,
      con.name as student_country_name,
      u.id as user_id,
      u.first_name as user_first_name,
      u.last_name as user_last_name,
      u.email as user_email,
      cs.shortlisted_date,
      c.id as course_id,
      c.name as course_name,
      i.id as institution_id,
      i.name as institution_name
    FROM students s
    JOIN course_student_shortlist cs ON cs.student_id = s.id
    JOIN student_user su ON su.student_id = s.id
    JOIN users u ON u.id = su.user_id
    JOIN courses c ON c.id = cs.course_id
    JOIN institutions i ON i.id = c.institution_id
    JOIN countries con ON con.id = s.country_id
    JOIN campaigns_breakout_view cbv ON cbv.course_id = c.id
    WHERE
      su.contact_flag = 1 AND
      cs.shortlisted_date > ? AND
      cbv.type = "Guaranteed Interview" AND
      cbv.start_date <= ? AND
      cbv.end_date > ? AND
      cbv.source_country_id = s.country_id
  `, [d, new Date(), new Date()]);
  await db.end();
  if (results) {
    const dynamodb = new AWS.DynamoDB.DocumentClient()
    const ses = new AWS.SES()

    const createdAt = new Date().toDateString()
    const id = v4()

    console.log("This is an id", id)

    const addData = {
        id,
        results,
        createdAt,
        completed: false
    }

    var to = [];
    results.forEach( (result) => {
      to.push(result.user_email)
    });

    const params = {
      Destination: {
          ToAddresses: to
      },
      Message: {
          Body: {
              Text: { Data: "Hi there, this is a message sent through my API" }
          },
          Subject: { Data: "Test Email" }
      },
      Source: "senthurkumaran2014@gmail.com"
    }

    try {
      await dynamodb.put({
          TableName: "SchedulerTable",
          Item: addData
      }).promise()

      await ses.sendEmail(params).promise()

      return {
          statusCode: 200,
          body: JSON.stringify({
              message: "Email sent successfully!",
              data: addData
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
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No results found.'
      })
    }
  }
}

module.exports = {
  handler: myTestFunction
}