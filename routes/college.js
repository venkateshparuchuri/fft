var express = require('express');
var Collegerouter = express.Router();
var sql = require('mssql');
var _ = require('underscore');

var config = {
    user: 'fft',
    password: 'fast@4321',
    server: '122.175.35.208',
    database: 'eSSlSmartoffice',
    connectionTimeout: '20000'
}

Collegerouter.get('/daily', function(request, response, next) {
    //response.send('respond with empty');
    var object = {};
    object.text = "";
    response.render('daily_report', object);
});

Collegerouter.post('/daily', function(request, response, next) {
    var dailydata = request.body;
    console.log(dailydata);
    var connection = new sql.Connection(config, function(err) {
        var request = new sql.Request(connection);
        if (dailydata.status_name == "1") {
            request.input('CompanyId', sql.Int, dailydata.college_name);
            request.input('CategoryId', sql.Int, dailydata.cat_name);
            request.input('Course', sql.Int, dailydata.course_name);
            request.input('status', sql.NVarChar, dailydata.status_name);
            var date = moment(dailydata.date).format('YYYY-MM-DD 00:00:00.0');
            request.input('date', sql.NVarChar, date);
            console.log(date);
            request.query("select ROW_NUMBER() Over (Order by e.EmployeeName) As sno,c.CompanyFName,cg.CategoryName, al.AttendanceDate,e.DepartmentId, dept.DepartmentFName, e.Employeecode, e.EmployeeName, al.InTime, al.OutTime, al.PunchRecords, al.Duration, al.Status from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@CategoryId inner join Departments dept on dept.DepartmentId=e.DepartmentId inner join Companies c on e.CompanyId=c.CompanyId and c.CompanyId=@CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where dept.DepartmentId=@Course and al.AttendanceDate=@date", function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    var object = {};
                    if (result.length > 0) {
                        
                        var reportTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                        object.reportTime = reportTime;
                        object.data = result;
                        var DeptName = _.uniq(result, false, 'DepartmentFName');
                        object.DepartmentFName = DeptName[0].DepartmentFName;
                        var CatName = _.uniq(result, false, 'CategoryName');
                        object.CategoryName = CatName[0].CategoryName;
                        var ClgName = _.uniq(result, false, 'CompanyFName');
                        object.CompanyFName = ClgName[0].CompanyFName;
                        //var date = _.uniq(result, false ,'AttendanceDate');
                        //var formdate = date[0].AttendanceDate;
                        object.date = dailydata.date
                        response.render('daily_report', object);
                    }
                    object.text = "Data Not Available";
                    response.render('daily_report', object);
                }
            });
        } else if (dailydata.status_name == "A" || dailydata.status_name == "P") {
            request.input('CompanyId', sql.Int, dailydata.college_name);
            request.input('CategoryId', sql.Int, dailydata.cat_name);
            request.input('Course', sql.Int, dailydata.course_name);
            request.input('status', sql.NVarChar, dailydata.status_name);
            var date = moment(dailydata.date).format('YYYY-MM-DD 00:00:00.0');
            request.input('date', sql.NVarChar, date);
            console.log(date);
            request.query("select ROW_NUMBER() Over (Order by e.EmployeeName) As sno,c.CompanyFName,cg.CategoryName,al.AttendanceDate,e.DepartmentId, dept.DepartmentFName, e.Employeecode, e.EmployeeName, al.InTime, al.OutTime, al.PunchRecords, al.Duration, al.Status from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@CategoryId inner join Departments dept on dept.DepartmentId=e.DepartmentId inner join Companies c on e.CompanyId=c.CompanyId and c.CompanyId=@CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where dept.DepartmentId=@Course and al.DetailedStatusCode=@status and al.AttendanceDate=@date", function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    var object = {};
                    if (result.length > 0) {
                    
                    var reportTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                    object.reportTime = reportTime;
                    object.data = result;
                    var DeptName = _.uniq(result, false, 'DepartmentFName');
                    object.DepartmentFName = DeptName[0].DepartmentFName;
                    var CatName = _.uniq(result, false, 'CategoryName');
                    object.CategoryName = CatName[0].CategoryName;
                    var ClgName = _.uniq(result, false, 'CompanyFName');
                    object.CompanyFName = ClgName[0].CompanyFName;
                    //var date = _.uniq(result, false ,'AttendanceDate');
                    //var formdate = date[0].AttendanceDate;
                    object.date = dailydata.date
                    response.render('daily_report', object);
                  }
                  object.text = "Data Not Available";
                  response.render('daily_report', object);
                }

            });
        } else if (dailydata.status_name == "0") {
            request.input('CompanyId', sql.Int, dailydata.college_name);
            request.input('CategoryId', sql.Int, dailydata.cat_name);
            request.input('Course', sql.Int, dailydata.course_name);
            request.input('status', sql.NVarChar, dailydata.status_name);
            var date = moment(dailydata.date).format('YYYY-MM-DD 00:00:00.0');
            request.input('date', sql.NVarChar, date);
            console.log(date);
            request.query("select ROW_NUMBER() Over (Order by e.EmployeeName) As sno,c.CompanyFName,cg.CategoryName,al.AttendanceDate,e.DepartmentId, dept.DepartmentFName, e.Employeecode, e.EmployeeName, al.InTime, al.OutTime, al.PunchRecords, al.Duration, al.Status from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@CategoryId inner join Departments dept on dept.DepartmentId=e.DepartmentId inner join Companies c on e.CompanyId=c.CompanyId and c.CompanyId=@CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where dept.DepartmentId=@Course and al.LateBy!=@status and al.AttendanceDate=@date", function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    var object = {};
                    if (result.length > 0) {
                    
                    var reportTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                    object.reportTime = reportTime;
                    object.data = result;
                    var DeptName = _.uniq(result, false, 'DepartmentFName');
                    object.DepartmentFName = DeptName[0].DepartmentFName;
                    var CatName = _.uniq(result, false, 'CategoryName');
                    object.CategoryName = CatName[0].CategoryName;
                    var ClgName = _.uniq(result, false, 'CompanyFName');
                    object.CompanyFName = ClgName[0].CompanyFName;
                    //var date = _.uniq(result, false ,'AttendanceDate');
                    //var formdate = date[0].AttendanceDate;
                    object.date = dailydata.date
                    response.render('daily_report', object);
                  }
                  object.text = "Data Not Available";
                    response.render('daily_report', object);
                }
            });
        }

    });

});

