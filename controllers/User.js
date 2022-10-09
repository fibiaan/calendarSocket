
const crypto = require('crypto')
const db = require('../database/database')
const moment = require('moment')

module.exports = {
    login: async (req, res, io) => {
        const conn = await db.createConnection()
        if (!conn) {
            res.status(500)
            res.end()
        }

        let pswd = crypto.createHash('md5').update(req.body.pswd).digest('hex')
        var { status, result } = await conn.read('users',
            ["fname", "lname", "identity", "nickname", "id"],
            ` pswd = "${pswd}" and nickname = "${req.body.nickname}"`
        )

        res.status(status)
        if (status != 200) {
            res.end()
        }

        result[0]['exp'] = moment().unix() + (60 * 60)
        const token = Buffer.from(JSON.stringify(result[0]), 'utf-8').toString('base64')
        let response = await conn.update('users',
            { token },
            ` id = ${result[0]['id']}`
        )
        conn.closeConnections()
        res.json({
            token
        })
    },
}