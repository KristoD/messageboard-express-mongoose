var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/message_board');
app.set('views', __dirname + "/views");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

var Schema = mongoose.Schema;

var messageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    message: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

var commentSchema = new mongoose.Schema({
    _message: {type: Schema.Types.ObjectId, ref: 'Message'},
    name: {type: String, required: true, minlength: 4},
    text: {type: String, required: true}
});

var Message = mongoose.model('Message', messageSchema);
var Comment = mongoose.model('Comment', commentSchema);

app.get('/', function(req, res) {
    Message.find({})
    .populate('comments')
    .exec(function(err, messages) {
        if(err) {
            console.log("Something happened!");
        } else {
            console.log(messages[1].comments)
            res.render('index', {messages: messages});
        }
    });
});

app.post('/process/message', function(req, res) {
    Message.create(req.body, function(err, message) {
        if(err) {
            console.log("Something went wrong!");
        } else {
            res.redirect('/');
        }
    });
});

app.post('/process/comment/:id', function(req, res) {
    Message.findOne({_id : req.params.id}, function(err, message) {
        var comment = new Comment({
            name: req.body.name,
            text: req.body.comment
        });
        comment._message = message._id;
        message.comments.push(comment);
        comment.save(function(err) {
            message.save(function(err) {
                if(err) {
                    console.log('Something went wrong!');
                } else {
                    console.log(comment);
                    console.log("======================")
                    console.log(message)
                    res.redirect('/');
                }
            });
        });
    });
});

app.listen(8000, function() {
    console.log('Server listening on port 8000...');
});
