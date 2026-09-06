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
            trigger.num++;
        }

        if(trigger.player&&trigger.player.name=="xiongshixiansheng"){
            trigger.num--;
            if(trigger.num<0) trigger.num=0;
        }

    },

},
    ftdh_feiha:{
    enable:"phaseUse",

    usable:1,

    filterCard:function(card){
        return get.type(card)=="equip";
    },

    position:"he",

    selectCard:1,

    filterTarget:function(card,player,target){
        return target!=player;
    },

    content:function(){

        "step 1"

        target.chooseCard(
            "飞蛤：请选择一张牌弃置",
            true
        ).set("ai",function(card){
            return -get.value(card);
        });


        "step 2"

        if(result.bool){

            var card=result.cards[0];

            target.discard(card);

            if(get.type(card)!="equip"){

                target.damage();

            }

        }

    },

    ai:{
        order:8,

        result:{
            target:-1
        }
    }

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







































	
			}
		
	


export default skills;
