game.import("character", function (lib, game, ui, get, ai, _status) {
    return {
        name: "diy_test",

        character: {
            diy_feitiandahama: [
                "male",
                "shen",
                5,
                ["jiangshi", "feihua", "huawu"]
            ],
        },

        skill: {

            jiangshi: {
                forced: true,
                trigger: {
                    source: "damageBegin1",
                },
                filter: function(event){
                    return event.player.name == "xiongshixiansheng";
                },
                content: function(){
                    trigger.num++;
                },
            },


            feihua:{
                enable:"phaseUse",
                usable:1,

                filterCard:function(card){
                    return get.type(card)=="equip";
                },

                position:"he",

                filterTarget:function(card,player,target){
                    return player!=target;
                },

                content:function(){

                    "step 1"

                    target.chooseCard(
                        "请选择一张牌弃置",
                        "he"
                    );

                    "step 2"

                    if(result.bool){

                        target.discard(result.cards[0]);

                    }

                },
            },


            huawu:{
                forced:true,

                trigger:{
                    player:"dying"
                },

                content:function(){

                    player.storage.huawu=true;

                },

            },


        },


        translate:{

            diy_feitiandahama:
            "飞天大蛤蟆",


            jiangshi:
            "降狮",

            jiangshi_info:
            "锁定技。你对雄狮先生造成伤害+1。",


            feihua:
            "飞蛤",

            feihua_info:
            "出牌阶段限一次，你可以弃置装备牌令目标弃置一张牌。",


            huawu:
            "画物",

            huawu_info:
            "特殊状态技能。",


        },


    };
});