Collegerouter.get('/course', function(request, response, next) {
    //response.send('respond with empty');
    var object = {};
    object.text = "";
    response.render('course_report', object);
});

Collegerouter.post('/course', function(request, response, next) {
    coursedata = request.body;
    console.log(coursedata);

    var connection = new sql.Connection(config, function(err) {
        var request = new sql.Request(connection);

        request.input('CompanyId', sql.Int, coursedata.college_name);
        request.input('CategoryId', sql.Int, coursedata.category);
        var date = moment(coursedata.date).format('YYYY-MM-DD 00:00:00.0');
        console.log(date);
        request.input('Date', sql.NVarChar, date);
        if (coursedata.grade === 'all') {
            request.query("select ROW_NUMBER() Over (Order by e.DepartmentId) As sno, e.DepartmentId, dept.DepartmentFName,c.CompanyFName,cg.CategoryName,COUNT(e.EmployeeId) as total_course, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present,  (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as latecomers, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END))*1.0/ COUNT(e.EmployeeId) as average from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@CategoryId inner join Departments dept on dept.DepartmentId=e.DepartmentId   inner join Companies c on e.CompanyId=c.CompanyId and e.CompanyId=@CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where al.AttendanceDate=@date  group by e.DepartmentId, dept.DepartmentFName,c.CompanyFName,cg.CategoryName  order by e.DepartmentId asc", function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    var object = {};
                    if (result.length > 0) {
                        object.data = result;
                        object.name = coursedata.college_name;
                        object.date = coursedata.date;
                        var genDate = moment().format('MMMM Do YYYY, h:mm:ss a');
                        object.generatedDate = genDate;
                        var clgUniq = _.uniq(result, false, 'CompanyFName');
                        object.clgname = clgUniq[0].CompanyFName;
                        var catUniq = _.uniq(result, false, 'CategoryName');
                        console.log(catUniq);
                        object.catname = catUniq[0].CategoryName;
                        object.grade_name = "all";
                        for (var i in object.data) {
                            average = parseFloat(object.data[i].average).toFixed(2);
                            object.data[i].average = average;
                        }
                        response.render('course_report', object);
                    }
                    object.text = "Data Not Available";
                    response.render('course_report', object);
                }
            });

        } else {
            request.input('Grade', sql.NVarChar, coursedata.grade);
            request.query("select ROW_NUMBER() Over (Order by e.DepartmentId) As sno, e.DepartmentId, dept.DepartmentFName,c.CompanyFName, e.Grade,cg.CategoryName, COUNT(e.EmployeeId) as total, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as present, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absent, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as latecomers, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END))*1.0 / COUNT(e.EmployeeId) as average from Employees e inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@CategoryId  inner join Departments dept on dept.DepartmentId=e.DepartmentId  inner join Companies c on e.CompanyId=c.CompanyId and e.CompanyId=@CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where al.AttendanceDate =@date and e.Grade=@Grade group by e.DepartmentId, dept.DepartmentFName,c.CompanyFName,cg.CategoryName,e.Grade order by e.DepartmentId asc", function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    var object = {};
                    if (result.length > 0) {
                        object.data = result;
                        for (var i in object.data) {
                            average = parseFloat(object.data[i].average).toFixed(2);
                            object.data[i].average = average;
                        }
                        object.date = coursedata.date;
                        var genDate = moment().format('MMMM Do YYYY, h:mm:ss a');
                        object.generatedDate = genDate;
                        var clgUniq = _.uniq(result, false, 'CompanyFName');
                        object.clgname = clgUniq[0].CompanyFName;
                        var catUniq = _.uniq(result, false, 'CategoryName');
                        object.catname = catUniq[0].CategoryName;
                        var gradeUniq = _.uniq(result, false, 'Grade');
                        object.grade_name = catUniq[0].Grade;
                        response.render('course_report', object);
                    }
                    object.text = "Data Not Available";
                    response.render('course_report', object);
                }
            });
        }

    });

});

