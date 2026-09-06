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
filterCard:{
    type:"equip",
},
selectCard:1,
filterTarget:true,
content:function(){
    target.discard(target.getCards("h").randomGet());

    if(!discardedCardIsEquip){
        target.damage();
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
        if(player.countCards("h")){
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
            if(card.name=="equip1"||card.name=="equip3"){
                return "tao";
            }
        },
    },
},
xs_wumou:{
    locked:true,
    forced:true,

    mod:{
        cardname:function(card,player){

            if(get.type(card)=="trick" 
            && card.name!="wuxie"){
                return "sha";
            }

        },

        cardUsable:function(card,num,player){

            if(get.type(card)=="trick"
            && card.name!="wuxie"){
                return Infinity;
            }

        },
    },
},






































	
			}
		
	


export default skills;
