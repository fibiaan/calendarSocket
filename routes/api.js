const {
    login,
    validateAuth
} = require('../controllers/User')
const {
    getCalendarInfo, addSchedules
} = require('../controllers/Calendar')

const router = (server, io) => {
    server.post('/user/login', (req, res) => {login(req, res, io)})

    server.get('/calendar', (req, res, next) => {
        validateAuth(req, res, next)
    }, (req, res) => {
        getCalendarInfo(req,res)
    })
    server.post('/calendar/edit', (req, res, next) => {
        validateAuth(req, res, next)
    }, (req, res) => {
        addSchedules(req,res,io)
    })
}

module.exports = {
    router
}