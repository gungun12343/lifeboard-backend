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

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

main()
    .then(() => {
    console.log("connection successful");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/lifeboard");
}

const sessionOptions = {
    secret: "bfuefijeofJ7364g@",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));

app.get("/todo", async (req, res) => {
    let allTodos = await Todo.find({});
    res.json(allTodos);
})

app.post("/todo", async (req, res) => {
    let {todo} = req.body;
    const newTodo = new Todo({todo: todo});
    const result = await newTodo.save();
    res.json(newTodo);
})

app.post("/todo/:todoId/update", async (req, res) => {
    let {todoId} = req.params;
    let {check} = req.body;
    let todo = await Todo.findByIdAndUpdate(todoId, {isDone: check}, {new: true});
    res.json(todo);
})

app.delete("/todo/:todoId/", async (req, res) => {
    let {todoId} = req.params;
    let deletedTodo = await Todo.findByIdAndDelete(todoId);
    res.json(deletedTodo);
})

app.get("/event", async (req, res) => {
    let allEvents = await Event.find();
    res.send(allEvents);
})

app.post("/event", async(req, res) => {
    let {event} = req.body;
    const newEvent = new Event(event);
    await newEvent.save();
    res.send(newEvent);
})

app.delete("/event/:eventId", async(req, res) => {
    let {eventId} = req.params;
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    res.json(deletedEvent);
})

app.get("/journal", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const journal = await Journal.findOne({date: date});
    res.send(journal);
})

app.put("/journal", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    let {content} = req.body;
    const doc = await Journal.findOneAndUpdate({date: date}, {content: content}, {new: true, upsert: true, setDefaultsOnInsert: true})
    res.json(doc);
})

app.get("/habit", async (req, res) => {
    const habits = await Habit.find();
    res.json(habits);
})

app.post("/habit", async (req, res) => {
    const {name} = req.body;    
    let history = [];
    let start = dayjs().startOf("week").add(1, "day");
    for(let i=0; i<7; i++) {
        history.push({
            date: start.add(i, "day").format("YYYY-MM-DD"),
            completed: false,
        })
    }

    const habit = new Habit({name, history, streak:0});
    await habit.save();
    res.json(habit);
})

app.put("/habit/:habitId/:date", async (req, res) => {
    let {date, habitId} = req.params;
    const habit = await Habit.findById(habitId);
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
    await Habit.findByIdAndDelete(req.params.habitId);
    res.json({message: "habit deleted!"})
})

app.get("/mood", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const mood = await Mood.findOne({date: date});

    if(!mood) {
        return res.json("not found");
    }

    res.json(mood);
})

app.put("/mood", async (req, res) => {
    let date = new Date().toISOString().split("T")[0];
    const {feeling} = req.body;
    const mood = await Mood.findOneAndUpdate({date: date}, {mood: feeling}, {new: true, upsert: true, setDefaultsOnInsert: true});
    res.json(mood);
})

app.get("/goal", async (req, res) => {
    const allGoals = await Goal.find();
    res.json(allGoals);
})

app.post("/goal", async (req, res) => {
    let {title, target} = req.body;
    const newGoal = new Goal({title: title, target: target});
    await newGoal.save().then((result) => res.json(result))
    .catch((err) => res.json(err))
})

app.put("/goal/:goalId", async (req, res) => {
    let {goalId} = req.params;
    const goal = await Goal.findById(goalId);
    
    goal.done = goal.done+1;
    await goal.save().then((result) => res.json(result))
    .catch((err) => res.json({message: "some error"}));
})

app.delete("/goal/:goalId", async (req, res) => {
    let {goalId} = req.params;
    const deletedGoal = await Goal.findByIdAndDelete(goalId);
    res.json(deletedGoal);
})

app.get("/", (req, res) => {
    res.send("hello from root!!");
})

app.listen(8080, () => {
    console.log("listening to port 8080");
})