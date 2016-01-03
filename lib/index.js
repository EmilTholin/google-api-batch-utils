var querystring = require('querystring');

function parsePart(part) {
  var p = part.substring(part.indexOf("{"), part.lastIndexOf("}") + 1);
  return JSON.parse(p);
}

module.exports = {
  createBatchBody: function(apiCalls, boundary) {
    var batchBody = [];

    apiCalls.forEach(function(call) {
      var method = call.method || 'GET';
      var uri = call.uri;
      if (call.qs) {
        uri += '?' + querystring.stringify(call.qs);
      }
      var body = '\r\n';
      if (call.body) {
        body = [
          'Content-Type: application/json', '\r\n\r\n',

           JSON.stringify(call.body), '\r\n'
        ].join('');
      }

      batchBody = batchBody.concat([
        '--', boundary, '\r\n',
        'Content-Type: application/http', '\r\n\r\n',

        method, ' ', uri, '\r\n',
        body
      ]);
    });

    return batchBody.concat(['--', boundary, '--']).join('');
  },

  parseBatchResponse: function(response) {
    // Not the same delimiter in the response as was specified in the request,
    // so we have to extract it.
    var delimiter = response.substr(0, response.indexOf('\r\n'));
    var parts = response.split(delimiter);
    // The first part will always be an empty string. Just remove it.
    parts.shift();
    // The last part will be the "--". Just remove it.
    parts.pop();

    var result = [];
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      try {
        result.push(parsePart(part));
      } catch (e) {
        // A Google API error will contain a JSON response with an array 'errors'.
        // If the parsing should fail, we mimic this.
        result.push({ errors: [{ message: part }] });
      }
    }

    return result;
  }
};
