require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db')
const registerSocketHandlers = require("./sockets/index");
const {Server} = require('socket.io');

async function main() {
    await connectDB();
    
    const app = express();
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
        cors: {origin: CLIENT_ORIGIN, methods:['GET','POST', 'PATCH']}
    })

    app.use(cors({origin: CLIENT_ORIGIN}));
    app.use(express.json());

    app.use((req,res,next)=>{
        req.io = io;
        next();
    })
    
    app.use('/api/v1/calls', callRoutes);
    app.use('/api/outcomes',outcomeRoutes);
    app.use('/api/simulator', simulatorRoutes);
    
    // 404 handler
    app.use("/api", (req,res) => {
        res.status(404).json({error:"Not found"})
    });
    
    // Central error handler
    app.use((err, req, res, next) => {
       console.error("[Server] unhandled error: ", err);

       res.status(500).json({error:"internal server error"});
    });
    
    registerSocketHandlers(io)


}