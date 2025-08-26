const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const Todo = require("./models/Todo.js");
const Event = require("./models/Event.js");
const Journal = require("./models/Journal.js");
const Habit = require("./models/Habit.js");
const dayjs = require("dayjs");
const Mood = require("./models/Mood.js");
const Goal = require("./models/Goal.js"); 
const session = require("express-session");
const passport = require("passport");
const User = require("./models/User.js");
const LocalStrategy = require("passport-local");
require("dotenv").config();

app.use(cors({origin: "https://lifeboard-frontend.onrender.com", credentials: true ,methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.options("*", cors());

// IMPORTANT for cookies behind proxy (Render/Cloudflare)
app.set("trust proxy", 1);

const DB_URL = process.env.DB_URL;
const MONGO_URL = "mongodb://127.0.0.1:27017/lifeboard";

main()
    .then(() => {
    console.log("connection successful");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(DB_URL);
}

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/todo", async (req, res) => {
    let allTodos = await Todo.find({userId: req.user._id}); 
    res.json(allTodos);
})

app.post("/todo", async (req, res) => {
    let {todo} = req.body;
    const newTodo = new Todo({userId: req.user._id, todo: todo});
    const result = await newTodo.save();
    res.json(newTodo);
})

// app.post("/todo/:todoId/update", async (req, res) => {
//     let {todoId} = req.params;
//     let {check} = req.body;
//     let todo = await Todo.findByIdAndUpdate(todoId, {isDone: check}, {new: true});
//     res.json(todo);
// })

app.post("/todo/:todoId/update", async (req, res) => {
    let {todoId} = req.params;
    let {check} = req.body;
    let todo = await Todo.findById(todoId);

    if(!todo.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"});
    }

    let updatedTodo = await Todo.findByIdAndUpdate(todoId, {isDone: check}, {new: true});
    res.json(updatedTodo);
})

app.delete("/todo/:todoId/", async (req, res) => {
    let {todoId} = req.params;
    let todo = await Todo.findById(todoId);

    if(!todo.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"});
    }

    let deletedTodo = await Todo.findByIdAndDelete(todoId);
    res.json(deletedTodo);
})

app.get("/event", async (req, res) => {
    let allEvents = await Event.find({userId: req.user._id});
    res.send(allEvents);
})

app.post("/event", async(req, res) => {
    let {event} = req.body;
    let name = event.name;
    let date = event.date;
    const newEvent = new Event({name: name, userId: req.user._id, date: date});
    await newEvent.save();
    res.send(newEvent);
})

app.delete("/event/:eventId", async(req, res) => {
    let {eventId} = req.params;
    let event = await Event.findById(eventId);

    if(!event.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"})
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    res.json(deletedEvent);
})

app.get("/journal", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({date: date, userId: req.user._id});
    res.send(journal);
})

app.put("/journal", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    let {content} = req.body;
    const doc = await Journal.findOneAndUpdate({date: date}, {content: content, userId: req.user._id}, {new: true, upsert: true, setDefaultsOnInsert: true})
    res.json(doc);
})

app.get("/habit", async (req, res) => {
    const habits = await Habit.find({userId: req.user._id});
    res.json(habits);
})

app.post("/habit", async (req, res) => {
    const {name} = req.body;    
    let history = [];
    let start = dayjs().startOf("week");
    for(let i=0; i<7; i++) {
        history.push({
            date: start.add(i, "day").format("YYYY-MM-DD"),
            completed: false,
        })
    }

    const habit = new Habit({name, userId: req.user._id, history, streak:0});
    await habit.save();
    res.json(habit);
})

app.put("/habit/:habitId/:date", async (req, res) => {
    let {date, habitId} = req.params;
    const habit = await Habit.findById(habitId);

    console.log(habit.userId, "=>", req.user._id);
    if(!habit.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"});
    }

    date = dayjs(date).format("YYYY-MM-DD");

    let entry = habit.history.find((d) => d.date === date);
    if(!entry) {
        entry = {date, completed: false};
        habit.history.push(entry);
    }

    entry.completed = !entry.completed;
    
    if(entry.completed) {
        let yesterday = dayjs(date).subtract(1, "day").format("YYYY-MM-DD");
        let yesterdayEntry = habit.history.find((d) => d.date === yesterday);

        if(yesterdayEntry && yesterdayEntry.completed) {
            habit.streak += 1;
        } else {
            habit.streak = 1;
        }
    } else {
        habit.streak = 0;
    }

    await habit.save();
    res.json(habit);
})

app.delete("/habit/:habitId", async (req, res) => {
    let {habitId} = req.params;
    let habit = await Habit.findById(habitId);

    if(!habit.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"});
    }

    await Habit.findByIdAndDelete(req.params.habitId);
    res.json({message: "habit deleted!"})
})

app.get("/mood", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const mood = await Mood.findOne({date: date, userId: req.user._id});

    if(!mood) {
        return res.json("not found");
    }

    res.json(mood);
})

app.put("/mood", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const {feeling} = req.body;
    const mood = await Mood.findOneAndUpdate({date: date}, {mood: feeling, userId: req.user._id}, {new: true, upsert: true, setDefaultsOnInsert: true});
    res.json(mood);
})

app.get("/goal", async (req, res) => {
    const allGoals = await Goal.find({userId: req.user._id});
    res.json(allGoals);
})

app.post("/goal", async (req, res) => {
    let {title, target} = req.body;
    const newGoal = new Goal({title: title, userId: req.user._id, target: target});
    await newGoal.save().then((result) => res.json(result))
    .catch((err) => res.json(err))
})

app.put("/goal/:goalId", async (req, res) => {
    let {goalId} = req.params;
    const goal = await Goal.findById(goalId);
    
    if(!goal.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"})
    }
    
    goal.done = goal.done+1;
    await goal.save().then((result) => res.json(result))
    .catch((err) => res.json({message: "some error"}));
})

app.delete("/goal/:goalId", async (req, res) => {
    let {goalId} = req.params;
    const goal = await Goal.findById(goalId);
    
    if(!goal.userId.equals(req.user._id)) {
        return res.status(400).json({message: "user not authorized!"})
    }

    const deletedGoal = await Goal.findByIdAndDelete(goalId);
    res.json(deletedGoal);
})

app.post("/signup", async (req, res, next) => {
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password); 
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        res.send(registeredUser);
    })
    
})

app.post("/login", passport.authenticate("local"), async (req, res) => {
    // console.log("user", req.user);
    // console.log("session", req.session);
    res.json({message: "User logged in successfully!"})
})

app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if(err) {
            return next(err);
        }
        res.status(200).json({message: "User logged out!"})
    })
})

function isAuthenticated(req, res, next) {
    if(!req.isAuthenticated()) {
        return res.status(401).json({message: "Not logged In"});
    }
    next();
}

app.get("/auth", isAuthenticated, (req, res) => {
    res.json({message: "you are logged in", user: req.user})
})

app.get("/", (req, res) => {
    res.send("hello from root!!");
})

app.use((err,req, res, next) => {
    let {status=500, message="some error occured"} = err;
    res.status(status).send(message);
})

app.listen(8080, () => {
    console.log("listening to port 8080");
})