Collegerouter.get('/monthly', function(request, response, next) {
    //response.send('respond with empty');
    var object = {};
    object.layout = 'main';
    object.text = "";
    response.render('monthly_report', object);
});

Collegerouter.post('/monthly', function(request, response, next) {
    var monthData = request.body;
    console.log(monthData);
    var connection = new sql.Connection(config, function(err) {
        var request = new sql.Request(connection);

        request.input('college', sql.Int, monthData.college_name);
        request.input('category_id', sql.Int, monthData.category);
        request.input('Course', sql.Int, monthData.course);
        request.query("select  ROW_NUMBER() Over (Order by e.EmployeeName) As sno,c.CompanyFName,cg.CategoryName,dept.DepartmentFName,e.Employeecode,e.EmployeeName, DATEDIFF(DAY, DATEADD(month, DATEDIFF(month,0,GETDATE()),-1), getdate()) totaldays,  (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.Employeecode END)) as p, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.Employeecode END)) as a,  (COUNT(CASE WHEN al.IsOnLeave != 0 THEN e.EmployeeId END)) as l, (COUNT(CASE WHEN al.DetailedStatusCode = 'WO' THEN e.Employeecode END)) as h,  (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.Employeecode END))*1.0  /DATEDIFF(DAY, DATEADD(month, DATEDIFF(month,0,GETDATE()),-0), getdate()) as average from Employees e  inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@category_id inner join Departments dept on dept.DepartmentId=e.DepartmentId  inner join Companies c on e.CompanyId=c.CompanyId and c.CompanyId=@college inner join Categories cg on cg.CategoryId=e.CategoryId  where dept.DepartmentId=@Course and al.AttendanceDate >= DATEADD(month, DATEDIFF(month,0,GETDATE()),-0)  and al.AttendanceDate <= DATEADD(month, DATEDIFF(month,0,GETDATE())+1,-1)  group by e.EmployeeName,dept.DepartmentFName,c.CompanyFName,cg.CategoryName,e.Employeecode", function(err, result) {
            if (err) {
                console.log(err);
            } else {
              var object = {};
                if (result.length > 0) {
                    object.data = result;
                    //console.log(result);
                    var genDate = moment().format('L');
                    var genTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                    object.genDate = genDate;
                    object.genTime = genTime;
                    var uniques = _.uniq(result, false, 'CompanyFName');
                    object.name = uniques[0].CompanyFName;
                    var courseUniq = _.uniq(result, false, 'DepartmentFName');
                    object.course = courseUniq[0].DepartmentFName;
                    var catUniq = _.uniq(result, false, 'CategoryName');
                    object.category = catUniq[0].CategoryName;
                    for (var i in object.data) {
                        average = parseFloat(object.data[i].average).toFixed(2);
                        object.data[i].average = average;
                    }
                    response.render('monthly_report', object);
                }
                object.text = "Data Not Available";
                response.render('monthly_report', object);
            }
        });

    });

});

