const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')      

const moment = require('moment')    
var Sequelize = require('sequelize');


function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'sample.db',
    define: {
      timestamps: false
    }
  })


const Op=Sequelize.Op
const cors = require('cors')

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
    severity: Sequelize.STRING,
    priority: Sequelize.STRING,
    description: Sequelize.TEXT,
    link: Sequelize.STRING
})


const Permission = sequelize.define('permission', {
    permType: Sequelize.ENUM('read')
})


User.hasMany(Permission)
Project.hasMany(Permission)

Project.hasMany(User)
Project.hasMany(Bug)


const app = express();

app.use(express.json())

app.use(cors())
app.use(bodyParser.json())

const authRouter = express.Router()
const adminRouter = express.Router()  
const apiRouter = express.Router()  

app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/api', apiRouter)


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


adminRouter.post('/users', async (req, res) => {
    try {
        if (validateEmail(req.body.email) && req.body.password.length > 6) {
            const user = await User.findOne({ where: { email: req.body.email } })
            console.warn(user)
            if (!user){
                //const hashedPassword = sha256Hasher.update(req.body.password).digest("hex")
                // const hash = crypto.createHash('sha256');
                // hash.update
                // await User.create({ email: req.body.email, password: hashedPassword})       // creating the user with the hashed password
                await User.create(req.body)
                res.status(201).json({ message: 'created' })
            } else {
                res.status(409).json({ message: 'conflict - email already used'})
            }
        } else {
            res.status(418).json({ message: 'wrong credentials. need email format & password length > 6' })
        }

    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'user creation error' })
    }

})




