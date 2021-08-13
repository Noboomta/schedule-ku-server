if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const axios = require('axios')

const appKey = process.env.APP_KEY

const app = express()

let using = 0
let stdCache = []

app.use( (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With,accesstoken');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
})

app.use(express.json())

app.post('/login', async (req, res) => {
  try {
    const response = await axios.post('https://myapi.ku.th/auth/login', req.body, {
      headers: {
        'app-key': appKey
      }
    })
    using = using + 1;
    const student = response.data.user.student
    const { studentYear, facultyNameEn, majorNameEn, stdId } = student
    if (stdCache.indexOf(stdId) <= -1){
      stdCache.push(stdId);
    }
    console.log('Login success', facultyNameEn, ",", majorNameEn, ",", studentYear);
    console.log('Count:', using, ". Unique:", stdCache.length)
    res.json(response.data)
  } catch (e) {
    res.status(e.response.status).json(e)
  }
})

app.get('/getSchedule', async (req, res) => {
  const accessToken = req.headers['accesstoken']
  const { stdId } = req.query
  try {
    const response = await axios.get('https://myapi.ku.th/std-profile/getGroupCourse', {
      params: {
        academicYear: 2564,
        semester: 1,
        stdId
      },
      headers: {
        "x-access-token": accessToken,
        'app-key': appKey
      }
    })
    console.log('GetSchedule')
    res.json(response.data.results[0].course)
  } catch (e) {
    try{
      res.status(e.response.status).json(e)
    } catch {
      console.log('GetSchedule Failed')
      res.status(400).json({
          "code": "bad request"
      })
    }
  }
})

app.listen(process.env.PORT, () => console.log('Connected'))