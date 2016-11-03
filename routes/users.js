var express = require('express');
var router = express.Router();

/* GET users listing. */




router.get('/', function(req, res, next) {
  res.send('respond with a resource');


/*sql.connect(config, function(err) {
var request = new sql.Request();
    request.stream = true; 
    var id=3;
    request.query('select count(CategoryId) as total_staff from Employees where CategoryId=?',[id]. function(err, totalstaff) {

     console.log(totalstaff);
    });
});
var object = {};
  res.render('main',object);*/
});

module.exports = router;
