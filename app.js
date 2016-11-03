var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
multer = require('multer');
props = require('config').props;
uuid = require('node-uuid');
moment = require('moment');
formidable = require('formidable');
async = require('async');
moment = require('moment');
var each = require('async-each-series');
//db = require('mongoskin').db(props.mongodb);
//GLOBAL.CID_DB = db;
//fs = require('fs');
//var routesInit = require('./routes/routes-init');
//routesInit(db);
var routes = require('./routes/index');
var users = require('./routes/users');
var college = require('./routes/college');
var async = require('async');
var underscore = require('underscore');
var uslug = require('uslug');
var app = express();
var sql = require('mssql');
var router = express.Router();
var solr = require('solr-client');
var path = require('path');
app.set('port', process.env.PORT || 3000);
var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        dateFormat: function(date, format) {
            return moment(date).format(format);
        },
        shortDescription: function(description, length, options) {
            if (description && description.length > length) {
                description = description.substring(0, length) + '...';
            }
            return description;
        },
        selectOption: function(selected, options) {
            return options.fn(this).replace(
                new RegExp(' value=\"' + selected + '\"'),
                '$& selected="selected"');
        },
        equal: function(lvalue, rvalue, options) {

            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        getFileName: function(url, options) {
            console.log(url);
            console.log(path.basename(url));
            return path.basename(url);
        }
    }
});


//routesInit(db);
//multipart = multipart()
router.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', hbs.engine);

app.set('view engine', 'hbs');

// view engine setup
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(multer({
    dest: './public/tmp'
}));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(cookieParser());
app.enable('trust proxy');


router.use(function(req, res, next) {

    next();

});

app.use('/', router);
app.use('/use', routes);
app.use('/users', users);
app.use('/reports', college);

var sql = require('mssql');

var config = {
    user: 'fft',
    password: 'fast@4321',
    server: '122.175.35.208',
    database: 'eSSlSmartoffice',
    connectionTimeout: '20000'
}

