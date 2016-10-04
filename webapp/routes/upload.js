var express = require('express');

module.exports = function(req, res, next) {
  var uploaded;

  if (!req.files) {
      res.send('No files were uploaded.');
      return;
  }

  uploaded = req.files.file;

  uploaded.mv('tmp/' + uploaded.name, function(err) {
      if (err) {
          res.status(500).send(err);
      }
      else {
          res.send('File uploaded!');
      }
  });
};
