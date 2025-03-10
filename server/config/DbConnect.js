const mongoose = require('mongoose');


const dbConnect = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        if(connection.connection.readyState === 1)
            console.log("DB connect successfully");
        else
            console.log("DB connecting");
            
        
    } catch (error) {
        console.log('DB connect failed');
        throw new Error(error)
    }

}

module.exports = dbConnect