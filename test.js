//------
const _ = require('lodash'),
    moment = require('moment')
    ;
//----------------------

var now = new Date(),
    datetime = moment(now).format("DDMMYY_HHmmSSS")
    ;

//----main---
voidreport();


//-------------------
function dailyemail() {

    //--------dailyEmail--------
    var mockdata = require('./libs/daily_email_report/mock_data').data,
        dailyEmailPdf = require('./libs/daily_email_report/index')
        ;
    //--------dailyEmail--------

    var params = {},
        prefix_name = "daily_email",
        ShopName = mockdata.ShopName || "Niceloop Test Lab",
        filename = './output/' + prefix_name[1] + '_' + ShopName + '_' + datetime + '.pdf',
        params_default = {
            filePath: '/tmp/' + filename, //cloud
            data: {},
            from: '2017-03-01T15:00:00',
            to: '2017-03-31T15:00:00',
            shopname: "" || ShopName,
            customerId: '4073'
        };
    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {
        params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        params_default.data = mockdata;
        params = _.assign({}, params_default)

    }

    new dailyEmailPdf.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}



function voidreport() {

    //--------void--------
    var voidReport = require('./libs/void_report/index')
        ;
    //--------void--------

    var params = {},
        prefix_name = "void",
        ShopName = mockdata.ShopName || "Niceloop Test Lab",
        filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf',
        params_default = {
            filePath: '/tmp/' + filename, //cloud
            data: {},
            from: '2017-03-01T15:00:00',
            to: '2017-03-31T15:00:00',
            shopname: "" || ShopName,
            customerId: '4073'
        };

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {
        params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        params_default.data = mockdata;
        params = _.assign({}, params_default)

    }

    new voidReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}