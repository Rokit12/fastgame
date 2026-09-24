import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express(),http=createServer(app),io=new Server(http);
const rooms=new Map(); const prompts=['something you would pack for Mars','a food you could eat every day','something that makes a great gift','an object found in a classroom','something you would take camping','a useful kitchen object','something that belongs in a backpack','an object you would save in a fire'];
const rand=(a,b)=>Math.random()*(b-a)+a; const code=()=>Math.random().toString(36).slice(2,8).toUpperCase();
function publicGame(r){return {code:r.code,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,score:p.score})),round:r.round,timeLeft:Math.max(0,(r.expires-Date.now())/1000),duration:r.duration,prompt:r.prompt,holderId:r.holderId,hasAnswered:r.hasAnswered}};
function tick(r){clearInterval(r.tick);r.tick=setInterval(()=>{if(Date.now()>=r.expires){const p=r.players.get(r.holderId);if(p)p.score++;io.to(r.code).emit('game:update',publicGame(r));if(r.round>=5){clearInterval(r.tick);io.to(r.code).emit('game:over',publicGame(r));return}r.round++;r.prompt=prompts[Math.floor(Math.random()*prompts.length)];r.holderId=[...r.players.keys()][Math.floor(Math.random()*r.players.size)];r.hasAnswered=false;r.duration=rand(8,15);r.expires=Date.now()+r.duration*1000;}io.to(r.code).emit('game:update',publicGame(r));},100);}
io.on('connection',s=>{s.on('room:create',({name},cb)=>{let c=code();while(rooms.has(c))c=code();let r={code:c,players:new Map(),round:0,prompt:'',holderId:null,hasAnswered:false};r.players.set(s.id,{id:s.id,name,score:0});rooms.set(c,r);s.join(c);cb({ok:true,code:c,game:publicGame(r)})});
 s.on('room:join',({name,code},cb)=>{let r=rooms.get(code);if(!r)return cb({ok:false,error:'Room not found.'});if(r.round>0)return cb({ok:false,error:'Game already started.'});if(r.players.size>=12)return cb({ok:false,error:'Room is full.'});r.players.set(s.id,{id:s.id,name,score:0});s.join(code);io.to(code).emit('room:update',publicGame(r));cb({ok:true,game:publicGame(r)})});
 s.on('game:start',({code},cb)=>{let r=rooms.get(code);if(!r||r.players.size<2)return cb({ok:false,error:'Need at least 2 players.'});r.round=1;r.prompt=prompts[Math.floor(Math.random()*prompts.length)];r.holderId=[...r.players.keys()][Math.floor(Math.random()*r.players.size)];r.duration=rand(8,15);r.expires=Date.now()+r.duration*1000;r.hasAnswered=false;io.to(code).emit('game:started',publicGame(r));tick(r);cb({ok:true})});
 s.on('game:answer',({code,answer})=>{let r=rooms.get(code);if(!r||r.holderId!==s.id||!answer?.trim())return;r.hasAnswered=true;io.to(code).emit('game:update',publicGame(r))});
 s.on('game:pass',({code})=>{let r=rooms.get(code);if(!r||r.holderId!==s.id||!r.hasAnswered)return;let ids=[...r.players.keys()],i=ids.indexOf(s.id);r.holderId=ids[(i+1)%ids.length];r.hasAnswered=false;io.to(code).emit('game:update',publicGame(r))});
 s.on('disconnect',()=>{for(const [c,r] of rooms){if(r.players.delete(s.id)){if(r.players.size===0){clearInterval(r.tick);rooms.delete(c)}else if(r.holderId===s.id)r.holderId=[...r.players.keys()][0];io.to(c).emit('room:update',publicGame(r));}}});});
app.use(express.static(path.join(__dirname,'..','dist')));app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'..','dist','index.html')));
const PORT=process.env.PORT||3000;http.listen(PORT,()=>console.log(`PASS! server listening on ${PORT}`));
