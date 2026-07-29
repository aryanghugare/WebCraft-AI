// File used to define the data types of the req object 
import {Request} from 'express'

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}