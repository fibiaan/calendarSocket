const db = require('../database/database')
const moment = require('moment')

module.exports = {
    getCalendarInfo: async (req, res) => {
        const conn = await db.createConnection()
        if (!conn){
            res.status(500)
            res.end()
        }
        const query = `SELECT 
        u.fname AS name, sch.max_day AS limitDay, sch.max_week AS limitWeek, u.nickname, u.id,
        dpto.title AS teamName, dpto.id AS team,
        sch.day_1, sch.day_2, sch.day_3, sch.day_4,
        sch.day_5, sch.day_6, sch.day_7
        
        FROM scheduler AS sch
        INNER JOIN users AS u ON u.id = sch.user_id
        INNER JOIN dptos AS dpto ON dpto.id = u.dptos_id
        WHERE sch.week_number = ? AND u.company_id = ?;`
        const values = [41, 1]
        var {status, result} = await conn.freeQuery(query, values)
        res.status(status)
        conn.closeConnections()
        if(status != 200){
            res.end()
        }
        const final = result.map((user) => {
            user['days'] = []
            user['days'].push(JSON.parse(user.day_1))
            user['days'].push(JSON.parse(user.day_2))
            user['days'].push(JSON.parse(user.day_3))
            user['days'].push(JSON.parse(user.day_4))
            user['days'].push(JSON.parse(user.day_5))
            user['days'].push(JSON.parse(user.day_6))
            user['days'].push(JSON.parse(user.day_7))
            delete user.day_1
            delete user.day_2
            delete user.day_3
            delete user.day_4
            delete user.day_5
            delete user.day_6
            delete user.day_7
            return user
        })
        res.json(final)
    },
    addSchedules: async(req, res, io) => {
        io.to('calendar').emit('updateValues',{
            from: 0,
            to: 5,
            index: 0,
            user: 1
        })
        res.end()
    }
}