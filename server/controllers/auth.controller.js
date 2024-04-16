import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";


const signup = async (req, res) => {
    try {
        const { fullName, userName, password, confirmPassword, gender } = req.body;
        // console.log(fullName, userName, password, confirmPassword, gender);

        //checking password and confirmPassword is same
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password Does not Match" });
        }
        //checking user if already exists with entered username
        const user = await User.findOne({ userName });
        if (user) {
            console.log(user)
            return res.status(400).json({ error: "Username already exists" });
        }
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating random profilePic for users based on their gender
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

        const newUser = new User({
            fullName,
            userName,
            password: hashedPassword,
            gender,
            profilePic: gender === "Male" ? boyProfilePic : girlProfilePic
        })

        if (newUser) {
            //Generating JWT Token
            await generateTokenAndSetCookie(newUser._id, res);

            await newUser.save();

            res.status(201).json({
                message: "User Created Successfully...",
                _id: newUser.id,
                fullName: newUser.fullName,
                userName: newUser.userName,
                gender: newUser.gender,
                profilePic: newUser.profilePic
            })
        }
        else {
            res.status(400).json({ error: "Invalid User Data..." });
        }

    }
    catch (error) {
        console.log("Error in Signup Controller... ", error.message)
        res.status(500).json({ error: "Internal Server Error..." })
    }
};

const login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await User.findOne({ userName });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid Credentials." })
        }
        await generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            message: "User is Logged in Successfully...",
            _id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            profilePic: user.profilePic
        });
    }
    catch (error) {
        console.log("Error in Login Controller....", error.message);
        res.status(500).json({ error: "Internal Server Error" });

    }
};

const logout = (req, res) => {
    res.send("logout")

};


export { signup, login, logout };