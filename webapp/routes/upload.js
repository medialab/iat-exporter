var Upload = require('upload-file');
var express = require('express');

module.exports = function(req, res, next) {
  var upload = new Upload({
    dest: 'tmp',
    maxFileSize: 300 * 1024,
    acceptFileTypes: /(\.|\/)(csv)$/i,
    rename: function(name, file) {
      console.log(name)
      console.log(this.fields);
      return file.filename;
    }
  });

  upload.on('end', function(fields, files) {
    if (!fields.channel) {
      this.cleanup();
      this.error('Channel can not be empty');
      return;
    }
    res.send('ok')
  });

  upload.on('error', function(err) {
    res.send(err);
  });

  upload.parse(req);
};
