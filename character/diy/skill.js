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
lv_aichuan:{
    trigger:{
        player:"phaseBegin",
    },
    forced:true,

    init:function(player){
        if(!lib.card.lv_chuan_card){
            lib.card.lv_chuan_card={
                type:"basic",
                enable:true,
                notarget:true,

                async content(event,trigger,player){
                    game.countPlayer(function(current){
                        current.say("你再这么串我真受不了嘞");
                    });
                },

                ai:{
                    order:1,
                    useful:1,
                    value:1,
                    result:{
                        player:0,
                    },
                },
            };

            lib.translate.lv_chuan_card="串";
            lib.translate.lv_chuan_card_info=
                "出牌阶段使用。所有角色说：“你再这么串我真受不了嘞”。使用后销毁。";
        }
    },

    async content(event,trigger,player){
        const card=game.createCard2(
            "lv_chuan_card",
            "none",
            0
        );

        card.storage.lv_chuan=true;

        await player.gain(card,"gain2");
    },

    group:"lv_chuan_destroy",
},
lv_chuan_destroy:{
    charlotte:true,

    trigger:{
        global:[
            "useCardAfter",
            "cardsDiscardAfter"
        ],
    },

    forced:true,
    popup:false,

    filter:function(event,player){
        if(!event.cards) return false;

        return event.cards.some(function(card){
            return card &&
                (
                    card.name=="lv_chuan_card" ||
                    (
                        card.storage &&
                        card.storage.lv_chuan
                    )
                );
        });
    },

    async content(event,trigger,player){
        for(const card of trigger.cards){
            if(
                card &&
                (
                    card.name=="lv_chuan_card" ||
                    (
                        card.storage &&
                        card.storage.lv_chuan
                    )
                )
            ){
                card.remove();
            }
        }
    },
},

lv_kuangchuan:{
    locked:true,
    forced:true,

    trigger:{
        player:"damageBegin4",
    },

    filter:function(event,player){
        const cards=player.getCards("h");

        if(cards.length==0) return false;

        return cards.every(function(card){
            return card.name=="lv_chuan_card";
        });
    },

    content:function(){
        trigger.cancel();
    },
},
lv_yiqichuan:{
    enable:"phaseUse",
    usable:1,

    filter:function(event,player){
        return player.countCards("h",function(card){
            return card.name=="lv_chuan_card";
        })>0;
    },

    filterCard:function(card){
        return card.name=="lv_chuan_card";
    },

    position:"h",
    discard:false,
    lose:false,

    filterTarget:function(card,player,target){
        return target!=player;
    },

    async content(event,trigger,player){
        const target=event.target;
        const chuan=event.cards[0];

        await player.give(chuan,target);

        const result=
            await player.chooseToCompare(target).forResult();

        if(result.tie){
            await player.draw(3);
            await target.draw(3);

            await player.recover(2);
            await target.recover(2);
        }
        else if(result.bool){
            await player.draw(2);
        }
        else{
            await target.draw(2);
        }
    },

    ai:{
        order:7,
        result:{
            target:function(player,target){
                return -1;
            },
        },
    },
},





































	
			}
		
	


export default skills;
