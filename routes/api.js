const {
    login
} = require('../controllers/User')

const router = (server, io) => {
    server.post('/user/login', (req, res) => {login(req, res, io)})
}

module.exports = {
    router
}