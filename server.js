var app = require('express')();
// express is an rspec style testing language
var server = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(server);
// compiling the requests

var bodyParser = require('body-parser');
// place your template or code and put it into the body of your html response
app.use(bodyParser.urlencoded({ extended: false }))
// extended argument allows to choose between parsing the urlencoded data with the querystring library (when false)
app.use(require('express-ejs-layouts'));
app.use(require('express').static('public'));
// templating for ejs (same as erb)

app.set('view engine', 'ejs');

app.get('/', function(request, response){
  fs.readdir('code', function(err, files) {
    if (err) {
      response.render('index', {  })
    } else {
      response.render('index', { files: files })
    }
  })
});
// app.get(path, callback(request, response){change to response})
// readdir -> read directory

app.get('/edit', function(request, response){
  var fileName = request.query.file;
  var codeMirrorDisabled = (process.env.NODE_ENV == 'test');

  fs.readFile('code/' + fileName, function (err, data) {
    if (err) {
      response.render('error')
    } else {
      var lang = { rb: 'ruby', js: 'javascript'}[fileName.slice(-2)];
      response.render('edit', { fileName: fileName, fileContents: data, language: lang, codeMirrorDisabled: codeMirrorDisabled });
    }
  });
});

app.post('/files', function(request, response){
  var fileName = request.query.file;
  fs.writeFile('code/' + fileName, request.body.content.trim(), function () {
    response.redirect('/edit?file=' + fileName);
  });
});

app.delete('/files', function(request, response) {
  var fileName = request.query.file;
  fs.unlink('code/' + fileName, function(){
    response.send({status: 'File deleted'})
  });
})

var userCount = 0;

function updateUserCount(change) {
  userCount += change;
  io.emit('userCountChanged', userCount)
}

io.on('connect', function(socket){

  // Update the user count
  updateUserCount(+1);

  socket.on('disconnect', function(){
    updateUserCount(-1);
  })

  socket.on('textUpdated', function(file){
    fs.writeFile('code/' + file.name, file.content.trim());
    io.emit('fileChanged', { content: file.content, author: file.author });
  })
})

module.exports = server;
if (!module.parent) {
  console.log('Server running on http://localhost:3000')
  server.listen(3000)
}