import { NowRequest, NowResponse } from '@now/node'
const { parse, stringify } = require('querystring')
import fetch from 'node-fetch'

module.exports = async (req: NowRequest, res: NowResponse) => {
  // Extract code received on the request url
  const urlQueryString = req?.url?.replace(/^.*\?/, '')
  const code = parse(urlQueryString).code

  // Compose authHeader by encoding the string \${client_id}:\${client_secret}
  const client_id = process.env.SLACK_CLIENT_ID
  const client_secret = process.env.SLACK_CLIENT_SECRET
  console.log({client_id, client_secret})
  const Authorization =
    'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')

  // Hit oauth.access for access_token
  const oauthAccess = await fetch('https://slack.com/api/oauth.access', {
    method: 'POST',
    body: stringify({ code }),
    headers: {
      Authorization,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const response = await oauthAccess.json()
  console.log('SLACK RESPONSE', response)

  if (response?.ok) {
    // Hit auth.test for slack domain
    const authTest = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${response.access_token}`
      }
    })
    const { url: slackUrl } = await authTest.json()
  
    // Send redirect response to slack domain
    res.writeHead(302, 'Redirect', { Location: slackUrl })
    res.end()

  } else {
    res.send('Something went wrong ' + JSON.stringify(response))
  }
}