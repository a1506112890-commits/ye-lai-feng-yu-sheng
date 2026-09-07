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
                1,
                "fire",
                source
            );

        }
        else{

            player.damage(
                1,
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
        player.storage.ys_maomao_count=0;
    },

    filter:function(event,player){

        if(event.name=="phase"){
            return true;
        }

        if(event.name=="damage"){

            if(
                typeof player.storage.ys_maomao_count!="number"
            ){
                player.storage.ys_maomao_count=0;
            }

            return player.storage.ys_maomao_count<2;
        }

        return false;
    },

    content:function(){

        if(trigger.name=="phase"){

            player.storage.ys_maomao_count=0;

        }
        else{

            if(
                typeof player.storage.ys_maomao_count!="number"
            ){
                player.storage.ys_maomao_count=0;
            }

            if(player.storage.ys_maomao_count<2){

                player.storage.ys_maomao_count++;

                player.recover(1);
            }
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

            // 无来源雷电伤害
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

            event.zd_list=game.filterPlayer();
            event.zd_index=0;

            game.countPlayer(function(current){
                current.say("什么鬼");
            });

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
        if(num==5){

            event.sf.say(
                "不是我害了你，是这个乱世害了你啊"
            );

            event.zd_all=game.filterPlayer();

            // 火伤目标
            event.zd_fire=
                event.zd_all.randomGet();

            // 回血目标
            event.zd_recover=
                event.zd_all.randomGet();

            // 翻面目标
            event.zd_turn=
                event.zd_all.randomGet();

            // 摸牌目标
            event.zd_draw=
                event.zd_all.randomGet();

            event.zd_fire.damage(
                1,
                "fire",
                "nosource"
            );

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

        "step 3"

        if(event.zd_index>=event.zd_list.length){
            event.finish();
            return;
        }

        event.zd_current=
            event.zd_list[event.zd_index];

        if(event.zd_current.countCards("he")>0){

            var card=
                event.zd_current.getCards("he").randomGet();

            event.zd_current.discard(card);
        }

        event.zd_index++;

        event.goto(3);


        // =================================================
        // 5点：剩下三个随机效果
        // =================================================

        "step 5"

        if(
            event.zd_recover &&
            event.zd_recover.isIn()
        ){
            event.zd_recover.recover(1);
        }

        "step 6"

        if(
            event.zd_turn &&
            event.zd_turn.isIn()
        ){
            event.zd_turn.turnOver();
        }

        "step 7"

        if(
            event.zd_draw &&
            event.zd_draw.isIn()
        ){
            event.zd_draw.draw(2);
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































	
			}
		
	


export default skills;