authRouter.post('/login', async (req, res) => {
    try {
        const credentials = req.body
        // const hashedPassword = sha256Hasher.update(credentials.password).digest("hex")

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

authRouter.get('/logout', function(req, res) {
    req.logout()
    res.status(200).json({ message: 'logged out' })
})

// if you don't have the database already created, it could be needed for you to run this piece of code at first run, instead of the "app.get('/sync', async (req, res)" that follows 
// sequelize.sync({force: true})  
// .then(()=>console.log('created'))
// .catch((error)=>console.log(error));

app.get('/sync', async (req, res) => {
    try {
        await sequelize.sync({ force: true })
        res.status(201).json({ message: 'tables created' })
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})


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
        const project = await Project.findByPk(req.params.pid)
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

// JUST FOR TEST - whis will add a user to a project by email
apiRouter.post('/projects/:pid/users', async (req, res) => {
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


apiRouter.post('/users/:uid/projects', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.uid)
        if (user) {
            const token = req.headers.auth
            console.warn(token)
            console.warn(user.token)
            if (user.token === token) {
                const project = await Project.create(req.body)
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
                res.status(401).json({ message: 'you lack the authority to play around with someone else s data' })
            }
        }

        else {
            res.status(401).json({ message: 'you shall not pass' })
        }

    } catch (err) {
        next(err)
    }
})

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


apiRouter.get('/users/:uid/projects', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.uid)
        if (user) {
            const token = req.headers.auth
            if (user.token === token) {
                const projects = await Project.findAll({ where: { id: user.projectId }, include: [Bug, User] })      // if this doesn't work remove getter
                res.status(200).json(projects)
            } else {
                res.status(401).json({ message: 'not authorized' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})

app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.findAll({ include: [Bug, User] })
        res.status(200).json(projects)
    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})



apiRouter.put('/users/:uid/projects/:pid', async (req, res, next) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        const user = await User.findByPk(req.params.uid)
        if (user !== null && project != null) {
            const token = req.headers.auth
            if (user.token === token) {
                if (user.projectId === project.id) {            
                    //await project.update(req.body, { fields: ['repository', 'description']})  
                    project.description = req.body.description
                    project.save()
                    res.status(202).json({ message: 'accepted' })
                } else {
                    res.status(401).json({ message: 'you are not part of this project. you are not authorized to make changes' })
                }
            } else {
                res.status(401).json({ message: 'not authorized' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (err) {
        res.status(500).json({ message: 'some error occured' })
    }
})


apiRouter.delete('/users/:uid/projects/:pid', async (req, res, next) => {
    try {
        const project = await Project.findByPk(req.params.pid)
        const user = await User.findByPk(req.params.uid)
        if (user !== null && project != null) {
            const token = req.headers.auth
            if (user.token === token) {
                if (user.projectId === project.id) {    
                    await project.destroy()    // if let change both fields
                    res.status(202).json({ message: 'accepted' })
                } else {
                    res.status(401).json({ message: 'you are not part of this project. you are not authorized to make changes' })
                }
            } else {
                res.status(401).json({ message: 'not authorized' })
            }
        }

    } catch (err) {
        res.status(500).json({ message: 'some error occured' })
    }
})




// apiRouter.post('/users/:uid/projects/:pid/bugs', async (req, res, next) => {
//     try {
//         const user = await User.findByPk(req.params.uid)
//         const project = await Project.findByPk(req.params.pid)
//         if (user != null && project != null) {
//             const token = req.headers.auth
//             if (user.token === token) {
//                 // if the user is a member of the project
//                 if (user.projectId === project.id) {
//                     res.status(401).json({ message: 'not authorized. only testers are allowed to create bugs' })
//                 } else {
//                     // add only description - status added automatically
//                     const bug = req.body
//                     bug.status = 'pending'
//                     bug.projectId = project.id
//                     console.warn(bug)   // test this
//                     await Bug.create(bug)
//                     res.status(200).json({ message: 'created' })
//                 }
//             } else {
//                 res.status(401).json({ message: 'you lack the authority to play around with someone else s data' })
//             }
//         } else {
//             res.status(404).json({ message: 'not found' })
//         }

//     } catch (err) {
//         console.warn(err)
//         res.status(500).json({ message: 'some error occured' })
//     }
// })

//temporarly misplaced by
app.post('/projects/pid/bugs', async (req, res) => {
    try {
      const project = await Article.findByPk(req.params.pid)
      if (project) {
            const bug = req.body
            bug.projectId = project.id
            console.warn(bug)
            await Bug.create(bug)
            res.status(201).json({ message: 'created' })
          
        } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })



apiRouter.put('/users/:uid/projects/:pid/bugs/:bid', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.uid)
        const project = await Project.findByPk(req.params.pid)
        const bug = await Bug.findByPk(req.params.bid)
        if (user != null && project != null) {
            const token = req.headers.auth
            if (user.token === token) {
                if (user.projectId === project.id) {
                    if (bug && bug.projectId === project.id) {
                        await bug.update(req.body)
                        res.status(202).json({ message: 'accepted' })
                    } else {
                        res.status(404).json({ message: 'bug not found' })
                    }
                } else {
                    res.status(401).json({ message: 'not authorized. sorry, testers can only create bugs' })
                }
            } else {
                res.status(401).json({ message: 'you lack the authority to play around with someone else s data' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }

    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})




// apiRouter.get('/projects/:pid/bugs', async (req, res) => {
//     try {
//         const project = await Project.findByPk(req.params.pid)
//         if (project) {

//             // THIS VARIANT is with authorization. let only the users associated with the project see the bugs
//             // const token = req.headers.token
//             // const user = await User.findOne({ where: { token: token } })
//             // if (user.projectId === project.id) {
//             //     const bugs = await Bug.findAll({ where: { projectId: project.id }, include: Project })      // if this doesn't work remove getter
//             //     res.status(200).json(bugs)
//             // } else {
//             //     res.status(401).json({ message: 'not authorized' })
//             // }

//             // THIS VARIANT is without authorization. let all users see all bugs for all projects available
//             const bugs = await Bug.findAll({ where: { projectId: project.id }})      // if this doesn't work remove getter
//             console.warn(bugs.projectId)
//             console.warn(project.id)
//             res.status(200).json(bugs)

//         } else {
//             res.status(404).json({ message: 'not found' })
//         }
//     } catch (err) {
//         console.warn(err)
//         res.status(500).json({ message: 'some error occured' })
//     }
// })

//temporarly missplaced with
app.get('/projects/:pid/bugs', async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.pid)
      if (project) {
        const bugs = await project.getBugs()
  
        res.status(200).json(bugs)
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })




apiRouter.get('/users/:uid/projects/:pid/bugs', async (req, res) => {
    try {
        console.warn("I'm hereeeeeeee")
        const user = await User.findByPk(req.params.uid)
        const project = await Project.findByPk(req.params.pid)
        if (user != null && project != null) {
            const token = req.headers.auth
            if (user.token === token) {
                // if the user is a member of the project
                if (user.projectId === project.id) {
                    const bugs = await Bug.findAll({ where: { projectId: project.id }}) 
                    res.status(200).json(bugs)
                } else {
                    res.status(401).json({ message: 'not authorized. sorry, testers can only create bugs' })
                }
            } else {
                res.status(401).json({ message: 'you lack the authority to play around with someone else s data' })
            }
        } else {
            res.status(404).json({ message: 'not found' })
        }

    } catch (err) {
        console.warn(err)
        res.status(500).json({ message: 'some error occured' })
    }
})


app.listen(8080)
