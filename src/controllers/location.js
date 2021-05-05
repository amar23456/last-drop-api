const LocationModel = require("../models/LocationModel")


exports.postAddLocation= async(req,res) =>{
   const {location_name,user_id}=req.body
 
   const location= new LocationModel({
    location_name,
       user_id
   })

   location.save((result)=>{
    res.send(location)
   })
    
    
    

}