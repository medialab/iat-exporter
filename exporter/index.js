var converter = require('json-2-csv').json2csv;
var async = require ('async');
var fs = require('fs');

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

module.exports = function (filepath, cb) {
  fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err)
    }

    data = data.split('""').join('"');

    var LOOKUP_INDICES = [15, 1, 2, 10];

    var results = [
      ['Trial ID', 'Code', 'Label', 'Time started', 'Left category', 'Right category', 'Stimuli word', 'Correct position', 'Correct category', 'Time taken']
    ];
    var errors = [];
    var metadata = [
      ['Player.id_in_group', 'Participant.code', 'Participant.label', 'Participant.time_started', 'Trials order', 'Error percentage', 'Platform']
    ];

    var entries = data.split('\n').map(function (elm, i) {
      if (i > 0) {
        var match = elm.match(/,"({".*)"}",/gm);
        var json = match && match.length === 1 ? JSON.parse(match[0].substr(2).substr(0, match[0].length - 4)) : '';

        if (json) {
          var rawResults = json.results;
          var rawErrors = json.errors;

          var r = elm.substr(0, elm.indexOf('"')).split(',');
          var meta = LOOKUP_INDICES.map(function (idx) {
            if (typeof r[idx] != 'undefined' && r[idx] !== '') return r[idx]
          }).clean();

          // Check if we have data for the 4 first columns in metadata.
          // Store if we do, after getting trials order, error percentage and platform
          // from the rest of the data.
          if (meta.length === 4) {
            meta.push(json.error_percentage, json.platform);
            metadata.push(meta);
          }

          // Results / Errors.
          var participantCode = meta[1];
          var participantLabel = meta[2];
          var participantTimeStarted = meta[3];

          results = results.concat(rawResults.map(function (r, i) {
            return [
              i, participantCode, participantLabel, participantTimeStarted, r.left, r.right,
              r.stimuli, r.correctPosition, r.correctCategory, r.timing
            ]
          }));

          errors = errors.concat(rawErrors.map(function (r, i) {
            return [
              i, participantCode, participantLabel, participantTimeStarted, r.left, r.right,
              r.stimuli, r.correctPosition, r.correctCategory, r.timedOut, r.timing
            ]
          }));
        }
      }
    });

    return cb(null, {metadata: metadata, results: results, errors: errors});

    //var results =

    async.series({
      metadata: function (callback) {
        converter(metadata, function (err, csv) {
          fs.writeFile('IAT_metadata.csv', csv, function (err) {
            if (err) {
              console.log(err);
              callback(err);
            }
            callback(null, 'IAT_metadata.csv')
          })
        })
      },
      results: function (callback) {
        converter(metadata, function (err, csv) {
          fs.writeFile('IAT_results.csv', csv, function (err) {
            if (err) {
              console.log(err);
              callback(err);
            }
            callback(null, 'IAT_results.csv')
          })
        })
      },
      errors: function (callback) {
        converter(metadata, function (err, csv) {
          fs.writeFile('IAT_errors.csv', csv, function (err) {
            if (err) {
              console.log(err);
              callback(err);
            }
            callback(null, 'IAT_errors.csv')
          })
        })
      }
    }, function (err, results) {
      if (err) {
        console.log(err);
        return cb(err);
      }

      console.log(results);
      return cb(null, results);
    });
  });
};
