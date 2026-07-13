//https://freedium-mirror.cfd/https://medium.com/@yannick.burkard/building-production-ready-hono-apis-a-modern-architecture-guide-fed8a415ca96
import {Context, Hono} from 'hono' 
import { HTTPException } from 'hono/http-exception';


const app = new Hono() 
app.notFound((c : Context) => {
    return c.text("Cloudian Notification Not Found")
})

// Global exption 
app.onError((err , c : Context) => {
    if (err instanceof HTTPException) 
        return c.json(
            {
                success: false, 
                message: "Cloudian Notification!!!", 
                error: err 
            }, 
            err.status
        ) 
    console.log(err) 
    return c.json(
        {
            success: false, 
            message: "Cloudian Notification!!! Internal Server Error" 
        }, 
        500 
    )
})

export default app 