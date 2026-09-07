import { lib, game, ui, get, ai, _status } from "../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
	//诗笺
	ye_skill:{
    trigger:{
        player:"phaseDrawBegin"
    },

    content:function(){
        player.draw();
    }
},
    ftdh_jiangshi:{
    locked:true,
    forced:true,

    trigger:{
        source:"damageBegin",
        player:"damageBegin"
    },

    filter:function(event,player){
        if(event.name!="damage") return false;

        if(event.source&&event.source.name=="xiongshixiansheng"){
            return true;
        }

        if(event.player&&event.player.name=="xiongshixiansheng"){
            return true;
        }

        return false;
    },

    content:function(){

        if(trigger.source&&trigger.source.name=="xiongshixiansheng"){
            trigger.num--;
        }

        if(trigger.player&&trigger.player.name=="xiongshixiansheng"){
            trigger.num++;
            if(trigger.num<0) trigger.num=0;
        }

    },

},
    ftdh_feiha:{
    enable:"phaseUse",

    filterCard:function(card){
        return get.type(card)=="equip";
    },

    selectCard:1,

    filterTarget:function(card,player,target){
        return player!=target;
    },

    content:function(){

        var card=target.getCards("h").randomGet();

        if(card){
            target.discard(card);

            if(get.type(card)!="equip"){
                target.damage(1);
            }
        }
    },

    ai:{
        order:8,
        result:{
            target:-1,
        },
    },
},
    ftdh_huawu:{
    locked:true,

    forced:true,

    trigger:{
        player:"dying"
    },

    content:function(){

        player.addTempSkill("ftdh_huawu_disable");

    },

},

    ftdh_huawu_disable:{

    mod:{

        cardEnabled:function(card,player){

            if(
                card.name=="tao"||
                card.name=="jiu"
            ){
                return false;
            }

        },

    },

},
xs_luoshi:{
    locked:true,
    forced:true,

    trigger:{
        player:"damageEnd",
    },

    filter:function(event,player){
        return event.num>=3;
    },

    content:function(){
        if(player.countCards("h")>0){
            player.discard(player.getCards("h"));
        }
        player.recover(3);
    },
},

xs_tanshi:{
    locked:true,
    forced:true,

    mod:{
        cardname:function(card,player){
            if(!card || !card.name) return;

            var info=lib.card[card.name];
            if(!info) return;

            if(info.subtype=="equip3" || info.subtype=="equip4"){
                return "tao";
            }
        },
    },
},

xs_wumou:{
    locked:true,
    enable:["chooseToUse","chooseToRespond"],

    filterCard:function(card,player){
        return get.type(card)=="trick" || get.type(card)=="delay";
    },

    position:"hes",

    viewAs:{
        name:"sha"
    },

    viewAsFilter:function(player){
        return player.countCards("hes",function(card){
            return get.type(card)=="trick" || get.type(card)=="delay";
        })>0;
    },

    prompt:"将一张锦囊牌当【杀】使用或打出",

    mod:{
        cardUsable:function(card,player,num){
            if(card.name=="sha"){
                return Infinity;
            }
        },
    },

    ai:{
        respondSha:true,
        order:4,
    },
},
gjc_youhua:{
    trigger:{
        player:"useCardToPlayered",
    },

    direct:true,

    filter:function(event,player){
        return event.target && event.target!=player;
    },

    content:function(){
        "step 0"

        player.chooseBool(
            "是否对"+get.translation(trigger.target)+"发动【幼化】，令其获得1枚“孩”标记？"
        ).set("ai",function(){
            return get.attitude(player,trigger.target)<0;
        });

        "step 1"

        if(result.bool){
            player.logSkill("gjc_youhua",trigger.target);

            trigger.target.addMark(
                "gjc_hai",
                1
            );
        }
    },

    ai:{
        expose:0.1,
    },
},
gjc_hai:{
    charlotte:true,
    mark:true,
    marktext:"孩",

    intro:{
        name:"孩",
        content:"当前有#枚“孩”标记",
    },
},
gjc_shitong:{
    enable:"phaseUse",
    usable:1,

    filter:function(event,player){
        return game.hasPlayer(function(current){
            return current!=player &&
                current.countMark("gjc_hai")>=5;
        });
    },

    filterTarget:function(card,player,target){
        return target!=player &&
            target.countMark("gjc_hai")>=5;
    },

    content:function(){
        "step 0"

        var num=target.countMark("gjc_hai");

        if(num>0){
            target.removeMark(
                "gjc_hai",
                num
            );
        }

        target.damage(2,player);

        "step 1"

        player.recover(2);
    },

    ai:{
        order:9,
        result:{
            target:-2,
            player:2,
        },
    },
},
gjc_huawu:{
    locked:true,
    forced:true,

    trigger:{
        player:"dying",
    },

    content:function(){
        player.addTempSkill(
            "gjc_huawu_disable"
        );
    },

    subSkill:{
        disable:{
            charlotte:true,

            mod:{
                cardSavable:function(card,player,target){
                    if(
                        target &&
                        target.hasSkill("gjc_huawu") &&
                        (
                            card.name=="tao" ||
                            card.name=="jiu"
                        )
                    ){
                        return false;
                    }
                },
            },
        },
    },
},






































	
			}
		
	


export default skills;
