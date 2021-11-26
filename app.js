const express = require('express')
const expressWs = require('express-ws')
const app = express()

//socket
expressWs(app)

// 加载mysql模块
var mysql = require('mysql');
var config = require('./config/dbconfig');
var connection = mysql.createConnection(config);

app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

//事件总线
var EventEmitter = require('events').EventEmitter
var myevent = new EventEmitter();

app.get('/',(req,res) =>{
    res.send("Hello World!")
})

app.post('/getforce',(req,res) =>{
  let data = JSON.stringify(req.body) +"\r\n"
  console.log("data",req.data);
  console.log("body",req.body);
  //触发事件   
  try{
    myevent.emit('abc',data)
  }catch(err){
    console.log(err)
  }
  //解析请求参数
  // var params = URL.parse(req.url, true).query;
  // console.log("@req",req)
  // try { 
  //   fs.writeFileSync('./log.txt', data,{ flag: 'a+' }, (err) => {})
  
  //   //file written successfully
  // } catch (err) {
  //   console.error(err)
  // }
  // console.log("@res",res)
  var addSqlParams = [req.body.devicename,req.body.productid,req.body.timestamp,req.body.timemills,req.body.payload.params.force_of_hx,req.body.payload.params.measure];  
  connection.query(addSql,addSqlParams,function (err, result) {
      if(err){
       console.log('[INSERT ERROR] - ',err.message);
       return;
      }
      result.message='success'
      console.log(result.message)             
  });
  res.send(req.body)
})

app.ws('/sendforce', function (ws, req) {
  console.log('connect success')
  console.log(ws)
  
  // 使用 ws 的 send 方法向连接另一端的客户端发送数据
  ws.send('connect to express server with WebSocket success')

  // 使用 on 方法监听事件
  //   message 事件表示从另一段（服务端）传入的数据
  ws.on('connection', function (msg) {
    console.log('ok')
    myevent.on('abc',async function(data){
      // console.log('@info',forceRouter.inf)
      ws.send(data)
      console.log('socket发送数据')
    })
  })

  // close 事件表示客户端断开连接时执行的回调函数
  ws.on('close', function (e) {

  })
})

app.listen(9191,()=>{
    console.log('Server running at http://localhost:9191')
})