Collegerouter.get('/college/all', function(request, response, next) {
    //response.send('respond with empty');
    var object = {};
    object.text = "";
    response.render('allcollege_report', object);
});

Collegerouter.post('/college/all', function(request, response, next) {
    var collegeData = request.body;
    console.log(collegeData);
    var connection = new sql.Connection(config, function(err) {
        var request = new sql.Request(connection);
        request.input('Category', sql.Int, collegeData.type);
        console.log(collegeData.type);
        var date = moment(collegeData.date).format('YYYY-MM-DD 00:00:00.0');
        request.input('date', sql.NVarChar, date);
        request.query("select ROW_NUMBER() Over (Order by e.CompanyId)As sno ,e.CompanyId, c.CompanyFName, cg.CategoryName, COUNT(e.EmployeeId) as total, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END)) as presented, (COUNT(CASE WHEN al.DetailedStatusCode = 'A' THEN e.EmployeeId END)) as absented, (COUNT(CASE WHEN al.LateBy != 0 THEN e.EmployeeId END)) as latecomers, (COUNT(CASE WHEN al.DetailedStatusCode = 'P' THEN e.EmployeeId END))*1.0/ COUNT(e.EmployeeId) as average from Employees e  inner join AttendanceLogs al on e.EmployeeId=al.EmployeeId and e.CategoryId=@Category inner join Companies c on e.CompanyId=c.CompanyId inner join Categories cg on cg.CategoryId=e.CategoryId where al.AttendanceDate =@date  group by e.CompanyId,c.CompanyFName,cg.CategoryName", function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                var object = {};
                if (result.length > 0) {
                    object.data = result;
                    object.date = collegeData.date;
                    var genDate = moment().format('MMMM Do YYYY, h:mm:ss a');
                    object.generatedDate = genDate;
                    var cat_uniq = _.uniq(result, false, 'CategoryName');
                    object.category_name = cat_uniq[0].CategoryName;
                    for (var i in object.data) {
                        average = parseFloat(object.data[i].average).toFixed(2);
                        object.data[i].average = average;
                    }
                    response.render('allcollege_report', object);
                }
                object.text = "Data Not Available";
                response.render('allcollege_report', object);
            }

        });

    });
});

module.exports = Collegerouter;
