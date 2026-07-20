import express from 'express' ;
import dotenv from 'dotenv' ;
import cors from 'cors' ;

dotenv.config({path : "./.env"}) ;



const app = express() ;

const port = 3000; 

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
}
app.use(express.json({limit: '50mb'})) ;
app.use(cors(corsOptions)) ;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

