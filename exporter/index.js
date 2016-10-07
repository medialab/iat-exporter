var converter = require('json-2-csv').json2csv;
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

    var results = [];
    var errors = [];
    var metadata = [
      ['Player.id_in_group', 'Participant.code', 'Participant.label', 'Participant.time_started', 'Trials order', 'Error percentage', 'Platform']
    ];

    var entries = data.split('\n').map(function (elm, i) {
      if (i > 0) {
        var match = elm.match(/,"({".*)"}",/gm);
        var json = match && match.length === 1 ? JSON.parse(match[0].substr(2).substr(0, match[0].length - 4)) : '';
        var r = elm.substr(0, elm.indexOf('"')).split(',');
        var meta = LOOKUP_INDICES.map(function (idx) {
          if (typeof r[idx] != 'undefined' && r[idx] !== '') return r[idx]
        }).clean();

        // Check if we have data for the 4 first columns in metadata.
        if (meta.length === 4) {
          metadata.push(meta);
        }
      }
    });

    // console.log(metadata);

    return cb(null, entries);

    //var results =

    /*try {
      var result = converter(entries, function (err, csv) {
        // console.log(csv);
        //return cb(null, csv);
      });
    } catch (err) {
      console.log(err)
      return cb(err, null);
    }*/
  });
};
