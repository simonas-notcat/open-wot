import { NowRequest, NowResponse } from '@now/node'
const { text } = require('micro')
const { parse } = require('querystring')

module.exports = async (req: NowRequest, res: NowResponse) => {
  // Parse code received through req
  const body = parse(await text(req))
  console.log(body)

  const message = 'HELLOO' + body.text
  const response_type = 'in_channel'

  res.writeHead(200, { 'Content-Type': 'application/json' })
  // Create response object and send result back to Slack
  res.end(JSON.stringify({ response_type, text: message }))
}

// import { NowRequest, NowResponse } from '@now/node'
// import { createMessageAdapter } from '@slack/interactive-messages'
// const secret = process.env.SLACK_SIGNING_SECRET || ''


// class ResponseAdapter {
//   private callback: any
//   private headers: any
//   private _statusCode: any

//   constructor(callback: any) {
//     this.callback = callback;
//     this.headers = {};
//     this._statusCode = 200;
//   }

//   set statusCode(val: any) {
//     this._statusCode = val;
//   }

//   setHeader(key: any, val: any) {
//     this.headers[key] = val;
//   }
//   end(content: any) {
//     const data = {
//       status: this._statusCode,
//       json: content,
//       headers: this.headers,
//     };
//     this.callback(data);
//   }
// }

// module.exports = async (req: NowRequest) => {

// const slackInteractions = createMessageAdapter(secret)
// console.log('AAAAAAA', req.headers)



// slackInteractions.action({ }, (payload: any) => {
//   console.log(payload)
//   return {
//     text: 'Thanks!',
//   }
// })

// const customResponseCreator = (status: any, json: any, headers: any) => {
//   // create and process the response I actually need to send
//   console.log({status, headers, json})
// };

// const listener = slackInteractions.requestListener()

// const res = new ResponseAdapter(customResponseCreator);
// const body = req.body.payload
// listener({headers: req.headers, rowBody: Buffer.from(body, 'utf-8')} as any, res as any)
// }