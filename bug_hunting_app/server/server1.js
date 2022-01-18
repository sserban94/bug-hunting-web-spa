const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')        // 4 tokens
const moment = require('moment')        // for token expiration
var Sequelize = require('sequelize');



const DB_NAME = 'bugtracking'
const DB_USER = 'webtechMaster'
const DB_PASSWORD = 'webtechMaster'

const TOKEN_TIMEOUT = 600

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql'
})

// tables
const User = sequelize.define('users', {
    email: Sequelize.STRING,
    password: Sequelize.STRING
})

const Project = sequelize.define('projects', {
    repository: Sequelize.STRING,
    description: Sequelize.TEXT
})

const Bug = sequelize.define('bugs', {
    status: Sequelize.STRING,
    description: Sequelize.TEXT
})

// in order to control access
// const Resource = sequelize.define('resource',{
//     content: Sequelize.STRING
// })

const Permission = sequelize.define('permission', {
    permType: Sequelize.ENUM('read')
})

// this are for permission stuff
User.hasMany(Permission)
Resource.hasMany(Permission)

// this is for joins
Project.hasMany(User)
Project.hasMany(Bug)

const app = express();
// this is the middleware for content
app.use(express.json())
//app.use(bodyParser.json())


// THESE SHOULD BE CHANGED
const authRouter = express.Router() // login
const adminRouter = express.Router()    // ignore 4 now
const apiRouter = express.Router()  // protected part of the app

app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/api', apiRouter)



                                            // TODO - this should be changed for one of our resources
// const permMiddleWare = async (req, res, next) => {
//     const user = res.locals.user
//     try {
//         const perm = await Permission.findOne({
//             where: {
//                 resourceId: req.params.rid, // this is for Has Many
//                 userId: user.id
//             }
//         })
//         if (!perm){
//             res.status(401).json({ message: `${req.params.rid} is not yours`})
//         } else {
//             next()
//         }
//     } catch (err) {
//         console.warn(err)
//         res.status(500).json({ message: 'server error' })
//     }
// }


// in order to check tokens api router
apiRouter.use(async (req, res, next) => {
    const token = req.headers.auth
    if (token) {
    try{
        const user = await User.findOne({
            where: {
                token: token
            }
        })
        if (!user) {
            res.status(401).json({ message: 'you shall not pass' })
        } else {
            if (moment().diff(user.expiry, 'seconds') < 0) {
                res.locals.user = user
                next()
            } else {
                res.status(401).json({ message: 'token has expired' })
            }
        }
    } catch (err){
        console.warn(err)
        res.status(500).json({ message: 'server error' })
    }
} else {
    res.status(401).json({ message: 'header not provided' })
}
})


adminRouter.post('/users', async (req, res) => {
    try {
        await User.create(req.body)
        res.status(201).json({ message: 'created' })
 
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'user creation error' })
    }
 
 })

// ---------------------------------------------LOGIN and token retrieval------------------------------------------
authRouter.post('/login', async (req, res) => {
    try {
        const credentials = req.body
        const user = await User.findOne({
            where: {
                email: credentials.email,
                password: credentials.password
            }
        })
        if (user){
            const token = crypto.randomBytes(64).toString('hex')    
            user.token = token;
            user.expiry = moment().add(TOKEN_TIMEOUT, 'seconds')
            await user.save()
            res.status(200).json({ message: 'login successful', token})
        } else {
            res.status(401).json({ message: 'invalid credentials' })
        }
    } catch (error) {
        console.warn(err)
        res.status(500).json({ message: 'login error' })
    }
})


// --------------------------------------------RESET DATABASE-------------------------------------------------
app.get('/sync', async (req, res) => {
    try {
        await sequelize.sync({ force: true })
        res.status(201).json({ message: 'tables created' })
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})


// -------------------------------------------PROJECT REQUESTS------------------------------------------------
app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.findAll()
        res.status(200).json(projects)
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.post('/projects', async (req, res) => {
    try {
        await Project.create(req.body)
        res.status(201).json({ message: 'created' })
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.get('/projects/:pid', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.pid, { include: Bug }, { include: User })
        if (project) {
            res.status(200).json(project)
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.put('/projects/:pid', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        if (project) {
            await project.update(req.body, { fields: ['repository', 'description'] })
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }

    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.delete('/projects/:pid', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        if (project) {
            await project.destroy()
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.get('/projects/:pid/users', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        if (project) {
            const users = await project.getUsers()  // getter
            res.status(200).json(users)
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

// JUST FOR TEST - this would create an user and add him to the project
app.post('/projects/:pid/users', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        if (project) {
            const user = req.body
            user.projectId = project.id     // make the join here
            await User.create(user)
            res.status(200).json({ message: 'created' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})











app.listen(8080)