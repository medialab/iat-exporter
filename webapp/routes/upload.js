var express = require('express');
var exporter = require('../../exporter');

module.exports = function(req, res, next) {
  var uploaded;
  var filepath;

  if (!req.files) {
      res.send('No files were uploaded.');
      return;
  }

  uploaded = req.files.file;

  filepath = 'tmp/' + uploaded.name;

  uploaded.mv(filepath, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        exporter(filepath, function (err, data) {
          if (err) {
            res.status(500).send(err);
          } else {
            console.log(data);
            res.status(200);
          }
        });
      }
  });
};