app.get('/', function(request, response, next) {

    var connection = new sql.Connection(config, function(err) {
        console.log(err);

        var request = new sql.Request(connection);

        //var date = moment().format('YYYY-MM-DD 00:00:00:0');

        async.parallel({
            Totalstaff: function(callback) {
                request.input('CategoryId', sql.Int, 3); //college staff we use as CategoryId = @CategoryId
                request.query("select count(e.CategoryId) as total_staff, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented_staff, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented_staff from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @CategoryId and al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME)", callback);
            },
            total_students: function(callback) {
                request.input('Category', sql.Int, 2); //college staff we use as CategoryId = @Category
                request.query("select count(e.CategoryId) as total_students, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as student_present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as student_absent from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @Category and al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME)", callback);
            },
            KrishnaClgStaff: function(callback) {
                request.input('CompanyId', sql.Int, 2); // krishna college staff CompanyId = @CompanyId
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented_staff, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented_staff, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as lateby_staff from dbo.Employees e  inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @CategoryId and e.CompanyId = @CompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            KrishnaClgStudents: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented_student, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented_student, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as lateby_student from dbo.Employees e  inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @Category and e.CompanyId = @CompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            krishna_staff_statistics: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.LateBY BETWEEN '1' AND '10' THEN al.EmployeeId END)) as lateby10min, (COUNT(CASE WHEN al.LateBY BETWEEN '11' AND '20' THEN al.EmployeeId END)) as lateby20min, (COUNT(CASE WHEN al.LateBY BETWEEN '21' AND '30' THEN al.EmployeeId END)) as  lateby30min, (COUNT(CASE WHEN al.LateBY BETWEEN '31' AND '40' THEN al.EmployeeId END)) as lateby40min, (COUNT(CASE WHEN al.LateBY >= '41' THEN al.EmployeeId END)) morethan40min from dbo.Employees e inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @CategoryId and e.CompanyId = @CompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            krishna_students_statistics: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.LateBY BETWEEN '1' AND '10' THEN al.EmployeeId END)) as lateby10min, (COUNT(CASE WHEN al.LateBY BETWEEN '11' AND '20' THEN al.EmployeeId END)) as lateby20min, (COUNT(CASE WHEN al.LateBY BETWEEN '21' AND '30' THEN al.EmployeeId END)) as  lateby30min, (COUNT(CASE WHEN al.LateBY BETWEEN '31' AND '40' THEN al.EmployeeId END)) as lateby40min, (COUNT(CASE WHEN al.LateBY >= '41' THEN al.EmployeeId END)) morethan40min from dbo.Employees e inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @Category and e.CompanyId = @CompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            WomensClgStaff: function(callback) {
                request.input('WomensCompanyId', sql.Int, 6); // Womens college staff CompanyId = @WomensCompanyId
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented_staff, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented_staff, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as lateby_staff from dbo.Employees e  inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @CategoryId and e.CompanyId = @WomensCompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            WomensClgStudents: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented_student, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented_student, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as lateby_student from dbo.Employees e  inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @Category and e.CompanyId = @WomensCompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            womens_staff_statistics: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.LateBY BETWEEN '1' AND '10' THEN al.EmployeeId END)) as lateby10min, (COUNT(CASE WHEN al.LateBY BETWEEN '11' AND '20' THEN al.EmployeeId END)) as lateby20min, (COUNT(CASE WHEN al.LateBY BETWEEN '21' AND '30' THEN al.EmployeeId END)) as  lateby30min, (COUNT(CASE WHEN al.LateBY BETWEEN '31' AND '40' THEN al.EmployeeId END)) as lateby40min, (COUNT(CASE WHEN al.LateBY >= '41' THEN al.EmployeeId END)) morethan40min from dbo.Employees e inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @CategoryId and e.CompanyId = @WomensCompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            womens_students_statistics: function(callback) {
                request.query("select c.CompanyFName, e.CompanyId, (COUNT(CASE WHEN al.LateBY BETWEEN '1' AND '10' THEN al.EmployeeId END)) as lateby10min, (COUNT(CASE WHEN al.LateBY BETWEEN '11' AND '20' THEN al.EmployeeId END)) as lateby20min, (COUNT(CASE WHEN al.LateBY BETWEEN '21' AND '30' THEN al.EmployeeId END)) as  lateby30min, (COUNT(CASE WHEN al.LateBY BETWEEN '31' AND '40' THEN al.EmployeeId END)) as lateby40min, (COUNT(CASE WHEN al.LateBY >= '41' THEN al.EmployeeId END)) morethan40min from dbo.Employees e inner join dbo.AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId = @Category and e.CompanyId = @WomensCompanyId inner join dbo.Companies c on e.CompanyId=c.CompanyId where al.AttendanceDate=CAST(FLOOR(CAST(getdate() AS FLOAT)) AS DATETIME) group by e.CompanyId,c.CompanyFName;", callback);
            },
            weekly_staff_statistics: function(callback) {
                request.query("select  al.AttendanceDate,  DATENAME(dw, al.AttendanceDate) as week, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @CategoryId and al.AttendanceDate >= DATEADD(week, DATEDIFF(week,0,GETDATE()),-1) AND al.AttendanceDate < DATEADD(week, DATEDIFF(week,0,GETDATE())+1,-1) group by al.AttendanceDate", callback);
            },
            weekly_students_statistics: function(callback) {
                    request.query("select  al.AttendanceDate,  DATENAME(dw, al.AttendanceDate) as week, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @Category and al.AttendanceDate >= DATEADD(week, DATEDIFF(week,0,GETDATE()),-1) AND al.AttendanceDate < DATEADD(week, DATEDIFF(week,0,GETDATE())+1,-1) group by al.AttendanceDate", callback);
                }
                /*lastweek_staff_statisics: function(callback) {
                  request.query("select  al.AttendanceDate,  DATENAME(dw, al.AttendanceDate) as week, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @CategoryId and al.AttendanceDate >= DATEADD(week, DATEDIFF(week,0,GETDATE())-1,-1) and al.AttendanceDate < DATEADD(week, DATEDIFF(week,0,GETDATE()),-1) group by al.AttendanceDate;", callback);
                },
                lastweek_student_statisics: function(callback) {
                  request.query("select  al.AttendanceDate,  DATENAME(dw, al.AttendanceDate) as week, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId where e.CategoryId = @Category and al.AttendanceDate >= DATEADD(week, DATEDIFF(week,0,GETDATE())-1,-1) and al.AttendanceDate < DATEADD(week, DATEDIFF(week,0,GETDATE()),-1) group by al.AttendanceDate;", callback);
                }*/
        }, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                //console.log(result);
                var object = {};
                if (result && result.Totalstaff[0]) {
                object.totalStaff = result.Totalstaff[0].total_staff;
                object.presentedstaff = result.Totalstaff[0].presented_staff;
                object.absentedstaff = result.Totalstaff[0].absented_staff;
                }
                if (result && result.total_students[0]) {
                object.total_students = result.total_students[0].total_students;
                object.presented_students = result.total_students[0].student_present;
                object.absented_students = result.total_students[0].student_absent;
                }
                if (result && result.KrishnaClgStaff[0]) {
                object.krishna_presented_staff = result.KrishnaClgStaff[0].presented_staff;
                object.krishna_absented_staff = result.KrishnaClgStaff[0].absented_staff;
                object.krishna_lateby_staff = result.KrishnaClgStaff[0].lateby_staff;
                }
                if (result && result.KrishnaClgStudents[0]) {
                object.krishna_presented_student = result.KrishnaClgStudents[0].presented_student;
                object.krishna_absented_student = result.KrishnaClgStudents[0].absented_student;
                object.krishna_lateby_student = result.KrishnaClgStudents[0].lateby_student;
                }
                if (result && result.WomensClgStaff[0]) {
                    object.womens_presented_staff = result.WomensClgStaff[0].presented_staff;
                    object.womens_absented_staff = result.WomensClgStaff[0].absented_staff;
                    object.womens_lateby_staff = result.WomensClgStaff[0].lateby_staff;
                }
                if (result && result.WomensClgStudents[0]) {
                object.womens_presented_student = result.WomensClgStudents[0].presented_student;
                object.womens_absented_student = result.WomensClgStudents[0].absented_student;
                object.womens_lateby_student = result.WomensClgStudents[0].lateby_student;
                 }
                 if (result && result.krishna_staff_statistics[0]) {
                object.lateby10min = result.krishna_staff_statistics[0].lateby10min;
                object.lateby20min = result.krishna_staff_statistics[0].lateby20min;
                object.lateby30min = result.krishna_staff_statistics[0].lateby30min;
                object.lateby40min = result.krishna_staff_statistics[0].lateby40min;
                object.morethan40min = result.krishna_staff_statistics[0].morethan40min;

                var krishna_sta_status = [];
                async.each(result.krishna_staff_statistics, function(obj, callback) {

                    for (var i in obj) {
                        if (obj[i] == 0) {
                            krishna_sta_status.push(i);
                        }
                    }
                    callback(null);
                }, function(err) {

                    if (krishna_sta_status.length === 5) {
                        object.krishna_staff_status = krishna_sta_status;
                    }
                });
              }
                 if (result && result.krishna_students_statistics[0]) {
                object.slateby10min = result.krishna_students_statistics[0].lateby10min;
                object.slateby20min = result.krishna_students_statistics[0].lateby20min;
                object.slateby30min = result.krishna_students_statistics[0].lateby30min;
                object.slateby40min = result.krishna_students_statistics[0].lateby40min;
                object.smorethan40min = result.krishna_students_statistics[0].morethan40min;

                var krishna_student_status = [];
                async.each(result.krishna_students_statistics, function(obj, callback) {

                    for (var i in obj) {
                        if (obj[i] == 0) {
                            krishna_student_status.push(i);
                        }
                    }
                    callback(null);
                }, function(err) {

                    if (krishna_student_status.length === 5) {
                        object.krishna_stu_status = krishna_student_status;
                    }
                });
              }
                if (result && result.womens_staff_statistics[0]) {
                object.womens_lateby10min = result.womens_staff_statistics[0].lateby10min;
                object.womens_lateby20min = result.womens_staff_statistics[0].lateby20min;
                object.womens_lateby30min = result.womens_staff_statistics[0].lateby30min;
                object.womens_lateby40min = result.womens_staff_statistics[0].lateby40min;
                object.womens_morethan40min = result.womens_staff_statistics[0].morethan40min;

                var womens_sta_status = [];
                async.each(result.womens_staff_statistics, function(obj, callback) {

                    for (var i in obj) {
                        if (obj[i] == 0) {
                            womens_sta_status.push(i);
                        }
                    }
                    callback(null);
                }, function(err) {

                    if (womens_sta_status.length === 5) {
                        object.womens_staff_status = womens_sta_status;
                    }
                });
              }
                if (result && result.womens_students_statistics[0]) {
                object.womens_stu_lateby10min = result.womens_students_statistics[0].lateby10min;
                object.womens_stu_lateby20min = result.womens_students_statistics[0].lateby20min;
                object.womens_stu_lateby30min = result.womens_students_statistics[0].lateby30min;
                object.womens_stu_lateby40min = result.womens_students_statistics[0].lateby40min;
                object.womens_stu_morethan40min = result.womens_students_statistics[0].morethan40min;

                var womens_stu_status = [];
                async.each(result.womens_students_statistics, function(obj, callback) {

                    for (var i in obj) {
                        if (obj[i] == 0) {
                            womens_stu_status.push(i);
                        }
                    }
                    callback(null);
                }, function(err) {

                    if (womens_stu_status.length === 5) {
                        object.women_student_status = womens_stu_status;
                    }
                });
                 }

                var array = [];
                async.each(result.weekly_staff_statistics, function(obj, callback) {
                    var data_obj = {};
                    data_obj.week = obj.week;
                    data_obj.present = obj.present;
                    data_obj.absent = obj.absent;
                    data_obj.Pcolor = "#9cbc72";
                    data_obj.Acolor = "#f1705c";
                    array.push(data_obj);
                    callback(null);

                }, function(err) {
                    //console.log(array);
                });

                var array1 = [];
                async.each(result.weekly_students_statistics, function(obj, callback) {
                    var data_obj = {};
                    data_obj.week = obj.week;
                    data_obj.present = obj.present;
                    data_obj.absent = obj.absent;
                    data_obj.Pcolor = "#9cbc72";
                    data_obj.Acolor = "#f1705c";
                    array1.push(data_obj);
                    callback(null);

                }, function(err) {
                    //console.log(array1);
                });


                var array_lweek = [];
                async.each(result.lastweek_staff_statisics, function(obj, callback) {
                    var data_obj = {};
                    data_obj.week = obj.week;
                    data_obj.present = obj.present;
                    data_obj.absent = obj.absent;
                    data_obj.Pcolor = "#9cbc72";
                    data_obj.Acolor = "#f1705c";
                    array_lweek.push(data_obj);
                    callback(null);

                }, function(err) {
                    //console.log(array_lweek);
                });

                var array_lweek1 = [];
                async.each(result.lastweek_student_statisics, function(obj, callback) {
                    var data_obj = {};
                    data_obj.week = obj.week;
                    data_obj.present = obj.present;
                    data_obj.absent = obj.absent;
                    data_obj.Pcolor = "#9cbc72";
                    data_obj.Acolor = "#f1705c";
                    array_lweek1.push(data_obj);
                    callback(null);

                }, function(err) {
                    //console.log(array_lweek1);
                });

                object.lastweek_student = array_lweek1;
                object.lastweek_staff = array_lweek;
                object.weeklystudent = array1;
                object.weeklystaff = array;
                object.statstObject = JSON.stringify(object);
                object.todayDate = moment().format('MMM DD,YYYY');
                object.year = moment().format('YYYY');
                object.weekday = moment().format('dddd');
                response.render('main', object);
            }
        });
    });
});


global.setDevHeaders = function(res) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization,x-access-token");
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

process.on('uncaughtException', function(err) {
    console.log(err);
})


module.exports = app;
