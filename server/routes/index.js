const userRouter = require('./user')
const classRouter = require('./class')
const enrollmentRouter = require('./enrollment')
const {notFound, errorHandler} = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/class', classRouter)
    app.use('/api/enrollment', enrollmentRouter)

    app.use(notFound)
    app.use(errorHandler)
}

module.exports = initRoutes