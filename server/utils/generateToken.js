import jwt from 'jsonwebtoken';


const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    })

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,   // convert days to millisecond
        httpOnly: true,     //prevent XSS attacks / cross-origin site Scripting attacks
        sameSite: "strict",  //prevent CSRF attacks cross-site request forgery attacks
        secure: process.env.MODE_ENV !== "development",

    })
};

export default generateTokenAndSetCookie;
