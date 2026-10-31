import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {randomInt} from 'node:crypto';
const app=express();app.use(express.static('public'));const server=createServer(app);const io=new Server(server);const rooms=new Map();
const norm=s=>String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
function publicRoom(r){return {code:r.code,host:r.host,phase:r.phase,round:r.round,players:r.players.map(p=>({id:p.id,name:p.name,submitted:!!r.answers[p.id],online:p.online})),history:r.history,words:r.phase==='reveal'||r.phase==='won'?r.revealed:null};}
function push(r){io.to(r.code).emit('state',publicRoom(r));}
function error(socket,msg){socket.emit('notice',msg);}
function join(socket,code,name,token){const r=rooms.get(code);if(!r)return error(socket,'房间不存在');let p=r.players.find(p=>p.token===token);if(!p){if(r.phase!=='lobby')return error(socket,'游戏已经开始，不能加入新玩家');if(r.players.length>=20)return error(socket,'房间人数已满');p={id:crypto.randomUUID(),token:crypto.randomUUID(),name:String(name||'玩家').trim().slice(0,16)||'玩家',online:true};r.players.push(p);}else{p.online=true;p.name=String(name||p.name).trim().slice(0,16)||p.name;}socket.join(code);socket.data={code,id:p.id};socket.emit('joined',{code,token:p.token,id:p.id});push(r);}
import crypto from 'node:crypto';
io.on('connection',socket=>{
 socket.on('create',name=>{let code;do{code=String(randomInt(100000,1000000))}while(rooms.has(code));rooms.set(code,{code,host:null,phase:'lobby',round:1,players:[],answers:{},history:[],revealed:null});join(socket,code,name,null);const r=rooms.get(code);r.host=socket.data.id;push(r);});
 socket.on('join',({code,name,token})=>join(socket,String(code||'').trim(),name,token));
 socket.on('start',()=>{const r=rooms.get(socket.data.code);if(!r||r.host!==socket.data.id)return;if(r.players.length<2)return error(socket,'至少需要两个人');r.phase='writing';r.round=1;r.answers={};r.history=[];r.revealed=null;push(r);});
 socket.on('submit',word=>{const r=rooms.get(socket.data.code);if(!r||r.phase!=='writing'||!r.players.some(p=>p.id===socket.data.id))return;word=String(word||'').trim().slice(0,40);if(!word)return error(socket,'请输入词语');if(r.answers[socket.data.id])return;r.answers[socket.data.id]=word;if(r.players.every(p=>r.answers[p.id])){r.revealed=r.players.map(p=>({name:p.name,word:r.answers[p.id]}));r.history.push({round:r.round,words:r.revealed});r.phase=new Set(r.revealed.map(x=>norm(x.word))).size===1?'won':'reveal';}push(r);});
 socket.on('next',()=>{const r=rooms.get(socket.data.code);if(!r||r.host!==socket.data.id||r.phase!=='reveal')return;r.round++;r.answers={};r.revealed=null;r.phase='writing';push(r);});
 socket.on('restart',()=>{const r=rooms.get(socket.data.code);if(!r||r.host!==socket.data.id)return;r.phase='lobby';r.round=1;r.answers={};r.revealed=null;r.history=[];push(r);});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.code);if(!r)return;const p=r.players.find(x=>x.id===socket.data.id);if(p){p.online=false;push(r);}});
});
server.listen(process.env.PORT||3000,()=>console.log('Listening on '+(process.env.PORT||3000)));
