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
        player:"damageBegin3",
    },

    filter:function(event,player){
        const cards=player.getCards("h");

        return cards.length>0 &&
            cards.every(function(card){
                return card.name=="lv_chuan_card";
            });
    },

    content:function(){
        trigger.num--;

        if(trigger.num<0){
            trigger.num=0;
        }
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


// ===== 影三十 =====

ys_dengji:{
    trigger:{
        global:"phaseBefore",
        player:"enterGame",
    },

    forced:true,
    skillAnimation:true,
    animationColor:"thunder",

    filter:function(event,player){
        if(event.name=="phase"){
            return game.phaseNumber==0;
        }
        return true;
    },

    init:function(player){
        if(!lib.card.ys_longpao){

            lib.card.ys_longpao={
                type:"equip",
                subtype:"equip5",

                // 龙袍离开装备区进入弃牌流程后直接销毁
                destroy:true,

                skills:[
                    "ys_longpao_effect"
                ],

                // 只有影三十能使用/装备
                enable:function(card,player){
                    return player.name=="yingsanshi";
                },

                filterTarget:function(card,player,target){
                    return (
                        player==target &&
                        player.name=="yingsanshi"
                    );
                },

                selectTarget:-1,

                ai:{
                    equipValue:10,
                },
            };

            lib.translate.ys_longpao="龙袍";
            lib.translate.ys_longpao_info=
            "宝物牌。仅影三十可以装备。离开装备区进入弃牌流程后销毁。影三十的摸牌阶段额外摸一张牌；其计算与其他角色的距离-1；其不能失去体力。";
        }
    },

    content:function(){
        var card=game.createCard2(
            "ys_longpao",
            "heart",
            13
        );

        player.equip(card);
    },

    group:"ys_dengji_return",
},

ys_dengji_return:{
    trigger:{
        player:"phaseBegin",
    },

    forced:true,
    popup:false,

    filter:function(event,player){
        return !player.getCards("e",function(card){
            return card.name=="ys_longpao";
        }).length;
    },

    content:function(){
        "step 0"

        // 宝物栏如果有其他宝物，先弃掉
        var treasures=player.getCards("e",function(card){
            if(!card || !card.name){
                return false;
            }

            var info=lib.card[card.name];

            return (
                info &&
                info.subtype=="equip5"
            );
        });

        if(treasures.length){
            player.discard(treasures);
        }

        "step 1"

        // 旧龙袍不追踪，直接重新生成
        var card=game.createCard2(
            "ys_longpao",
            "heart",
            13
        );

        player.equip(card);
    },
},

ys_longpao_effect:{
    equipSkill:true,

    trigger:{
        player:[
            "phaseDrawBegin2",
            "loseHpBefore"
        ],
    },

    forced:true,

    filter:function(event,player){
        if(event.name=="phaseDraw"){
            return !event.numFixed;
        }

        return event.name=="loseHp";
    },

    content:function(){
        if(trigger.name=="phaseDraw"){
            trigger.num++;
        }
        else{
            trigger.cancel();
        }
    },

    mod:{
        globalFrom:function(from,to,distance){
            return distance-1;
        },
    },
},

ys_feileishen:{
    enable:"phaseUse",
    usable:1,

    filterTarget:function(card,player,target){
        return target!=player;
    },

    content:function(){
        "step 0"

        event.ys_target=target;

        event.ys_target.chooseControl(
            "弃置一张牌",
            "受到1点雷电伤害"
        ).set(
            "prompt",
            "飞雷神：请选择一项"
        ).set("ai",function(){
            if(event.ys_target.countCards("he")>0){
                return 0;
            }
            return 1;
        });

        "step 1"

        if(result.index==0){

            if(event.ys_target.countCards("he")>0){

                event.ys_target.chooseToDiscard(
                    "he",
                    1,
                    true
                );

            }
            else{

                event.ys_target.damage(
                    1,
                    "thunder",
                    player
                );

            }
        }
        else{

            event.ys_target.damage(
                1,
                "thunder",
                player
            );

        }
    },

    ai:{
        order:8,
        result:{
            target:-1,
        },
    },
},

ys_zhongmu_start:{
    trigger:{
        global:"phaseBefore",
        player:"enterGame",
    },

    forced:true,
    popup:false,

    filter:function(event,player){

        if(player.countMark("ys_langqun")>0){
            return false;
        }

        if(event.name=="phase"){
            return game.phaseNumber==0;
        }

        return true;
    },

    content:function(){
        player.addMark(
            "ys_langqun",
            3
        );
    },
},

ys_langqun:{
    charlotte:true,
    mark:true,
    marktext:"狼",

    intro:{
        content:"当前有#枚“狼群”标记",
    },
},

ys_zhongmu:{
    enable:"phaseUse",

    limited:true,
    skillAnimation:true,
    animationColor:"fire",

    filter:function(event,player){
        return (
            player.countMark("ys_langqun")>=3 &&
            player.getEnemies().length>0
        );
    },

    content:function(){

        player.awakenSkill("ys_zhongmu");

        var enemies=player.getEnemies().slice(0);

        enemies.randomSort();

        var targets=enemies.slice(
            0,
            Math.min(3,enemies.length)
        );

        player.removeMark(
            "ys_langqun",
            player.countMark("ys_langqun")
        );

        for(var i=0;i<targets.length;i++){

            // 让噬咬真正出现在目标身上并拥有结算能力
            targets[i].addSkill("ys_shiyao");

            targets[i].addMark(
                "ys_shiyao",
                1
            );

            targets[i].popup(
                "噬咬",
                "fire"
            );
        }
    },

    group:"ys_zhongmu_start",

    ai:{
        order:10,
        result:{
            player:1,
        },
    },
},

ys_shiyao:{
    charlotte:true,
    mark:true,
    marktext:"咬",

    intro:{
        content:
        "弃牌阶段开始时随机弃置装备区一张牌；结束阶段开始时，若手牌中没有基本牌，则受到影三十造成的1点火焰伤害。只有该伤害实际造成后，才移除此标记。",
    },

    group:[
        "ys_shiyao_discard",
        "ys_shiyao_damage",
        "ys_shiyao_remove",
        "ys_shiyao_cleanup"
    ],
},

ys_shiyao_discard:{
    trigger:{
        player:"phaseDiscardBegin",
    },

    forced:true,
    popup:false,

    filter:function(event,player){
        return (
            player.countMark("ys_shiyao")>0 &&
            player.countCards("e")>0
        );
    },

    content:function(){

        var cards=player.getCards("e");

        if(cards.length){
            player.discard(
                cards.randomGet()
            );
        }
    },
},

ys_shiyao_damage:{
    trigger:{
        player:"phaseJieshuBegin",
    },

    forced:true,
    popup:false,

    filter:function(event,player){

        if(player.countMark("ys_shiyao")<=0){
            return false;
        }

        // 手牌有基本牌则不受伤，噬咬继续保留
        return !player.hasCard(function(card){

            if(!card || !card.name){
                return false;
            }

            var info=lib.card[card.name];

            return (
                info &&
                info.type=="basic"
            );

        },"h");
    },

    content:function(){

        // 标记这一次即将发生的伤害来自噬咬
        player.storage.ys_shiyao_pending=true;

        var source=game.findPlayer(function(current){
            return current.name=="yingsanshi";
        });

        if(source){

            player.damage(
                2,
                "fire",
                source
            );

        }
        else{

            player.damage(
                2,
                "fire"
            );

        }
    },
},

ys_shiyao_remove:{
    trigger:{
        player:"damageEnd",
    },

    forced:true,
    popup:false,

    filter:function(event,player){

        return (
            player.storage.ys_shiyao_pending===true &&
            player.countMark("ys_shiyao")>0
        );
    },

    content:function(){

        delete player.storage.ys_shiyao_pending;

        player.removeMark(
            "ys_shiyao",
            player.countMark("ys_shiyao")
        );

        player.removeSkill("ys_shiyao");
    },
},

ys_shiyao_cleanup:{
    trigger:{
        player:"phaseJieshuAfter",
    },

    forced:true,
    popup:false,

    filter:function(event,player){
        return player.storage.ys_shiyao_pending===true;
    },

    content:function(){

        // 如果伤害被防止，没有触发damageEnd，
        // 这里只清pending，不清噬咬
        delete player.storage.ys_shiyao_pending;
    },
},

ys_maomao:{
    trigger:{
        player:[
            "damageEnd",
            "phaseBegin"
        ],
    },

    forced:true,

    init:function(player){
        player.storage.ys_maomao_damage=false;
        player.storage.ys_maomao_lethal=false;
    },

    filter:function(event,player){

        // 自己回合开始：重置两项
        if(event.name=="phase"){
            return true;
        }

        if(event.name=="damage"){

            // 第一次普通受伤尚未触发
            if(!player.storage.ys_maomao_damage){
                return true;
            }

            // 第一次致命伤害尚未触发
            if(
                !player.storage.ys_maomao_lethal &&
                player.hp<=0
            ){
                return true;
            }
        }

        return false;
    },

    content:function(){

        // ===== 回合开始：重置 =====
        if(trigger.name=="phase"){

            player.storage.ys_maomao_damage=false;
            player.storage.ys_maomao_lethal=false;

            return;
        }


        // ===== 受到伤害 =====

        var recoverNum=0;


        // 本轮第一次受到伤害
        if(!player.storage.ys_maomao_damage){

            player.storage.ys_maomao_damage=true;

            recoverNum++;
        }


        // 本轮第一次受到致命伤害
        if(
            player.hp<=0 &&
            !player.storage.ys_maomao_lethal
        ){

            player.storage.ys_maomao_lethal=true;

            recoverNum++;
        }


        if(recoverNum>0){

            player.recover(recoverNum);

        }
    },
},

ys_yelaifengyusheng:{
    zhuSkill:true,
    locked:true,

    trigger:{
        player:"dying",
    },

    forced:true,

    content:function(){
        "step 0"

        event.savers=game.filterPlayer(function(current){

            return (
                current!=player &&
                current.countCards("h",function(card){
                    return card.name=="tao";
                })>0
            );

        });

        event.index=0;

        "step 1"

        if(
            player.hp>0 ||
            event.index>=event.savers.length
        ){
            event.finish();
            return;
        }

        event.current=event.savers[event.index];

        // 这个角色已经没有桃了，换下一个
        if(
            event.current.countCards("h",function(card){
                return card.name=="tao";
            })<=0
        ){
            event.index++;
            event.goto(1);
            return;
        }

        var tao=event.current.getCards(
            "h",
            function(card){
                return card.name=="tao";
            }
        )[0];

        if(tao){

            // 强制消耗桃
            event.current.discard(tao);

            player.recover(1);
        }

        "step 2"

        // 仍然濒死，而且这个人还有桃，则继续强制救
        if(
            player.hp<=0 &&
            event.current.countCards("h",function(card){
                return card.name=="tao";
            })>0
        ){
            event.goto(1);
        }
        else{
            event.index++;
            event.goto(1);
        }
    },
},

sf_daguo:{

    trigger:{
        player:"recoverBegin",
    },

    forced:true,

    filter:function(event,player){

        return (
            event.card &&
            event.card.name=="tao"
        );

    },


    content:function(){

        trigger.num++;

    },


    group:[
        "sf_daguo_maxhp",
        "sf_daguo_get"
    ],

},
sf_daguo_maxhp:{

    enable:"phaseUse",

    usable:1,


    filter:function(event,player){

        return (
            player.hp==player.maxHp &&
            player.countCards("h",function(card){

                return card.name=="tao";

            })>0
        );

    },


    filterCard:function(card){

        return card.name=="tao";

    },


    position:"h",


    selectCard:1,


    content:function(){

        player.gainMaxHp(1);

        player.draw(1);

    },


    ai:{

        order:9,

        result:{
            player:1,
        },

    },

},
sf_daguo_get:{
    trigger:{
        global:"cardsDiscardAfter",
    },

    direct:true,

    filter:function(event,player){

        if(!event.cards || !event.cards.length){
            return false;
        }

        // 如果这批牌来自“使用牌”的流程，则不能捡
        var useEvent=event.getParent("useCard");

        if(useEvent){
            return false;
        }

        return event.cards.some(function(card){
            return (
                card &&
                card.name=="tao" &&
                get.position(card,true)=="d"
            );
        });
    },

    content:function(){
        "step 0"

        event.daguo_cards=trigger.cards.filter(function(card){
            return (
                card &&
                card.name=="tao" &&
                get.position(card,true)=="d"
            );
        });

        if(!event.daguo_cards.length){
            event.finish();
            return;
        }

        player.chooseBool(
            "大果：是否捡起"+get.translation(event.daguo_cards)+"？"
        ).set("ai",function(){
            return true;
        });

        "step 1"

        if(result.bool){

            player.logSkill("sf_daguo");

            player.gain(
                event.daguo_cards,
                "gain2"
            );
        }
    },
},

sf_zhengdan:{
    global:"sf_zhengdan_button",
},
sf_zhengdan_button:{
    enable:"phaseUse",
    usable:1,

    filter:function(event,player){
        return game.hasPlayer(function(current){
            return current.hasSkill("sf_zhengdan");
        });
    },

    content:function(){
        "step 0"

        event.sf=game.findPlayer(function(current){
            return current.hasSkill("sf_zhengdan");
        });

        if(!event.sf){
            event.finish();
            return;
        }

        player.chooseBool(
            "是否要找名侦探橘雪莉来搞点随机事件૮◉▿▿▿◉ა"
        ).set("ai",function(){
            return true;
        });

        "step 1"

        if(!result.bool){
            event.finish();
            return;
        }

        // SF摸一张
        event.sf.draw();

        // 用当前回合角色投骰子，更符合“他点击搞事”
        player.throwDice();

        "step 2"

        var num=event.num;

game.log(
    player,
    "的【蒸蛋】骰子结果为",
    "#y"+num
);


// ===== 1点 =====
if(num==1){

    player.say("真倒霉");

    player.damage(
        1,
        "thunder",
        "nosource"
    );

    event.finish();
    return;
}


// ===== 2点 =====
if(num==2){

    var enemies=event.sf.getEnemies().filter(function(current){
        return current.isIn();
    });

    // 没有敌人，这个骰面不产生效果
    if(!enemies.length){
        event.finish();
        return;
    }

    event.zd_enemy=enemies.randomGet();

    // 随机一名SF敌人受到1点无来源普通伤害
    event.zd_enemy.damage(
        1,
        "normal",
        "nosource"
    );

    event.goto(3);
    return;
}


// ===== 3点 =====
if(num==3){

    game.countPlayer(function(current){
        current.say("真lucky");
        current.draw();
    });

    event.finish();
    return;
}

        // ===== 4点 =====
        if(num==4){

            player.say("这sf太坏了");

            player.turnOver();
            player.draw();

            event.finish();
            return;
        }

        // ===== 5点 =====
        // ===== 5点 =====
        if(num==5){

    var allPlayers=game.filterPlayer(function(current){
        return current.isIn();
    });

    if(!allPlayers.length){
        event.finish();
        return;
    }

    // 四次独立随机，可以随机到同一个人
    var fireTarget=allPlayers.randomGet();
    var recoverTarget=allPlayers.randomGet();
    var turnTarget=allPlayers.randomGet();
    var drawTarget=allPlayers.randomGet();

    event.sf.say(
        "不是我害了你，是这个乱世害了你啊"
    );

    // 随机一人受到1点无来源火焰伤害
    if(fireTarget && fireTarget.isIn()){
        fireTarget.damage(
            1,
            "fire",
            "nosource"
        );
    }

    // 保存剩余三个目标，伤害结算完继续
    event.zd_recoverTarget=recoverTarget;
    event.zd_turnTarget=turnTarget;
    event.zd_drawTarget=drawTarget;

    event.goto(5);
    return;
}
        // ===== 6点 =====
        if(num==6){

            player.say("中大奖了！");

            player.draw(3);
            player.recover(1);

            event.goto(10);
            return;
        }

        event.finish();


        // =================================================
        // 2点：所有角色依次随机弃一张牌
        // =================================================

        

        // =================================================
        // 5点：剩下三个随机效果
        // =================================================
   "step 3"

if(
    event.zd_enemy &&
    event.zd_enemy.isIn()
){

    var hs=event.zd_enemy.getCards("h");

    if(hs.length){
        event.zd_enemy.discard(hs);
    }
}

event.finish();
return;
      "step 5"

if(
    event.zd_recoverTarget &&
    event.zd_recoverTarget.isIn()
){
    event.zd_recoverTarget.recover(1);
}

"step 6"

if(
    event.zd_turnTarget &&
    event.zd_turnTarget.isIn()
){
    event.zd_turnTarget.turnOver();
}

"step 7"

if(
    event.zd_drawTarget &&
    event.zd_drawTarget.isIn()
){
    event.zd_drawTarget.draw(2);
}

event.finish();


        // =================================================
        // 6点：随机补满空装备栏
        // =================================================

        "step 10"

        event.zd_slots=[
            "equip1",
            "equip2",
            "equip3",
            "equip4",
            "equip5"
        ];

        event.zd_slotIndex=0;

        "step 11"

        if(event.zd_slotIndex>=event.zd_slots.length){
            event.finish();
            return;
        }

        var subtype=
            event.zd_slots[event.zd_slotIndex];

        event.zd_slotIndex++;

        // 此装备栏已有装备，跳过
        if(player.getEquip(subtype)){
            event.goto(11);
            return;
        }

        // 从牌堆中找一张对应类型装备
        var equip=get.cardPile(function(card){

            if(!card || !card.name){
                return false;
            }

            var info=lib.card[card.name];

            return (
                info &&
                info.type=="equip" &&
                info.subtype==subtype
            );
        });

        if(equip){
            player.equip(equip);
        }

        event.goto(11);
    },

    ai:{
        order:1,
        result:{
            player:0.5,
        },
    },
},


sf_hongquan:{
    limited:true,

    skillAnimation:true,

    animationColor:"fire",

    enable:"phaseUse",

    filterTarget:function(card,player,target){

        return (
            target!=player &&
            target.name!="yingsanshi"
        );

    },

    content:function(){

        player.awakenSkill(
            "sf_hongquan"
        );


        var num=
        player.maxHp-player.hp-1;


        if(num<1){
            num=1;
        }


        target.damage(
            num,
            "normal",
            player
        );

    },
},

// ===== 鸫溟 =====

dm_gaoshu:{
    trigger:{
        player:"damageEnd",
    },

    forced:true,

    init:function(player){

        // 动态注册“薯条”
        if(!lib.card.dm_shutiao){

            lib.card.dm_shutiao={
                type:"trick",
                enable:true,
                notarget:true,

                // 稳定版：使用后直接销毁，不进入弃牌堆/牌堆
                destroy:true,

                content:function(){

                    // 使用者摸一张牌
                    player.draw();

                    // 鸫溟获得1枚“薯”
                    var owner=game.findPlayer(function(current){
                        return current.name=="dongming";
                    });

                    if(owner){
                        owner.addMark(
                            "dm_shu",
                            1
                        );
                    }
                },

                ai:{
                    order:8,
                    useful:5,
                    value:5,
                    result:{
                        player:1,
                    },
                },
            };

            lib.translate.dm_shutiao="薯条";
            lib.translate.dm_shutiao_info=
            "锦囊牌。使用后你摸一张牌，并令鸫溟获得1枚“薯”标记。此牌使用后销毁。";
        }
    },

    // 每受到1点伤害获得1张薯条
    content:function(){

        var num=trigger.num;

        if(num<1){
            num=1;
        }

        var cards=[];

        for(var i=0;i<num;i++){

            cards.push(
                game.createCard2(
                    "dm_shutiao",
                    "none",
                    0
                )
            );
        }

        player.gain(
            cards,
            "gain2"
        );
    },

    group:[
        "dm_gaoshu_lebu_use",
        "dm_gaoshu_lebu_discard",
        "dm_gaoshu_die"
    ],
},

// 使用或打出【乐不思蜀】
dm_gaoshu_lebu_use:{
    trigger:{
        player:[
            "useCardAfter",
            "respondAfter"
        ],
    },

    forced:true,
    popup:false,

    filter:function(event,player){

        return (
            event.card &&
            event.card.name=="lebu"
        );
    },

    content:function(){

        var card=game.createCard2(
            "dm_shutiao",
            "none",
            0
        );

        player.gain(
            card,
            "gain2"
        );
    },
},

// 弃置【乐不思蜀】
dm_gaoshu_lebu_discard:{
    trigger:{
        player:"loseAfter",
    },

    forced:true,
    popup:false,

    filter:function(event,player){

        if(event.type!="discard"){
            return false;
        }

        var cards=event.cards2 || event.cards;

        if(!cards){
            return false;
        }

        return cards.some(function(card){
            return card.name=="lebu";
        });
    },

    content:function(){

        var cards=trigger.cards2 || trigger.cards;

        var num=cards.filter(function(card){
            return card.name=="lebu";
        }).length;

        var gains=[];

        for(var i=0;i<num;i++){

            gains.push(
                game.createCard2(
                    "dm_shutiao",
                    "none",
                    0
                )
            );
        }

        if(gains.length){

            player.gain(
                gains,
                "gain2"
            );
        }
    },
},

// 每当有角色死亡
dm_gaoshu_die:{
    trigger:{
        global:"dieAfter",
    },

    forced:true,
    popup:false,

    content:function(){

        var card=game.createCard2(
            "dm_shutiao",
            "none",
            0
        );

        player.gain(
            card,
            "gain2"
        );
    },
},

// “薯”标记
dm_shu:{
    charlotte:true,
    mark:true,
    marktext:"薯",

    intro:{
        content:"当前有#枚“薯”标记",
    },
},

// ===== 食薯：未觉醒版，每阶段限一次 =====

dm_shishu:{
    enable:"phaseUse",
    usable:1,

    filter:function(event,player){
        return player.countMark("dm_shu")>0;
    },

    content:function(){
        "step 0"

        player.chooseControl(
            "恢复1点体力",
            "摸三张牌",
            "所有角色获得一张薯条"
        ).set(
            "prompt",
            "食薯：移去1枚“薯”标记并选择一项"
        ).set("ai",function(){

            if(player.hp<player.maxHp){
                return 0;
            }

            return 1;
        });

        "step 1"

        player.removeMark(
            "dm_shu",
            1
        );

        if(result.index==0){

            player.recover(1);

            event.finish();
            return;
        }

        if(result.index==1){

            player.draw(3);

            event.finish();
            return;
        }

        if(result.index==2){

            var list=game.filterPlayer();

            for(var i=0;i<list.length;i++){

                var card=game.createCard2(
                    "dm_shutiao",
                    "none",
                    0
                );

                list[i].gain(
                    card,
                    "gain2"
                );
            }

            event.finish();
            return;
        }
    },

    ai:{
        order:7,
        result:{
            player:1,
        },
    },
},

// ===== 食薯：觉醒后无限版 =====

dm_shishu_inf:{
    enable:"phaseUse",

    filter:function(event,player){
        return player.countMark("dm_shu")>0;
    },

    content:function(){
        "step 0"

        player.chooseControl(
            "恢复1点体力",
            "摸三张牌",
            "所有角色获得一张薯条"
        ).set(
            "prompt",
            "食薯：移去1枚“薯”标记并选择一项"
        ).set("ai",function(){

            if(player.hp<player.maxHp){
                return 0;
            }

            return 1;
        });

        "step 1"

        player.removeMark(
            "dm_shu",
            1
        );

        if(result.index==0){

            player.recover(1);

            event.finish();
            return;
        }

        if(result.index==1){

            player.draw(3);

            event.finish();
            return;
        }

        if(result.index==2){

            var list=game.filterPlayer();

            for(var i=0;i<list.length;i++){

                var card=game.createCard2(
                    "dm_shutiao",
                    "none",
                    0
                );

                list[i].gain(
                    card,
                    "gain2"
                );
            }

            event.finish();
            return;
        }
    },

    ai:{
        order:7,
        result:{
            player:1,
        },
    },
},

// ===== 吃饱变异 =====

dm_chibao:{
    trigger:{
        player:"phaseBegin",
    },

    juexingji:true,
    forced:true,

    skillAnimation:true,
    animationColor:"wood",

    filter:function(event,player){

        return (
            !player.storage.dm_chibao_awakened &&
            player.countMark("dm_shu")>=6
        );
    },

    content:function(){
        "step 0"

        player.storage.dm_chibao_awakened=true;

        player.awakenSkill(
            "dm_chibao"
        );

        player.gainMaxHp(3);

        "step 1"

        player.recover(3);

        "step 2"

        // 把“限一次食薯”替换成“无限食薯”
        player.removeSkill(
            "dm_shishu"
        );

        player.addSkill(
            "dm_shishu_inf"
        );
    },
},

// ===== 小度 =====

// -------------------------------------------------
// 度叠
// 初始为阳；每次发动后切换阴/阳
// -------------------------------------------------

xd_dudie:{
    enable:"phaseUse",
    usable:1,

    zhuanhuanji:true,
    mark:true,
    marktext:"☯",

    intro:{
        content:function(storage,player){
            if(player.storage.xd_dudie){
                return "当前为阴：弃置一张手牌并失去1点体力，然后令一名角色增加1点体力上限并回复1点体力。";
            }
            return "当前为阳：废除一个装备栏，视为使用一张普通锦囊牌。";
        },
    },

    filter:function(event,player){

        // 阴
        if(player.storage.xd_dudie){
            return player.countCards("h")>0;
        }

        // 阳
        for(var i=1;i<=5;i++){
            if(player.hasEnabledSlot(i)){
                return true;
            }
        }

        return false;
    },

    content:function(){
        "step 0"

        // 记录发动前状态：false=阳，true=阴
        event.xd_yin=!!player.storage.xd_dudie;

        // 发动后切换阴阳
        player.changeZhuanhuanji("xd_dudie");

        if(event.xd_yin){

            // ===== 阴 =====
            player.chooseToDiscard(
                "h",
                1,
                true,
                "度叠·阴：弃置一张手牌"
            );

        }
        else{

            // ===== 阳 =====
            var list=[];

            if(player.hasEnabledSlot(1)) list.push("武器栏");
            if(player.hasEnabledSlot(2)) list.push("防具栏");
            if(player.hasEnabledSlot(3)) list.push("防御马栏");
            if(player.hasEnabledSlot(4)) list.push("进攻马栏");
            if(player.hasEnabledSlot(5)) list.push("宝物栏");

            player.chooseControl(list).set(
                "prompt",
                "度叠·阳：选择一个装备栏废除"
            );
        }


        "step 1"

        // =================================================
        // 阴：弃牌后继续
        // =================================================
        if(event.xd_yin){

            if(
                !result.bool ||
                !result.cards ||
                !result.cards.length
            ){
                event.finish();
                return;
            }

            event.xd_discarded=result.cards[0];

            // 是否弃的是串或薯条
            event.xd_special=(
                event.xd_discarded.name=="lv_chuan_card" ||
                event.xd_discarded.name=="dm_shutiao"
            );

            // 失去1点体力
            player.loseHp(1);

            return;
        }


        // =================================================
        // 阳：废除装备栏
        // =================================================

        var map={
            "武器栏":"equip1",
            "防具栏":"equip2",
            "防御马栏":"equip3",
            "进攻马栏":"equip4",
            "宝物栏":"equip5"
        };

        event.xd_slot=map[result.control];

        if(!event.xd_slot){
            event.finish();
            return;
        }

        player.disableEquip(event.xd_slot);


        "step 2"

        // =================================================
        // 阴：失去体力后，选择目标
        // =================================================
        if(event.xd_yin){

            player.chooseTarget(
                "度叠·阴：选择一名角色，其增加1点体力上限并回复1点体力",
                true
            );

            return;
        }


        // =================================================
        // 阳：选择普通锦囊
        // =================================================

        var tricks=[];

        for(var i=0;i<lib.inpile.length;i++){

            var name=lib.inpile[i];

            if(!lib.card[name]){
                continue;
            }

            if(lib.card[name].type=="trick"){
                tricks.push(name);
            }
        }

        if(!tricks.length){
            event.finish();
            return;
        }

        player.chooseButton(
            [
                "度叠·阳：选择一张锦囊牌",
                [tricks,"vcard"]
            ],
            true
        );


        "step 3"

        // =================================================
        // 阴：目标处理
        // =================================================
        if(event.xd_yin){

            if(
                !result.bool ||
                !result.targets ||
                !result.targets.length
            ){
                event.finish();
                return;
            }

            event.xd_target=result.targets[0];

            event.xd_target.gainMaxHp(1);

            return;
        }


        // =================================================
        // 阳：使用锦囊
        // =================================================

        if(
            !result.bool ||
            !result.links ||
            !result.links.length
        ){
            event.finish();
            return;
        }

        event.xd_trick=result.links[0][2];

        player.chooseUseTarget(
            {
                name:event.xd_trick,
                isCard:true
            },
            true,
            false
        );

        event.finish();
        return;


        "step 4"

        // =================================================
        // 阴：回复1点体力
        // =================================================

        if(!event.xd_yin){
            event.finish();
            return;
        }

        if(
            event.xd_target &&
            event.xd_target.isIn()
        ){
            event.xd_target.recover(1);
        }


        "step 5"

        // =================================================
        // 阴：弃串/薯条则恢复所有废除装备栏
        // =================================================

        if(
            event.xd_yin &&
            event.xd_special
        ){

            for(var i=1;i<=5;i++){

                if(!player.hasEnabledSlot(i)){
                    player.enableEquip("equip"+i);
                }
            }
        }

        event.finish();
    },

    ai:{
        order:7,
        result:{
            player:1,
        },
    },
},

// -------------------------------------------------
// 破梏重生
// -------------------------------------------------

xd_pogu:{
    limited:true,
    skillAnimation:true,
    animationColor:"water",

    trigger:{
        player:"dying",
    },

    forced:true,

    filter:function(event,player){
        return !player.storage.xd_pogu_used;
    },

    content:function(){
        "step 0"

        player.storage.xd_pogu_used=true;

        player.awakenSkill(
            "xd_pogu"
        );


        "step 1"

        event.xd_newCharacter=[
            "xiaodu_sihengtuo"
        ];

        player.changeCharacter(
            event.xd_newCharacter
        );


        "step 2"

        // 恢复所有被废除的装备栏
        for(var i=1;i<=5;i++){

            if(!player.hasEnabledSlot(i)){

                player.enableEquip(
                    "equip"+i
                );

            }
        }


        "step 3"

        // 变身后固定为3点体力上限
        player.maxHp=3;

        // 直接回满
        player.hp=player.maxHp;

        player.update();


        "step 4"

        // 摸四张牌
        player.draw(4);
    },
},


// ===== 小度·思衡托 =====

// -------------------------------------------------
// 拒止
// 初始阳，每次发动后阴阳切换
// -------------------------------------------------

xd_juzhi:{
    enable:"phaseUse",
    usable:1,

    zhuanhuanji:true,
    mark:true,
    marktext:"☯",

    intro:{
        content:function(storage,player){
            if(player.storage.xd_juzhi){
                return "当前为阴：对所有其他角色各造成1点伤害，然后令一名其他角色回复1点体力。";
            }

            return "当前为阳：所有角色各回复1点体力，然后对一名角色造成1点伤害。";
        },
    },

    async content(event,trigger,player){

        // 保存发动前的状态
        // false = 阳
        // true  = 阴
        const yin=!!player.storage.xd_juzhi;

        // 发动后切换阴阳
        player.changeZhuanhuanji("xd_juzhi");


        // =========================
        // 阳
        // =========================
        if(!yin){

            const list=game.filterPlayer(function(current){
                return current.isIn();
            });

            // 所有角色各回复1点体力
            for(const current of list){

                if(
                    current.isIn() &&
                    current.hp<current.maxHp
                ){
                    await current.recover(1);
                }
            }

            // 然后选择一名角色造成1点伤害
            const result=await player
                .chooseTarget(
                    "拒止·阳：选择一名角色，对其造成1点伤害",
                    true,
                    function(card,player,target){
                        return target.isIn();
                    }
                )
                .forResult();

            if(
                result.bool &&
                result.targets &&
                result.targets.length
            ){
                await result.targets[0].damage(
                    1,
                    player
                );
            }

            return;
        }


        // =========================
        // 阴
        // =========================

        const others=game.filterPlayer(function(current){
            return (
                current!=player &&
                current.isIn()
            );
        });

        // 对所有其他角色各造成1点伤害
        for(const current of others){

            if(current.isIn()){
                await current.damage(
                    1,
                    player
                );
            }
        }

        // 伤害结算后，重新获取仍然存活的其他角色
        if(!game.hasPlayer(function(current){
            return (
                current!=player &&
                current.isIn()
            );
        })){
            return;
        }

        // 然后选择一名其他角色回复1点体力
        const result=await player
            .chooseTarget(
                "拒止·阴：选择一名其他角色，其回复1点体力",
                true,
                function(card,player,target){
                    return (
                        target!=player &&
                        target.isIn()
                    );
                }
            )
            .forResult();

        if(
            result.bool &&
            result.targets &&
            result.targets.length
        ){
            await result.targets[0].recover(1);
        }
    },

    ai:{
        order:7,
        result:{
            player:1,
        },
    },
},


// -------------------------------------------------
// PRTS
// -------------------------------------------------

xd_prts:{
    locked:true,
    forced:true,

    trigger:{
        player:"useCardAfter",
    },

    filter:function(event,player){

        // 必须是小度·思衡托
        if(
            player.name!="xiaodu_sihengtuo" &&
            player.name1!="xiaodu_sihengtuo"
        ){
            return false;
        }

        // 必须是当前客户端自己的角色
        if(player!=game.me){
            return false;
        }

        // 必须已经点击“托管”
        if(!_status.auto){
            return false;
        }

        if(!event.card){
            return false;
        }

        // 只在使用基本牌后触发
        return get.type(
            event.card,
            null,
            false
        )=="basic";
    },

    content:function(){
        "step 0"

        // 从牌堆里随机寻找一张非基本牌
        var list=[];

        var pile=ui.cardPile.childNodes;

        for(var i=0;i<pile.length;i++){

            var card=pile[i];

            if(
                card &&
                get.type(
                    card,
                    null,
                    false
                )!="basic"
            ){
                list.push(card);
            }
        }

        if(!list.length){
            event.finish();
            return;
        }

        event.xd_prts_card=
            list.randomGet();


        "step 1"

        player.gain(
            event.xd_prts_card,
            "gain2"
        );
    },
},


























	
			}
		
	


export default skills;
