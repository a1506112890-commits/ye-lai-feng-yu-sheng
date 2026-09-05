import { lib, game, ui, get, ai, _status } from "../../noname.js";
export const type = "extension";
export default function(){
	return {name:"夜来风雨声",arenaReady:function(){
    
},content:function(config,pack){
    
},prepare:function(){
    
},precontent:function(){
    
},help:{},config:{},package:{
    character: {
        character: {
            "飞天大蛤蟆": {
                sex: "male",
                group: "shen",
                hp: 5,
                maxHp: 5,
                hujia: 0,
                skills: [],
                img: "extension/夜来风雨声/飞天大蛤蟆.jpg",
                dieAudios: ["ext:夜来风雨声/audio/die/飞天大蛤蟆.mp3"],
            },
        },
        translate: {
            "飞天大蛤蟆": "飞天大蛤蟆",
            "夜来风雨声": "夜来风雨声",
        },
    },
    card: {
        card: {
        },
        translate: {
        },
        list: [],
    },
    skill: {
        skill: {
        },
        translate: {
        },
    },
    intro: "",
    author: "无名玩家",
    diskURL: "",
    forumURL: "",
    version: "1.0",
},files:{"character":["飞天大蛤蟆.jpg"],"card":[],"skill":[],"audio":[]},connect:false} 
};