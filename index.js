import {db} from './db/index.js';
import {todosTable} from './db/schema.js';
import { ilike, eq } from 'drizzle-orm';
import OpenAI from "openai";

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
    const todos = await db.select().from(todosTable).where(ilike(todosTable.todo, search));
    return todos;
}

async function deleteTodo(id){
    const [deletedTodo] = await db.delete(todosTable).where(todosTable.id.eq(id)).returning({id: todosTable.id});
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
- deleteTodo: Delete a todo from the database by its ID.
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