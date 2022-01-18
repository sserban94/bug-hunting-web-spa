const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')        // 4 tokens
const moment = require('moment')        // for token expiration
var Sequelize = require('sequelize');



const DB_NAME = 'bugtracking'
const DB_USER = 'webtechMaster'
const DB_PASSWORD = 'webtechMaster'

const TOKEN_TIMEOUT = 60

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql'
})

// tables
const User = sequelize.define('users', {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    token: Sequelize.STRING,
    expiry: Sequelize.DATE
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
Project.hasMany(Permission)
// Resource.hasMany(Permission)

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
const permMiddleWare = async (req, res, next) => {
    const user = res.locals.user
    if (user.id != req.params.uid) {
        res.status(401).json({ message: "Can't access data from another user" })
    }
    try {
        const perm = await Permission.findOne({
            where: {
                projectId: req.params.pid, // this is for Has Many
                userId: user.id
            }
        })
        console.warn(req.params.pid)
        console.warn(user.id)
        if (!perm) {
            const project = await Project.findByPk(req.params.pid)
            res.status(401).json({ message: `Project Repo "${project.repository}" is not yours` })
        } else {
            next()
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'server error' })
    }
}


// in order to check tokens api router
apiRouter.use(async (req, res, next) => {
    const token = req.headers.auth
    if (token) {
        try {
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
                    console.warn(moment().diff(user.expiry, 'seconds') < 0)
                    res.status(401).json({ message: 'token has expired' })
                }
            }
        } catch (err) {
            console.warn(err)
            res.status(500).json({ message: 'server error' })
        }
    } else {
        res.status(401).json({ message: 'header not provided' })
    }
})

// TODO - check if email exists - res status already exists

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

// TODO email function node.js
authRouter.post('/login', async (req, res) => {
    try {
        const credentials = req.body
        const user = await User.findOne({
            where: {
                email: credentials.email,
                password: credentials.password
            }
        })
        if (user) {
            const token = crypto.randomBytes(16).toString('hex')    // should be 64 here
            user.token = token;
            user.expiry = moment().add(TOKEN_TIMEOUT, 'seconds')
            await user.save()
            res.status(200).json({ message: 'login successful', token })
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
        const projects = await Project.findAll({ include: [Bug, User] })
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
        const project = await Project.findByPk(req.params.pid, { include: [Bug, User] })
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

            let userEmail = req.body.email
            user = await User.findOne({ where: { email: userEmail } })
            if (user) {
                //await project.update(req.body, { fields: ['repository', 'description'] })

                user.projectId = project.id     // make the join here
                await user.save()
                //User.update(user)
                //await User.create(user)
                res.status(200).json({ message: 'created' })
            } else {
                res.status(404).json({ message: 'user not found' })
            }

        } else {
            res.status(404).json({ message: 'project not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})


// here - from the moment one adds a project, that project is his
apiRouter.post('/users/:uid/projects', async (req, res, next) => {
    try {
        const project = await Project.create(req.body)
        const user = await User.findByPk(req.params.uid)
        if (user) {
            const permission = new Permission()
            permission.permType = 'read'
            permission.userId = user.id
            permission.projectId = project.id
            user.projectId = project.id
            await user.save()
            await project.save()
            await permission.save()
            res.status(201).json({ message: 'created' })

        } else {
            res.status(401).json({ message: 'you shall not pass' })
        }

    } catch (err) {
        next(err)
    }
})

// TEST TEST TEST
apiRouter.get('/users/:uid/projects/:pid', permMiddleWare, async (req, res, next) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        if (project) {
            res.status(200).json(project)
        } else {
            res.status(404).json({ message: 'not found' })
        }
        res.status(201).json({ message: 'created' })
    } catch (err) {
        next(err)
    }
})



// show all projects related to connected 

// if not connected to project in db - PUT /projects/:pid/ - verify if tester or dev
// if not connected to project in db - POST /projects/:pid/ - req body cu bug status description - if bug
//          auto add as pending
// if - POST /
// GET /bugs/  - verify which projects - 
// USER HAS MANY BUGS

// BUGS - pending, allocated, solved

// Ca student trebuie să pot sa ma conectez la aplicație cu un cont bazat pe o adresă de email.
// DONE

// Ca student membru în echipa unui proiect (MP) pot să înregistrez un proiect software pentru a fi monitorizat prin aplicație, specificând repository-ul proiectului și echipa de proiect.
// POST /projects - must be auth - auto join with project

// Ca student care nu face parte dintr-un proiect înregistrat pot să mă adaug ca tester (TST) la proiect.


// Ca TST pot înregistra un bug în aplicație. Bug-ul conține o severitate, o prioritate de rezolvare, o descriere și un link la commit-ul la care se referă.



// Ca MP pot vedea bug-urile înregistrate pentru proiectele din care fac parte.



// Ca MP îmi pot aloca rezolvarea unui bug. Un singur MP poate să aibă alocată rezolvarea unui bug la un moment dat.
// if pending if member - can change to allocated - if allocated and not linked
// either add field with email to bug, either add user to bug

// Ca MP după rezolvarea unui bug pot adăuga un status al rezolvării cu un link la commit-ul prin care s-a rezolvat.
// 


// Aplicația are și un sistem de permisiuni. Un MP poate adăuga și modifica un proiect, poate actualiza status-ul unui bug. Un TST poate adăuga un bug.





app.listen(8080)