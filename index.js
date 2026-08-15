import {db} from './db/index.js';
import {todosTable} from './db/schema.js';
import { ilike, eq } from 'drizzle-orm';
import OpenAI from "openai";
import dotenv from "dotenv";
import readlinesync from "readline-sync";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});


async function getAllTodos(){
    const  todos = await db.select().from(todosTable);
    return todos;
}
async function createTodo(todo){
    const [newTodo] = await db.insert(todosTable).values({todo}).returning({id: todosTable.id});
    return newTodo.id;
}
async function searchTodos(search){
    const todos = await db.select().from(todosTable).where(ilike(todosTable.todo, `%${search}%`));
    return todos;
}

async function deleteTodo(id){
    const [deletedTodo] = await db
        .delete(todosTable)
        .where(eq(todosTable.id, id))
        .returning({ id: todosTable.id });

    return deletedTodo;
}

const tools = {
    getAllTodos : getAllTodos,
    createTodo : createTodo,
    searchTodos : searchTodos,
    deleteTodo : deleteTodo
}
const SystemPrompt = `You are a helpful AI todo assistant with start , plan , action ,observation and output state.
Wait for the user prompt and first plan using the available tools .
After planning take the action with appropriate tools and wait for observations based on action .
Once you get the observations, return the ai response based on the start prompt and observations .

you must strictly follow the json format for output. 
you can manage tasks by adding , deleting, and searching for todos.
Todo  db Schema:
- id: integer, primary key, auto-increment
- todo : string, not null
- created_at: date, time 
- updated_at: date, time


Available tools:
- getAllTodos: Fetch all todos from the database.
- createTodo: Add a new todo to the database. Accepts a string parameter for the todo text. and returns the ID of the newly created todo. 
- searchTodos: Search for todos in the database that match a given string. Accepts a string parameter for the search query. 
- deleteTodo: Delete a todo from the database by its ID.For deleting a todo, first search for the todo to find its ID. Then use deleteTodo with that ID.
If multiple matching todos are found, ask the user which one they want to delete.
Example:
START
{ "type": "user", "user": "Add a task for shopping groceries." }
{ "type": "plan", "plan": "I will try to get more context on what user needs to shop." }
{ "type": "output", "output": "Can you tell me what all items you want to shop for?" }
{ "type": "user", "user": "I want to shop for milk, kurkure, lays and choco." }
{ "type": "plan", "plan": "I will use createTodo to create a new Todo in DB." }
{ "type": "action", "function": "createTodo", "input": "Shopping for milk, kurkure, lays and choco." }
{ "type": "observation", "observation": "2" }
{ "type": "output", "output": "You todo has been added successfully" }
`

const messages = [{role: "system", content: SystemPrompt}];

while(true){
    const userInput = readlinesync.question("User: ");
    const userMessage = {type: "user", user: userInput};
    messages.push({role: "user", content: JSON.stringify(userMessage)}); 
    while(true){
    const chat = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        response_format: {
            type: "json_object",}
        });
        const result = chat.choices[0].message.content;
        messages.push({role: "assistant", content: result});
        console.log("Start AI");
        console.log("AI Response: ", result);
        console.log("End AI");
        const action = JSON.parse(result);

        if(action.type === "output"){
            console.log("AI Output: ", action.output);
            break;
        }else if(action.type === "action"){
            const fns = tools[action.function];
            if(!fns){
                console.log("invalid tool call");  
                break;
            }
            const observation = await fns(action.input);
            const observationMessage = {type: "observation", observation: observation};
            messages.push({role: "user", content: JSON.stringify(observationMessage)});
        }
    }
}