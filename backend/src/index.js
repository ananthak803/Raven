import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'
import friendRoute from './routes/friendship.route.js'
import messageRoute from './routes/message.route.js'
import channelRoute from './routes/channel.route.js'

const app = express();

app.use((req,res,next)=>{
    console.log("Request: ",req.method,req.url);
    next();
})

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/user',userRoute);
app.use('/auth',authRoute);
app.use('/friend',friendRoute);
app.use('/message',messageRoute);
app.use('/channel',channelRoute);

export default app;
