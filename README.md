# google-api-batch-utils
Utility functions for creating request bodies and parsing batch responses for Google's REST APIs.

## Example usage

List the latest three messages in a user's inbox, and then get a snippet of each message
in a batch request to the Gmail API:

```js
var rp = require('request-promise');
var batchUtils = require('google-api-batch-utils');
var createBatchBody = batchUtils.createBatchBody;
var parseBatchResponse = batchUtils.parseBatchResponse;

var BOUNDARY = 'example_boundary';

rp({
  uri: 'https://www.googleapis.com/gmail/v1/users/me/messages',
  qs: { maxResults: 3 , fields: 'messages(id)'},
  headers: { Authorization: 'Bearer {API_KEY}'},
  json: true
}).then(function(response) {
  var uris = response.messages.map(function(item) {
    return {uri: '/gmail/v1/users/me/messages/' + item.id, qs: { fields: 'snippet'}};
  });

  var batchBody = createBatchBody(uris, BOUNDARY);
  return rp({
    method: 'POST',
    uri: 'https://www.googleapis.com/batch',
    headers: {
      Authorization: 'Bearer {API_KEY}' ,
      'Content-Type': 'multipart/mixed; boundary="' + BOUNDARY + '"'
    },
    body: batchBody
  });
}).then(parseBatchResponse)
  .then(console.log.bind(console));
// => 
// [ 
//   { snippet: 'Numberphile has uploaded The iPhone of Slide Rules - Numberphile Thanks Audible: http://www....' },
//   { snippet: 'Feel the bern' },
//   { snippet: 'See what is new with your LinkedIn connections...' } 
// ]

```

## API


```js
/**
* Takes an array of API call objects and generates a string that can be used
* as the body in a call to Google batch API.
* @param  {object[]} apiCalls
* @param  {string}   apiCalls[].uri      - Uri of the API call.
* @param  {string}   apiCalls[].[method] - Optional HTTP method. Defaults to GET.
* @param  {object}   apiCalls[].[qs]     - Optional object with querystring parameters.
* @param  {string}   apiCalls[].[body]   - Optional request body string.
* @param  {string}   boundary            - String that delimits the calls.
* @return {string}
*/
createBatchBody(apiCalls, boundary);

/**
* Parses a raw string response from the Google batch API into objects.
* @param  {string} response
* @return {object[]}
*/
parseBatchResponse(response);
```

## Licence
MIT
