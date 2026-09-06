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

    filter:function(event,player){
        return player.countCards("e")>0;
    },

    filterTarget:function(card,player,target){
        return target!=player && target.countCards("he")>0;
    },


    content:function(){
        "step 1"

        //弃置自己的装备牌
        player.chooseToDiscard(
            "e",
            true
        );


        "step 2"

        //随机弃置目标一张牌
        event.card=target.getCards("he").randomGet();

        target.discard(event.card);


        "step 3"

        //如果不是装备牌，造成伤害
        if(get.type(event.card)!="equip"){
            target.damage(1);
        }

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
