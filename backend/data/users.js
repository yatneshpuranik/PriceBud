import bcrypt from "bcryptjs";

const user = [
    {
        name : "AJ",
        email : "aj@gmail.com",
        password : bcrypt.hashSync("123456" , 10 ),
        isAdmin : true 
    },
    {
        name : "PP",
        email : "pp@gmail.com",
        password : bcrypt.hashSync("123456" , 10 ),
        isAdmin : false 
    },
    {
        name : "YP",
        email : "yp@gmail.com",
        password : bcrypt.hashSync("123456" , 10 ),
        isAdmin : false 
    },
]

export default user ;